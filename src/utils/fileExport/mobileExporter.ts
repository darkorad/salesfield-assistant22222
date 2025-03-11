
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
    
    // First, try the most compatible approach for modern Android
    try {
      // Try all possible download directory names
      const downloadPaths = [
        'Download', 'Downloads', 'download', 'downloads'
      ];
      
      let savedResult = null;
      
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
          break; // Exit loop on success
        } catch (err) {
          console.warn(`Could not save to External/${downloadPath}:`, err);
          // Continue to next path
        }
      }
      
      if (savedResult) {
        toast.success(`Fajl "${fileName}" sačuvan`, {
          description: "Pogledajte u Download/Preuzimanja folderu ili 'Moji fajlovi'/'My Files' aplikaciji.",
          duration: 8000
        });
        
        // Try to share the file to make it immediately accessible
        try {
          await Share.share({
            title: 'Izveštaj je spreman',
            text: `Izveštaj "${fileName}" je dostupan za pregled`,
            url: savedResult.uri,
            dialogTitle: 'Otvori ili podeli izveštaj'
          });
        } catch (shareError) {
          console.error('Error sharing file, but file was saved:', shareError);
        }
        
        return;
      }
    } catch (externalError) {
      console.error('Error with all External directory attempts:', externalError);
    }
    
    // Second approach: Try Documents directory
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log('File saved successfully to Documents directory:', result);
      
      toast.success(`Fajl "${fileName}" sačuvan u Documents folderu`, {
        description: "Pogledajte 'Documents' folder u 'Moji fajlovi'/'My Files' aplikaciji.",
        duration: 8000
      });
      
      try {
        await Share.share({
          title: 'Izveštaj je spreman',
          text: `Izveštaj "${fileName}" je dostupan za pregled`,
          url: result.uri,
          dialogTitle: 'Otvori ili podeli izveštaj'
        });
      } catch (shareError) {
        console.error('Error sharing file from Documents:', shareError);
      }
      
      return;
    } catch (docsError) {
      console.error('Error saving to Documents directory:', docsError);
    }
    
    // Last resort - save to Data directory
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    
    console.log('File saved to app data directory:', result);
    
    toast.info(`Fajl "${fileName}" privremeno sačuvan`, {
      description: "Za pristup fajlu, koristite dugme ispod za otvaranje",
      duration: 10000,
      action: {
        label: "Otvori fajl",
        onClick: async () => {
          try {
            await Share.share({
              title: 'Izveštaj je spreman',
              text: `Izveštaj "${fileName}"`,
              url: result.uri,
              dialogTitle: 'Otvori izveštaj'
            });
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
    throw error;
  }
}
