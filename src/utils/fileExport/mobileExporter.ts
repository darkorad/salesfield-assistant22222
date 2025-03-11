
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
      throw new Error("Nije moguće sačuvati fajl. Proverite da li ste dozvolili pristup skladištu u podešavanjima aplikacije. Pokušajte deinstalirati i ponovo instalirati aplikaciju.");
    }
    
    // Try to get a shareable URI for the file
    try {
      if (savedPath) {
        const options: GetUriOptions = {
          path: fileName,
          directory: savedDirectory
        };
        
        const uriResult = await Filesystem.getUri(options);
        if (uriResult && uriResult.uri) {
          savedPath = uriResult.uri;
          console.log('Got shareable URI:', savedPath);
        }
      }
    } catch (uriError) {
      console.warn('Could not get shareable URI:', uriError);
    }
    
    // Show success message with location
    toast.success(`Izveštaj sačuvan u ${getDirectoryName(savedDirectory)}: ${fileName}`);
    
    // Attempt to open the file if we have a URI
    if (savedPath) {
      try {
        console.log('Attempting to open file with URI:', savedPath);
        await Browser.open({
          url: savedPath
        });
      } catch (openError) {
        console.error('Could not open file:', openError);
        toast.info(`Izveštaj je sačuvan u ${getDirectoryName(savedDirectory)} folderu. Koristite File Manager aplikaciju da ga pronađete.`);
      }
    }
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
