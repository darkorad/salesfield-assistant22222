
import { Filesystem, Directory } from '@capacitor/filesystem';
import { StoredFile } from './types';

/**
 * Get all stored document files from the registry
 */
export const getStoredFiles = async (): Promise<StoredFile[]> => {
  try {
    console.log('Getting stored files from registry');
    
    // Create multiple possible document directories to ensure at least one exists
    const documentDirectories = [
      { path: 'documents', directory: Directory.Data },
      { path: 'Documents', directory: Directory.Data }
    ];
    
    for (const dir of documentDirectories) {
      try {
        await Filesystem.mkdir({
          path: dir.path,
          directory: dir.directory,
          recursive: true
        });
        console.log(`Ensured directory exists: ${dir.path}`);
      } catch (err) {
        // Directory might already exist, which is fine
        console.log(`Directory might already exist: ${dir.path}`, err);
      }
    }
    
    // Try multiple registry locations
    const registryLocations = [
      { path: 'documents/registry.json', directory: Directory.Data },
      { path: 'Documents/registry.json', directory: Directory.Data },
      { path: 'registry.json', directory: Directory.Data }
    ];
    
    let registryData = null;
    let registrySavePath = '';
    
    // Try to read from any registry location
    for (const location of registryLocations) {
      try {
        console.log(`Attempting to read registry from: ${location.directory}/${location.path}`);
        const result = await Filesystem.readFile({
          path: location.path,
          directory: location.directory
        });
        
        if (result && result.data) {
          registryData = result.data;
          registrySavePath = location.path;
          console.log(`Successfully read registry from: ${location.path}`);
          break;
        }
      } catch (err) {
        console.log(`Could not read registry from ${location.path}:`, err);
      }
    }
    
    if (registryData) {
      // Ensure that data is a string before parsing
      const data = typeof registryData === 'string' ? registryData : '';
      try {
        const files = JSON.parse(data);
        // Sort files by date (newest first)
        return Array.isArray(files) ? files.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) : [];
      } catch (parseError) {
        console.error('Error parsing registry JSON:', parseError);
        return [];
      }
    } else {
      console.log('No registry found, creating new one in multiple locations');
      
      // Create new registry in all potential locations
      for (const location of registryLocations) {
        try {
          await Filesystem.writeFile({
            path: location.path,
            data: JSON.stringify([]),
            directory: location.directory,
            recursive: true
          });
          console.log(`Created new registry at: ${location.path}`);
        } catch (err) {
          console.warn(`Failed to create registry at ${location.path}:`, err);
        }
      }
      
      return [];
    }
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
    
    // Save updated registry to multiple locations for redundancy
    const registryLocations = [
      { path: 'documents/registry.json', directory: Directory.Data },
      { path: 'Documents/registry.json', directory: Directory.Data },
      { path: 'registry.json', directory: Directory.Data }
    ];
    
    const registryData = JSON.stringify(files);
    
    for (const location of registryLocations) {
      try {
        await Filesystem.writeFile({
          path: location.path,
          data: registryData,
          directory: location.directory,
          recursive: true
        });
        console.log(`Updated registry at: ${location.path}`);
      } catch (err) {
        console.warn(`Failed to update registry at ${location.path}:`, err);
      }
    }
  } catch (error) {
    console.error('Error adding file to registry:', error);
  }
};
