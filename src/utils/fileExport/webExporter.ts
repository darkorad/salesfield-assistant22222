
/**
 * Exports a file on web platforms using download link
 * Forces file to download directly to user's Downloads folder
 */
export function exportFileWeb(blob: Blob, fileName: string) {
  try {
    console.log('Starting web export process for file:', fileName);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }
    
    // Create a direct download link with specific MIME type
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
    
    // Small delay before cleanup to ensure download starts
    setTimeout(() => {
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Web export completed for:', fileName);
    }, 1500); // Extended timeout to ensure download starts
  } catch (error) {
    console.error('Error in web export:', error);
    throw error;
  }
}
