
import { Filesystem, Directory, Encoding, GetUriResult, GetUriOptions } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Exports a workbook to an Excel file
 * Works on both web and mobile platforms
 */
export async function exportWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  try {
    // Generate the Excel file as an array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert array buffer to Blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Check if running on mobile
    const isMobile = 'Capacitor' in window;
    console.log('Is running on mobile:', isMobile);

    if (isMobile) {
      await exportFileMobile(blob, fileName);
    } else {
      exportFileWeb(blob, fileName);
    }

    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error exporting workbook:', error);
    toast.error(`Greška pri izvozu izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if we have permission to write to external storage on Android
 * and request it if necessary
 */
async function checkAndRequestPermissions() {
  try {
    // Check current permissions status
    const permResult = await Filesystem.checkPermissions();
    console.log('Current permissions status:', permResult);
    
    if (permResult.publicStorage !== 'granted') {
      console.log('Requesting storage permissions...');
      const requestResult = await Filesystem.requestPermissions();
      console.log('Permission request result:', requestResult);
      
      if (requestResult.publicStorage !== 'granted') {
        throw new Error('Potrebna je dozvola za pristup skladištu. Molimo omogućite u podešavanjima aplikacije.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Permission error:', error);
    throw error;
  }
}

/**
 * Exports a file on mobile platforms using Capacitor
 */
async function exportFileMobile(blob: Blob, fileName: string) {
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

    console.log('Saving file to Downloads directory:', fileName);
    
    // Try multiple directories in sequence until one works
    const directoriesToTry = [
      Directory.Documents,
      Directory.External,
      Directory.Data
    ];
    
    let saved = false;
    let savedPath = '';
    let savedDirectory = Directory.Documents;
    
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
        
        console.log(`File saved successfully to ${directory}:`, result.uri);
        saved = true;
        savedPath = result.uri || '';
        savedDirectory = directory;
        break;
      } catch (directoryError) {
        console.error(`Error saving to ${directory}:`, directoryError);
        continue; // Try next directory
      }
    }
    
    if (!saved) {
      throw new Error("Nije moguće sačuvati fajl ni u jednom direktorijumu. Proverite dozvole aplikacije.");
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
      console.warn('Could not get shareable URI, will use direct path:', uriError);
    }
    
    // Show success message with location
    toast.success(`Fajl sačuvan: ${fileName} u ${getDirectoryName(savedDirectory)}`);
    
    // Attempt to open the file if we have a URI
    if (savedPath) {
      try {
        console.log('Attempting to open file with URI:', savedPath);
        await Browser.open({
          url: savedPath
        });
      } catch (openError) {
        console.error('Could not open file, but it was saved:', openError);
        toast.info(`Fajl je sačuvan u ${getDirectoryName(savedDirectory)}. Koristite aplikaciju Fajlovi da ga pronađete.`);
      }
    }
  } catch (error) {
    console.error('Error in exportFileMobile:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get a readable directory name for toast messages
 */
function getDirectoryName(directory: Directory): string {
  switch (directory) {
    case Directory.Documents:
      return 'Documents';
    case Directory.External:
      return 'Downloads';
    case Directory.Data:
      return 'App Storage';
    default:
      return 'Storage';
  }
}

/**
 * Exports a file on web platforms using download link
 */
function exportFileWeb(blob: Blob, fileName: string) {
  // Add file extension if not present
  if (!fileName.toLowerCase().endsWith('.xlsx')) {
    fileName += '.xlsx';
  }
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Converts a Blob to a base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
