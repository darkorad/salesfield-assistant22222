
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { checkAndRequestPermissions } from './permissions';
import { blobToBase64 } from './utils';
import { Share } from '@capacitor/share';

/**
 * Exports a file on mobile platforms using Capacitor
 * Focuses on saving to the Downloads directory and sharing the file
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
    
    // Try to use the Download directory directly as the primary option
    try {
      // First try to save directly to Downloads folder (most user-visible location)
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
      
      console.log('File saved successfully to External directory:', result);
      toast.success(`Fajl "${fileName}" sačuvan u Downloads folderu`, {
        description: "Idite u My Files/Download da pristupite fajlu."
      });
      
      // Try to share the file to make it immediately accessible
      try {
        await Share.share({
          title: 'Izveštaj je spreman',
          text: `Izveštaj "${fileName}" je dostupan za pregled`,
          url: result.uri,
          dialogTitle: 'Otvori ili podeli izveštaj'
        });
      } catch (shareError) {
        console.error('Error sharing file, but file was saved:', shareError);
      }
      
      return;
    } catch (externalError) {
      console.error('Error saving to External directory:', externalError);
      
      // Fallback to Documents directory if External fails
      try {
        const result = await Filesystem.writeFile({
          path: `Download/${fileName}`, // Explicitly put in Download subfolder
          data: base64Data,
          directory: Directory.Documents,
          recursive: true
        });
        
        console.log('File saved successfully to Documents/Download directory:', result);
        toast.success(`Fajl "${fileName}" sačuvan u Download folderu`, {
          description: "Idite u Documents/Download da pristupite fajlu."
        });
        
        try {
          await Share.share({
            title: 'Izveštaj je spreman',
            text: `Izveštaj "${fileName}" je dostupan za pregled`,
            url: result.uri,
            dialogTitle: 'Otvori ili podeli izveštaj'
          });
        } catch (shareError) {
          console.error('Error sharing file from Documents directory:', shareError);
        }
        
        return;
      } catch (docsError) {
        console.error('Error saving to Documents directory:', docsError);
        
        // Last resort - try saving to data directory and share immediately
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data
        });
        
        toast.success(`Fajl "${fileName}" privremeno sačuvan`, {
          duration: 10000,
          description: "Kliknite na dugme da bi preuzeli fajl direktno"
        });
        
        // Always try to share from Data directory since it's not directly accessible
        try {
          await Share.share({
            title: 'Izveštaj je spreman',
            text: `Izveštaj "${fileName}" je dostupan za pregled`,
            url: result.uri,
            dialogTitle: 'Preuzmi izveštaj'
          });
        } catch (shareError) {
          console.error('Final share attempt failed:', shareError);
          
          toast.error(`Problem sa deljenjem fajla. Pokušajte ponovo kasnije.`);
        }
      }
    }
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
