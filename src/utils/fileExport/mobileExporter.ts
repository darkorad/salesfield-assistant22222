
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
    
    // Use a consistent storage approach - Documents directory first 
    try {
      // Try to save to documents - most accessible location
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log('File saved successfully to Documents directory:', result);
      
      // Check if we can share the file directly
      try {
        // After saving, open share sheet so user can immediately see and share the file
        await Share.share({
          title: 'Izvoz završen',
          text: `Izveštaj "${fileName}" je spreman`,
          url: result.uri,
          dialogTitle: 'Podeli ili otvori izveštaj'
        });
        
        toast.success(`Fajl "${fileName}" sačuvan`, {
          description: "Fajl je otvoren za pregled ili deljenje."
        });
      } catch (shareError) {
        console.error('Error sharing file:', shareError);
        
        // If sharing fails, provide detailed location info
        toast.success(`Fajl "${fileName}" sačuvan u Documents folderu`, {
          duration: 10000,
          description: "Idite na Files/My Files/Documents da pronađete fajl. Takođe možete koristiti file manager aplikaciju."
        });
      }
      
      return;
    } catch (error) {
      console.error('Error saving to Documents directory:', error);
      
      // Fallback to External directory (should work on most Android devices)
      try {
        const result = await Filesystem.writeFile({
          path: `Download/${fileName}`, // Explicitly use Download folder
          data: base64Data,
          directory: Directory.External,
          recursive: true
        });
        
        console.log('File saved successfully to External/Download directory:', result);
        
        // Try to share the file after saving
        try {
          await Share.share({
            title: 'Izvoz završen',
            text: `Izveštaj "${fileName}" je spreman`,
            url: result.uri,
            dialogTitle: 'Podeli ili otvori izveštaj'
          });
          
          toast.success(`Fajl "${fileName}" sačuvan u Downloads folderu`, {
            description: "Fajl je otvoren za pregled ili deljenje."
          });
        } catch (shareError) {
          console.error('Error sharing file:', shareError);
          
          toast.success(`Fajl "${fileName}" sačuvan u Downloads folderu`, {
            duration: 10000,
            description: "Idite na My Files/Download da pronađete fajl."
          });
        }
        
        return;
      } catch (externalError) {
        console.error('Error saving to External directory:', externalError);
        
        // Last resort - try saving to app's private Data directory and immediately share
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data
        });
        
        console.log('File saved to app private directory:', result);
        
        // Always try to share the file if we saved to private directory
        try {
          await Share.share({
            title: 'Izvoz završen',
            text: `Izveštaj "${fileName}" je spreman`,
            url: result.uri,
            dialogTitle: 'Podeli ili otvori izveštaj'
          });
          
          toast.success(`Fajl "${fileName}" je dostupan`, {
            description: "Fajl je dostupan za pregled ili deljenje."
          });
        } catch (shareError) {
          console.error('Error sharing file from private directory:', shareError);
          
          toast.success(`Fajl "${fileName}" sačuvan`, {
            duration: 10000,
            description: "Fajl je sačuvan, ali je u privatnom prostoru aplikacije. Koristite opciju izvoza podataka u podešavanjima da pristupite fajlovima."
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    
    // Display more information to help debug
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
    }
    
    throw error;
  }
}
