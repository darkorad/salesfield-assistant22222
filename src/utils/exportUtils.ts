
import { Filesystem, Directory } from '@capacitor/filesystem';
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
    toast.error("Greška pri izvozu izveštaja");
  }
}

/**
 * Exports a file on mobile platforms using Capacitor
 */
async function exportFileMobile(blob: Blob, fileName: string) {
  try {
    console.log('Starting mobile export process');
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }

    console.log('Saving file to Documents directory:', fileName);
    // Write file to downloads directory
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true
    });

    console.log('File saved to:', result.uri);
    
    // Show toast with file location
    toast.success(`Fajl sačuvan u Documents/${fileName}`);

    // Attempt to open the file
    if (result.uri) {
      try {
        console.log('Attempting to open file with URI:', result.uri);
        await Browser.open({
          url: result.uri
        });
      } catch (error) {
        console.error('Could not open file, but it was saved:', error);
      }
    }
  } catch (error) {
    console.error('Error saving file on mobile:', error);
    throw error;
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
