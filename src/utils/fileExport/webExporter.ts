
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
    
    // Create a more visible success notification
    setTimeout(() => {
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
      notification.style.color = 'white';
      notification.style.padding = '15px 20px';
      notification.style.borderRadius = '8px';
      notification.style.zIndex = '9999';
      notification.innerHTML = `<strong>Preuzimanje završeno:</strong> ${fileName}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 5000);
    }, 2000);
    
  } catch (error) {
    console.error('Error in web export:', error);
    throw error;
  }
}
