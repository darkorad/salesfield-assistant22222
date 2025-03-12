
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
    console.log(`Starting export process for file: ${fileName}`);
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

    // Create a direct download URL immediately for fallback
    const url = URL.createObjectURL(blob);
    let directDownloadTriggered = false;

    // Try primary export method first
    try {
      if (isMobile) {
        console.log('Using mobile export path for Android');
        // Show toast with direct download option immediately for mobile
        toast.info(`Započeto preuzimanje fajla`, {
          action: {
            label: 'Preuzmi direktno',
            onClick: () => {
              if (!directDownloadTriggered) {
                window.open(url, '_blank');
                directDownloadTriggered = true;
                toast.success('Fajl otvoren, sačuvajte ga na svoj uređaj');
              }
            }
          },
          duration: 15000
        });
        
        // On mobile devices, save to Downloads folder using Capacitor
        await exportFileMobile(blob, fileName);
        toast.success(`Fajl "${fileName}.xlsx" je uspešno sačuvan u Download folderu`, {
          description: "Proverite u Download ili 'Preuzimanja'/'Downloads' folderu, ili pogledajte u 'Moji fajlovi'/'Files' aplikaciji.",
          duration: 8000
        });
        console.log('Mobile export completed successfully');
      } else {
        console.log('Using web export path');
        // On web browsers, trigger immediate download
        exportFileWeb(blob, fileName);
        toast.success(`Fajl "${fileName}.xlsx" je preuzet i nalazi se u 'Downloads' ili 'Preuzimanja' folderu vašeg računara`, {
          duration: 8000
        });
        console.log('Web export completed successfully');
      }
      
      return true;
    } catch (primaryError) {
      console.error('Primary export method failed, using browser fallback:', primaryError);
      
      // GUARANTEED FALLBACK: Browser-based download approach
      // This is our most reliable fallback that works on both web and mobile
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      toast.info('Korišćenje sigurnog metoda preuzimanja...', {
        action: {
          label: 'Preuzmi direktno',
          onClick: () => {
            if (!directDownloadTriggered) {
              window.open(url, '_blank');
              directDownloadTriggered = true;
              toast.success('Fajl otvoren, sačuvajte ga na svoj uređaj');
            }
          }
        },
        duration: 15000
      });
      
      // Automatically trigger download
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 5000);
      
      // Show permanent download option in case auto-download fails
      toast.info(`Preuzimanje "${fileName}.xlsx"`, {
        action: {
          label: 'Preuzmi direktno',
          onClick: () => {
            if (!directDownloadTriggered) {
              window.open(url, '_blank');
              directDownloadTriggered = true;
              toast.success('Fajl otvoren, sačuvajte ga na svoj uređaj');
            }
          }
        },
        duration: 30000
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error exporting workbook:', error);
    toast.error(`Greška pri izvozu izveštaja: ${error instanceof Error ? error.message : String(error)}`);
    
    // Ultimate fallback - show persistent toast with download option
    try {
      console.log('Attempting ultimate fallback export method');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      
      toast.info('Ovo je vaš poslednji pokušaj preuzimanja fajla:', {
        action: {
          label: 'Preuzmi OVDE',
          onClick: () => {
            window.open(url, '_blank');
            toast.success('Fajl otvoren u novom tabu. Sačuvajte ga na svoj uređaj.');
          }
        },
        duration: 60000,
        dismissible: false
      });
    } catch (fallbackError) {
      console.error('All fallback methods failed:', fallbackError);
    }
    
    throw error;
  }
}
