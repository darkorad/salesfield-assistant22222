
/**
 * Exports a file on web platforms using download link
 */
export function exportFileWeb(blob: Blob, fileName: string) {
  // Add file extension if not present
  if (!fileName.toLowerCase().endsWith('.xlsx')) {
    fileName += '.xlsx';
  }
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
