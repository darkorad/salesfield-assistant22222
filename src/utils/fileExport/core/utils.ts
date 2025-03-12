
/**
 * Creates a download URL from a blob
 */
export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(
    new Blob([blob], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  );
}

/**
 * Cleans up a download URL
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Ensures filename has the correct extension
 */
export function ensureFileExtension(fileName: string, extension: string = '.xlsx'): string {
  if (!fileName.toLowerCase().endsWith(extension)) {
    return fileName + extension;
  }
  return fileName;
}
