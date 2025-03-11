
/**
 * Exports a file on web platforms using download link
 * Triggers a direct file download in the browser
 */
export function exportFileWeb(blob: Blob, fileName: string) {
  try {
    console.log('Starting web export process for file:', fileName);
    
    // Add file extension if not present
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Append to body, trigger click, then remove
    document.body.appendChild(a);
    a.click();
    
    // Small delay before cleanup to ensure download starts
    setTimeout(() => {
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Web export completed for:', fileName);
    }, 100);
  } catch (error) {
    console.error('Error in web export:', error);
    throw error;
  }
}
