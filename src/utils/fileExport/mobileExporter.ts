
import { Filesystem, Directory, GetUriOptions } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { toast } from 'sonner';
import { checkAndRequestPermissions } from './permissions';
import { blobToBase64, getDirectoryName } from './utils';

/**
 * Exports a file on mobile platforms using Capacitor
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
    
    // Try multiple directories in sequence until one works
    const directoriesToTry = [
      Directory.External,  // Try External (Download) first
      Directory.Documents,
      Directory.Data
    ];
    
    let saved = false;
    let savedPath = '';
    let savedDirectory = Directory.External;
    
    // Try each directory until one works
    for (const directory of directoriesToTry) {
      try {
        console.log(`Attempting to save to ${directory} directory...`);
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: directory,
          recursive: true
        });
        
        console.log(`File saved successfully to ${directory}:`, result);
        saved = true;
        savedPath = result.uri || '';
        savedDirectory = directory;
        break;
      } catch (directoryError) {
        console.error(`Error saving to ${directory}:`, directoryError);
        // Log more detailed error information
        if (directoryError instanceof Error) {
          console.error('Error details:', directoryError.message, directoryError.stack);
        }
        continue; // Try next directory
      }
    }
    
    if (!saved) {
      throw new Error("Nije moguće sačuvati fajl. Proverite da li ste dozvolili pristup skladištu u podešavanjima aplikacije.");
    }
    
    // Show success message with location without trying to open the file
    toast.success(`Izveštaj sačuvan u ${getDirectoryName(savedDirectory)}: ${fileName}`);
    
    // We won't try to open the file directly, as this causes the browser to open the URI which may not work properly
    return;
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
