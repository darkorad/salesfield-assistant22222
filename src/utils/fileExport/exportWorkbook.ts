
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { exportFileMobile } from './mobileExporter';
import { exportFileWeb } from './webExporter';

/**
 * Exports a workbook to an Excel file
 * Works on both web and mobile platforms, with improved reliability
 */
export async function exportWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  try {
    toast.info(`Priprema fajla "${fileName}.xlsx" za preuzimanje...`);
    
    // Generate the Excel file as an array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert array buffer to Blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Check if running on mobile (Capacitor environment)
    const isMobile = 'Capacitor' in window;
    console.log('Is running on mobile/Capacitor:', isMobile);

    if (isMobile) {
      console.log('Using mobile export path for Android');
      // On mobile devices, save to Downloads folder using Capacitor
      await exportFileMobile(blob, fileName);
      console.log('Mobile export completed');
    } else {
      console.log('Using web export path');
      // On web browsers, trigger immediate download
      exportFileWeb(blob, fileName);
      toast.success(`Fajl "${fileName}.xlsx" je uspešno preuzet`);
      console.log('Web export completed');
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting workbook:', error);
    toast.error(`Greška pri izvozu izveštaja: ${error instanceof Error ? error.message : String(error)}`);
    
    // Provide fallback download option if primary method fails
    try {
      if (!('Capacitor' in window)) {
        // Fallback method for web browsers
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = URL.createObjectURL(blob);
        
        toast.info('Pokušavam alternativni način preuzimanja...', {
          action: {
            label: 'Preuzmi',
            onClick: () => {
              window.open(url, '_blank');
            }
          },
          duration: 10000
        });
      }
    } catch (fallbackError) {
      console.error('Fallback download failed:', fallbackError);
    }
    
    throw error;
  }
}
