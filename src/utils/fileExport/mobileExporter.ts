
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
    
    // Create a direct download URL for browser-fallback method
    const blobUrl = URL.createObjectURL(blob);
    
    // APPROACH 1: Try multi-path Download folder approach (most reliable)
    const downloadPaths = [
      'Download', 'Downloads', 'download', 'downloads', '', '.'
    ];
    
    let savedResult = null;
    let savedPath = '';
    
    // Try each download path until one works
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
        savedResult = result;
        savedPath = downloadPath || 'root';
        break; // Exit loop on success
      } catch (err) {
        console.warn(`Could not save to External/${downloadPath}:`, err);
        // Continue to next path
      }
    }
    
    if (savedResult) {
      // Try to share the file to make it more accessible
      try {
        await Share.share({
          title: 'Izvezeni izveštaj',
          text: `Izveštaj ${fileName}`,
          url: savedResult.uri,
          dialogTitle: 'Podelite ili sačuvajte izveštaj'
        });
      } catch (shareError) {
        console.warn('Could not share file, but it was saved:', shareError);
      }
      
      toast.success(`Fajl "${fileName}" uspešno sačuvan`, {
        description: `Lokacija: ${savedPath}/${fileName}. Otvorite 'Files' ili 'My Files' aplikaciju i proverite u Download folderu.`,
        duration: 8000
      });
      
      return;
    }
    
    // APPROACH 2: Try using Data directory and share the file immediately
    const dataResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    
    console.log('File saved to app data directory:', dataResult);
    
    // Try to share the file to make it directly accessible to user
    try {
      await Share.share({
        title: 'Izvezeni izveštaj',
        text: `Izveštaj ${fileName}`,
        url: dataResult.uri,
        dialogTitle: 'Podelite ili sačuvajte izveštaj'
      });
      
      toast.success(`Fajl "${fileName}" je spreman za deljenje`, {
        description: "Izaberite 'Sačuvaj na uređaj' opciju u meniju za deljenje.",
        duration: 8000
      });
      
      return;
    } catch (shareError) {
      console.warn('Could not share file, trying browser download:', shareError);
    }
    
    // APPROACH 3: Final fallback - browser download
    console.log('Using browser download fallback');
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      // Open in browser as last resort
      window.open(blobUrl, '_blank');
      
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 1000);
    
    toast.info(`Fajl "${fileName}" otvoren u browseru`, {
      description: "Sačuvajte ga koristeći opciju 'Sačuvaj kao' u browseru.",
      duration: 10000
    });
    
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    
    // Ultimate fallback - try to open directly in browser
    try {
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      toast.info(`Fajl "${fileName}" otvoren u browseru`, {
        description: "Sačuvajte ga koristeći opciju 'Sačuvaj kao' u browseru.",
        duration: 15000
      });
    } catch (browserError) {
      console.error('Browser fallback failed:', browserError);
    }
    
    throw error;
  }
}
