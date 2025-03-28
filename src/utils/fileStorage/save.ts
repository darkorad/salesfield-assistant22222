
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { blobToBase64 } from '../fileExport/utils';
import { StoredFile } from './types';
import { addFileToRegistry } from './registry';

/**
 * Save an Excel workbook to app storage and return file info
 */
export const saveWorkbookToStorage = async (
  workbook: XLSX.WorkBook,
  fileName: string
): Promise<StoredFile | null> => {
  try {
    console.log('Saving workbook to app storage:', fileName);
    
    // Add current date to the filename if not already included
    if (!fileName.match(/\d{2}-\d{2}-\d{4}/)) {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      fileName = `${fileName}-${day}-${month}-${year}`;
    }
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }
    
    // Generate a unique ID for the file
    const fileId = Date.now().toString();
    
    // Convert workbook to blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Make sure base64Data is a string before proceeding
    if (typeof base64Data !== 'string') {
      throw new Error('Failed to convert file to base64 string');
    }
    
    // Ensure the document directory exists
    console.log("Creating documents directory if it doesn't exist");
    try {
      await Filesystem.mkdir({
        path: 'documents',
        directory: Directory.Data,
        recursive: true
      });
    } catch (err) {
      console.log("Directory might already exist, continuing", err);
    }
    
    // Save the file to the documents directory with more debugging
    console.log(`Attempting to save file: documents/${fileName}`);
    const result = await Filesystem.writeFile({
      path: `documents/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });
    
    console.log('File saved successfully:', result);
    
    // Get file size if possible
    let fileSize = 0;
    try {
      const fileInfo = await Filesystem.stat({
        path: `documents/${fileName}`,
        directory: Directory.Data
      });
      fileSize = fileInfo.size;
      console.log('File size retrieved:', fileSize);
    } catch (err) {
      console.warn('Could not get file size:', err);
    }
    
    // Return file information
    const fileInfo: StoredFile = {
      id: fileId,
      name: fileName,
      path: result.uri || `file://documents/${fileName}`,
      date: new Date().toISOString(),
      type: 'xlsx',
      size: fileSize,
    };
    
    // Add to file registry
    console.log('Adding file to registry:', fileInfo);
    await addFileToRegistry(fileInfo);
    
    // Display a toast with more detailed information
    toast.success(`Fajl "${fileName}" je uspešno sačuvan`, {
      description: "Dokument možete pronaći u sekciji 'Dokumenti'",
      duration: 8000,
    });
    
    return fileInfo;
  } catch (error) {
    console.error('Error saving workbook to storage:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
