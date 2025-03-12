
/**
 * Exports a file on web platforms using multiple approaches
 * to ensure reliable file download
 */
export function exportFileWeb(blob: Blob, fileName: string) {
  try {
    console.log('Starting web export process for file:', fileName);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }
    
    // METHOD 1: Create a download link and trigger click
    const url = window.URL.createObjectURL(
      new Blob([blob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
    );
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Force download by simulating a direct click
    document.body.appendChild(a);
    console.log('Triggering download for:', fileName);
    a.click();
    
    // Open the file in a new tab as a backup method
    setTimeout(() => {
      const backupLink = document.createElement('a');
      backupLink.href = url;
      backupLink.target = '_blank';
      backupLink.style.display = 'none';
      document.body.appendChild(backupLink);
      backupLink.click();
      document.body.removeChild(backupLink);
    }, 1000);
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Web export completed for:', fileName);
    }, 2000);
    
    // METHOD 2: Use the File System Access API if available (modern browsers)
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
    
  } catch (error) {
    console.error('Error in web export:', error);
    throw error;
  }
}
