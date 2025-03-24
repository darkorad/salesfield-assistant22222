
import { Filesystem, Directory } from '@capacitor/filesystem';
import { StoredFile } from './types';

/**
 * Get all stored document files from the registry
 */
export const getStoredFiles = async (): Promise<StoredFile[]> => {
  try {
    console.log('Getting stored files from registry');
    
    // Ensure the documents directory exists
    try {
      await Filesystem.mkdir({
        path: 'documents',
        directory: Directory.Data,
        recursive: true
      });
      console.log('Ensured documents directory exists');
    } catch (err) {
      // Directory might already exist, which is fine
      console.log('Directory might already exist:', err);
    }
    
    let registryData;
    
    try {
      // Try to read the registry file
      const result = await Filesystem.readFile({
        path: 'documents/registry.json',
        directory: Directory.Data
      });
      
      registryData = result.data;
      console.log('Registry data read successfully');
    } catch (error) {
      console.log('Registry file not found, creating new one:', error);
      
      // Create a new registry file if it doesn't exist
      await Filesystem.writeFile({
        path: 'documents/registry.json',
        data: JSON.stringify([]),
        directory: Directory.Data
      });
      
      console.log('Created new registry file');
      return [];
    }
    
    // Parse registry data
    if (registryData) {
      try {
        // Ensure that data is a string before parsing
        const data = typeof registryData === 'string' ? registryData : '';
        const files = JSON.parse(data);
        
        // Sort files by date (newest first)
        return Array.isArray(files) ? files.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) : [];
      } catch (parseError) {
        console.error('Error parsing registry JSON:', parseError);
        return [];
      }
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
    // Get existing files
    const files = await getStoredFiles();
    
    // Add new file
    files.unshift(fileInfo);
    
    console.log(`Adding file to registry. Registry now has ${files.length} files.`);
    
    // Save updated registry
    await Filesystem.writeFile({
      path: 'documents/registry.json',
      data: JSON.stringify(files),
      directory: Directory.Data
    });
    
    console.log('Registry updated successfully');
  } catch (error) {
    console.error('Error adding file to registry:', error);
  }
};
