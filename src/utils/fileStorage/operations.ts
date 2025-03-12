
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { Share } from '@capacitor/share';
import { getStoredFiles } from './registry';

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
