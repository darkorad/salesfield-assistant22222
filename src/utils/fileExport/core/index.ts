
// Core export functionality
import { exportToMobile } from './mobileExport';
import { exportToWeb } from './webExport';
import { WorkbookExportOptions } from './types';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Determines the platform and exports the workbook accordingly
 */
export async function exportWorkbook(
  workbook: XLSX.WorkBook, 
  fileName: string,
  options?: WorkbookExportOptions
): Promise<boolean> {
  try {
    console.log(`Starting export process for file: ${fileName}`);
    toast.info(`Priprema fajla "${fileName}.xlsx" za preuzimanje...`);
    
    // Generate the Excel file as an array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert array buffer to Blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Add extension if missing
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }

    // Check if running on mobile (Capacitor environment)
    const isMobile = 'Capacitor' in window;
    console.log('Is running on mobile/Capacitor:', isMobile);

    // Try primary export method based on platform
    try {
      if (isMobile) {
        return await exportToMobile(blob, fileName, options);
      } else {
        return await exportToWeb(blob, fileName, options);
      }
    } catch (primaryError) {
      console.error('Primary export method failed, using fallback:', primaryError);
      
      // Use the universal fallback method
      return await useUniversalFallback(blob, fileName);
    }
  } catch (error) {
    console.error('Error in exportWorkbook:', error);
    toast.error(`Greška pri izvozu: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Universal fallback method that works on both platforms
 */
async function useUniversalFallback(blob: Blob, fileName: string): Promise<boolean> {
  try {
    console.log('Using universal browser fallback for download');
    
    // Create direct download URL
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download element
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Trigger download
    a.click();
    
    // Show persistent download option
    toast.info(`Preuzimanje "${fileName}"`, {
      action: {
        label: 'Preuzmi direktno',
        onClick: () => {
          window.open(url, '_blank');
          toast.success('Fajl otvoren, sačuvajte ga na svoj uređaj');
        }
      },
      duration: 30000
    });
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('Universal fallback failed:', error);
    return false;
  }
}

// Re-export all related types and utilities
export type { WorkbookExportOptions } from './types';
export { createDownloadUrl } from './utils';
