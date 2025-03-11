
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
    console.log('Starting mobile export process');
    
    // First check/request permissions
    await checkAndRequestPermissions();
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }

    console.log('Attempting to save file:', fileName);
    
    // Explicitly focus on saving to Downloads (External directory)
    try {
      const result = await Filesystem.writeFile({
        path: `Downloads/${fileName}`,  // Explicitly put in Downloads subfolder
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
      
      console.log('File saved successfully to Downloads:', result);
      
      toast.success(`Fajl "${fileName}" sačuvan u Download folderu`, {
        duration: 5000,
        description: "Proverite u vašem fajl menadžeru."
      });
      
      return;
    } catch (directoryError) {
      console.error('Error saving to Downloads:', directoryError);
      // If that fails, try saving directly to root of External storage
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
      
      console.log('File saved successfully to External storage root:', result);
      
      toast.success(`Fajl "${fileName}" sačuvan u External folderu`, {
        duration: 5000,
        description: "Proverite u vašem fajl menadžeru."
      });
      
      return;
    }
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
