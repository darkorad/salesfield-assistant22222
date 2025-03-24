
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
    
    // Create documents directory - more aggressively ensure it exists
    try {
      // Try multiple approaches to create directory
      const directories = [
        { path: 'documents', directory: Directory.Data },
        { path: 'Documents', directory: Directory.Data },
        { path: '', directory: Directory.Data }
      ];
      
      for (const dir of directories) {
        try {
          await Filesystem.mkdir({
            path: dir.path,
            directory: dir.directory,
            recursive: true
          });
          console.log(`Successfully created or confirmed directory: ${dir.path}`);
        } catch (err) {
          console.log(`Directory might already exist: ${dir.path}`, err);
        }
      }
    } catch (err) {
      // Continue anyway as the writeFile will create directory if needed
      console.log('Could not ensure directories exist, but will try to write file anyway:', err);
    }
    
    // Try multiple save locations until one works
    let result;
    const saveLocations = [
      { path: `documents/${fileName}`, directory: Directory.Data },
      { path: `Documents/${fileName}`, directory: Directory.Data },
      { path: fileName, directory: Directory.Data }
    ];
    
    let savedPath = '';
    let error;
    
    for (const location of saveLocations) {
      try {
        console.log(`Attempting to save to: ${location.directory}/${location.path}`);
        result = await Filesystem.writeFile({
          path: location.path,
          data: base64Data,
          directory: location.directory,
          recursive: true
        });
        savedPath = location.path;
        console.log('File saved successfully to:', result);
        break;
      } catch (err) {
        error = err;
        console.warn(`Failed to save to ${location.directory}/${location.path}:`, err);
      }
    }
    
    if (!result) {
      throw new Error(`Could not save file to any location: ${error?.message || 'Unknown error'}`);
    }
    
    console.log('File saved successfully to final path:', savedPath);
    
    // Get file size if possible
    let fileSize = 0;
    try {
      const fileInfo = await Filesystem.stat({
        path: savedPath,
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
      path: result.uri || `file://${savedPath}`,
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
    toast.error(`Greška pri čuvanju fajla: ${error instanceof Error ? error.message : String(error)}`, {
      description: "Pokušajte pristupiti 'Dokumenti' sekciji da proverite da li je fajl ipak sačuvan.",
      duration: 10000
    });
    return null;
  }
};
