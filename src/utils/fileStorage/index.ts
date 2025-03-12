
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Share } from '@capacitor/share';
import { blobToBase64 } from '../fileExport/utils';

// Interface for stored file information
export interface StoredFile {
  id: string;
  name: string;
  path: string;
  date: string;
  type: string;
  size: number;
}

/**
 * Save an Excel workbook to app storage and return file info
 */
export const saveWorkbookToStorage = async (
  workbook: XLSX.WorkBook,
  fileName: string
): Promise<StoredFile | null> => {
  try {
    console.log('Saving workbook to app storage:', fileName);
    
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
    
    // Save file to app storage
    const result = await Filesystem.writeFile({
      path: `documents/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
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
    } catch (err) {
      console.warn('Could not get file size:', err);
    }
    
    // Return file information
    const fileInfo: StoredFile = {
      id: fileId,
      name: fileName,
      path: result.uri,
      date: new Date().toISOString(),
      type: 'xlsx',
      size: fileSize,
    };
    
    // Add to file registry
    await addFileToRegistry(fileInfo);
    
    return fileInfo;
  } catch (error) {
    console.error('Error saving workbook to storage:', error);
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Get all stored document files
 */
export const getStoredFiles = async (): Promise<StoredFile[]> => {
  try {
    // Create the documents directory if it doesn't exist
    try {
      await Filesystem.mkdir({
        path: 'documents',
        directory: Directory.Data,
        recursive: true
      });
    } catch (err) {
      // Directory might already exist, which is fine
      console.log('Directory exists or creation failed:', err);
    }
    
    // Try to read file registry first
    try {
      const result = await Filesystem.readFile({
        path: 'documents/registry.json',
        directory: Directory.Data
      });
      
      if (result && result.data) {
        const files = JSON.parse(result.data);
        // Sort files by date (newest first)
        return Array.isArray(files) ? files.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) : [];
      }
    } catch (err) {
      console.log('No file registry found, creating new one');
      // Registry doesn't exist yet, create it
      await Filesystem.writeFile({
        path: 'documents/registry.json',
        data: JSON.stringify([]),
        directory: Directory.Data
      });
      return [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting stored files:', error);
    toast.error('Greška pri učitavanju dokumenata');
    return [];
  }
};

/**
 * Add a file to the registry
 */
const addFileToRegistry = async (fileInfo: StoredFile): Promise<void> => {
  try {
    const files = await getStoredFiles();
    
    // Add new file
    files.unshift(fileInfo);
    
    // Save updated registry
    await Filesystem.writeFile({
      path: 'documents/registry.json',
      data: JSON.stringify(files),
      directory: Directory.Data
    });
  } catch (error) {
    console.error('Error adding file to registry:', error);
  }
};

/**
 * Delete a file from storage and registry
 */
export const deleteStoredFile = async (fileId: string): Promise<boolean> => {
  try {
    const files = await getStoredFiles();
    const fileToDelete = files.find(file => file.id === fileId);
    
    if (!fileToDelete) {
      return false;
    }
    
    // Delete the file
    await Filesystem.deleteFile({
      path: `documents/${fileToDelete.name}`,
      directory: Directory.Data
    });
    
    // Update registry
    const updatedFiles = files.filter(file => file.id !== fileId);
    await Filesystem.writeFile({
      path: 'documents/registry.json',
      data: JSON.stringify(updatedFiles),
      directory: Directory.Data
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Share a file from storage
 */
export const shareStoredFile = async (fileId: string): Promise<boolean> => {
  try {
    const files = await getStoredFiles();
    const fileToShare = files.find(file => file.id === fileId);
    
    if (!fileToShare) {
      return false;
    }
    
    // Share the file
    await Share.share({
      title: fileToShare.name,
      url: fileToShare.path,
      dialogTitle: 'Podeli dokument'
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing file:', error);
    toast.error(`Greška pri deljenju fajla: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

/**
 * Open a file from storage in the browser
 */
export const openStoredFile = async (fileId: string): Promise<boolean> => {
  try {
    const files = await getStoredFiles();
    const fileToOpen = files.find(file => file.id === fileId);
    
    if (!fileToOpen) {
      return false;
    }
    
    // Get file content
    const result = await Filesystem.readFile({
      path: `documents/${fileToOpen.name}`,
      directory: Directory.Data
    });
    
    if (!result || !result.data) {
      return false;
    }
    
    // Make sure result.data is a string before proceeding
    if (typeof result.data !== 'string') {
      throw new Error('Failed to read file data as string');
    }
    
    // Convert base64 to blob
    const byteCharacters = atob(result.data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create and open download link
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error opening file:', error);
    toast.error(`Greška pri otvaranju fajla: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};
