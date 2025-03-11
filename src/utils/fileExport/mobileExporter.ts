
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { checkAndRequestPermissions } from './permissions';
import { blobToBase64 } from './utils';

/**
 * Exports a file on mobile platforms using Capacitor
 * Focuses on saving to the Downloads directory
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
    
    // Android-specific approach for Downloads folder
    try {
      // Try to save directly to downloads - best approach for Android
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log('File saved successfully to Documents directory:', result);
      
      toast.success(`Fajl "${fileName}" sačuvan`, {
        duration: 7000,
        description: "Proverite u vašem Downloads folderu ili Documents folderu."
      });
      
      return;
    } catch (error) {
      console.error('Error saving to Documents directory:', error);
      
      // Fallback to External directory root (should work on most Android devices)
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.External,
          recursive: true
        });
        
        console.log('File saved successfully to External directory root:', result);
        
        toast.success(`Fajl "${fileName}" sačuvan`, {
          duration: 7000,
          description: "Proverite u root folderu vašeg uređaja ili u Downloads folderu."
        });
        
        return;
      } catch (externalError) {
        console.error('Error saving to External directory:', externalError);
        
        // Last resort - try saving to app's private Data directory
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data
        });
        
        console.log('File saved to app private directory as last resort:', result);
        
        toast.success(`Fajl "${fileName}" sačuvan u privatnom direktorijumu aplikacije`, {
          duration: 7000,
          description: "Koristite File Manager aplikaciju da pronađete fajl."
        });
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
