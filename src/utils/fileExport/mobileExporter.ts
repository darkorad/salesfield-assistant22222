
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { checkAndRequestPermissions } from './permissions';
import { blobToBase64 } from './utils';
import { Share } from '@capacitor/share';

/**
 * Exports a file on mobile platforms using Capacitor
 * Uses multiple approaches to ensure file is saved to an accessible location
 */
export async function exportFileMobile(blob: Blob, fileName: string) {
  try {
    console.log('Starting mobile export process for Android');
    
    // First check/request permissions
    await checkAndRequestPermissions();
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }

    console.log('Attempting to save file on Android:', fileName);
    
    // APPROACH 1: Try Direct Download folder paths
    // This is most reliable on newer Android versions
    try {
      const downloadPaths = [
        'Download', 'Downloads', 'download', 'downloads'
      ];
      
      let savedResult = null;
      let savedPath = '';
      
      // Try each download path until one works
      for (const downloadPath of downloadPaths) {
        try {
          const result = await Filesystem.writeFile({
            path: `${downloadPath}/${fileName}`,
            data: base64Data,
            directory: Directory.External,
            recursive: true
          });
          
          console.log(`File saved successfully to External/${downloadPath} directory:`, result);
          savedResult = result;
          savedPath = downloadPath;
          break; // Exit loop on success
        } catch (err) {
          console.warn(`Could not save to External/${downloadPath}:`, err);
          // Continue to next path
        }
      }
      
      if (savedResult) {
        toast.success(`Fajl "${fileName}" uspešno sačuvan`, {
          description: `Lokacija: ${savedPath}/${fileName}. Otvorite 'Files' ili 'My Files' aplikaciju i proverite u Download folderu.`,
          duration: 8000
        });
        
        // Show additional help notification after a delay
        setTimeout(() => {
          toast.info("Kako pronaći izvezeni fajl", {
            description: "Otvorite aplikaciju za fajlove na vašem telefonu i idite u Downloads/Download folder ili pogledajte u internoj memoriji uređaja.",
            duration: 10000,
            action: {
              label: "Razumem",
              onClick: () => {}
            }
          });
        }, 2000);
        
        return;
      }
    } catch (externalError) {
      console.error('Error with External directory attempts:', externalError);
    }
    
    // APPROACH 2: Try using Documents directory
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log('File saved successfully to Documents directory:', result);
      
      toast.success(`Fajl "${fileName}" sačuvan u Documents folderu`, {
        description: "Otvorite 'Files' ili 'My Files' aplikaciju i pogledajte u Documents folderu.",
        duration: 8000
      });
      
      // Show specific file location guidance
      toast.info("Kako pronaći izvezeni fajl", {
        description: "Otvorite aplikaciju za fajlove na telefonu, idite u 'Documents' folder.",
        duration: 10000
      });
      
      return;
    } catch (docsError) {
      console.error('Error saving to Documents directory:', docsError);
    }
    
    // APPROACH 3: Last resort - use Data directory and allow user to share file
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    
    console.log('File saved to app data directory:', result);
    
    toast.info(`Fajl "${fileName}" privremeno sačuvan`, {
      description: "Za pristup fajlu, koristite dugme ispod:",
      duration: 10000,
      action: {
        label: "Otvori/Podeli",
        onClick: async () => {
          try {
            // Try to share the file
            const uri = result.uri;
            // Open the file directly if possible
            window.open(uri, '_blank');
            
            // Fallback to copy to clipboard
            const tempInput = document.createElement('input');
            tempInput.value = uri;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            toast.success("Putanja do fajla je kopirana u clipboard");
          } catch (error) {
            console.error('Error opening file:', error);
            toast.error("Nije moguće otvoriti fajl");
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    
    // Ultimate fallback - try to download as regular browser download
    try {
      toast.info("Pokušaj direktnog preuzimanja...", {
        duration: 6000
      });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (fallbackError) {
      console.error('Fallback download failed:', fallbackError);
    }
    
    throw error;
  }
}
