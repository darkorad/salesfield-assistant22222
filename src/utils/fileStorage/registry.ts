
import { Filesystem, Directory } from '@capacitor/filesystem';
import { StoredFile } from './types';

/**
 * Get all stored document files from the registry
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
        // Ensure that data is a string before parsing
        const data = typeof result.data === 'string' ? result.data : '';
        const files = JSON.parse(data);
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
        directory: Directory.Data,
        recursive: true
      });
      return [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting stored files:', error);
    return [];
  }
};

/**
 * Add a file to the registry
 */
export const addFileToRegistry = async (fileInfo: StoredFile): Promise<void> => {
  try {
    const files = await getStoredFiles();
    
    // Add new file
    files.unshift(fileInfo);
    
    // Save updated registry
    await Filesystem.writeFile({
      path: 'documents/registry.json',
      data: JSON.stringify(files),
      directory: Directory.Data,
      recursive: true
    });
  } catch (error) {
    console.error('Error adding file to registry:', error);
  }
};
