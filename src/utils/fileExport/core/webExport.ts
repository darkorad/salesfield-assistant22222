
import { toast } from 'sonner';
import { WorkbookExportOptions } from './types';
import { createDownloadUrl } from './utils';

/**
 * Exports a file on web platforms
 */
export async function exportToWeb(
  blob: Blob, 
  fileName: string,
  options?: WorkbookExportOptions
): Promise<boolean> {
  try {
    console.log('Using web export path for file:', fileName);
    
    // Create download URL
    const url = createDownloadUrl(blob);
    
    // METHOD 1: Create a download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Force download by simulating a direct click
    document.body.appendChild(a);
    a.click();
    
    if (options?.showToasts !== false) {
      toast.success(`Fajl "${fileName}" je preuzet i nalazi se u 'Downloads' ili 'Preuzimanja' folderu vašeg računara`, {
        duration: 8000
      });
    }
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 2000);
    
    // METHOD 2: Try the File System Access API if available (modern browsers)
    if ('showSaveFilePicker' in window) {
      try {
        setTimeout(async () => {
          // @ts-ignore - TypeScript might not recognize this API yet
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'Excel Files',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                },
              },
            ],
          });
          
          // @ts-ignore
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('File saved successfully using File System Access API');
        }, 500);
      } catch (fsaError) {
        console.log('File System Access API not available or user cancelled', fsaError);
        // Continue with the normal download method
      }
    }
    
    // Call success callback if provided
    if (options?.onSuccess) {
      options.onSuccess();
    }
    
    return true;
  } catch (error) {
    console.error('Error in web export:', error);
    
    // Call error callback if provided
    if (options?.onError) {
      options.onError(error);
    }
    
    throw error;
  }
}
