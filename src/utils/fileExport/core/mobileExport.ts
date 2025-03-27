
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { checkAndRequestPermissions } from '../permissions';
import { blobToBase64 } from '../utils';
import { WorkbookExportOptions } from './types';

/**
 * Exports a file on mobile platforms
 */
export async function exportToMobile(
  blob: Blob, 
  fileName: string,
  options?: WorkbookExportOptions
): Promise<boolean> {
  try {
    console.log('Starting mobile export process for file:', fileName);
    
    // First check/request permissions
    await checkAndRequestPermissions();
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Show dismissible toast with direct download option
    if (options?.showToasts !== false) {
      const blobUrl = URL.createObjectURL(blob);
      
      toast.info(`Započeto preuzimanje fajla`, {
        action: {
          label: 'Preuzmi direktno',
          onClick: () => {
            window.open(blobUrl, '_blank');
            toast.success('Fajl otvoren, sačuvajte ga na svoj uređaj', {
              dismissible: true,
              duration: 3000
            });
          }
        },
        duration: 5000,
        dismissible: true
      });
    }
    
    // Try to save using multiple methods
    const success = await tryMultipleSaveMethods(fileName, base64Data, options);
    
    // Call success callback if provided
    if (success && options?.onSuccess) {
      options.onSuccess();
    } else if (success) {
      // If no callback provided but save was successful, try sharing
      try {
        // Attempt to share the file
        await Share.share({
          title: 'Izvezeni izveštaj',
          text: `Izveštaj ${fileName}`,
          dialogTitle: 'Podelite ili sačuvajte izveštaj'
        });
      } catch (shareError) {
        console.warn('Could not share file after saving:', shareError);
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error in exportToMobile:', error);
    
    // Call error callback if provided
    if (options?.onError) {
      options.onError(error);
    }
    
    throw error;
  }
}

/**
 * Tries multiple methods to save the file on mobile
 */
async function tryMultipleSaveMethods(
  fileName: string, 
  base64Data: string,
  options?: WorkbookExportOptions
): Promise<boolean> {
  // APPROACH 1: Try multi-path Download folder approach
  const result = await trySaveToDownloads(fileName, base64Data, options);
  if (result.success) {
    return true;
  }
  
  // APPROACH 2: Try Data directory with immediate sharing
  const dataResult = await trySaveToDataAndShare(fileName, base64Data, options);
  if (dataResult.success) {
    return true;
  }
  
  // All approaches failed
  return false;
}

/**
 * Tries to save the file to various download paths
 */
async function trySaveToDownloads(
  fileName: string, 
  base64Data: string,
  options?: WorkbookExportOptions
): Promise<{success: boolean, path?: string}> {
  const downloadPaths = [
    'Download', 'Downloads', 'download', 'downloads', '', '.'
  ];
  
  for (const downloadPath of downloadPaths) {
    try {
      const path = downloadPath ? `${downloadPath}/${fileName}` : fileName;
      const result = await Filesystem.writeFile({
        path: path,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
      
      console.log(`File saved successfully to External/${downloadPath} directory:`, result);
      
      // Try to share the file to make it more accessible
      try {
        await Share.share({
          title: 'Izvezeni izveštaj',
          text: `Izveštaj ${fileName}`,
          url: result.uri,
          dialogTitle: 'Podelite ili sačuvajte izveštaj'
        });
      } catch (shareError) {
        console.warn('Could not share file, but it was saved:', shareError);
      }
      
      if (options?.showToasts !== false) {
        toast.success(`Fajl "${fileName}" uspešno sačuvan`, {
          description: `Lokacija: ${downloadPath || 'root'}/${fileName}. Otvorite 'Files' ili 'My Files' aplikaciju i proverite u Download folderu.`,
          duration: 5000,
          dismissible: true
        });
      }
      
      return { success: true, path: downloadPath };
    } catch (err) {
      console.warn(`Could not save to External/${downloadPath}:`, err);
      // Continue to next path
    }
  }
  
  return { success: false };
}

/**
 * Tries to save to app data directory and share immediately
 */
async function trySaveToDataAndShare(
  fileName: string, 
  base64Data: string,
  options?: WorkbookExportOptions
): Promise<{success: boolean}> {
  try {
    const dataResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    
    console.log('File saved to app data directory:', dataResult);
    
    // Try to share the file to make it directly accessible to user
    await Share.share({
      title: 'Izvezeni izveštaj',
      text: `Izveštaj ${fileName}`,
      url: dataResult.uri,
      dialogTitle: 'Podelite ili sačuvajte izveštaj'
    });
    
    if (options?.showToasts !== false) {
      toast.success(`Fajl "${fileName}" je spreman za deljenje`, {
        description: "Izaberite 'Sačuvaj na uređaj' opciju u meniju za deljenje.",
        duration: 5000,
        dismissible: true
      });
    }
    
    return { success: true };
  } catch (error) {
    console.warn('Could not save to app data directory:', error);
    return { success: false };
  }
}
