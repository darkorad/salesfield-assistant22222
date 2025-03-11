
import { Directory } from '@capacitor/filesystem';

/**
 * Get a readable directory name for toast messages
 */
export function getDirectoryName(directory: Directory): string {
  switch (directory) {
    case Directory.Documents:
      return 'Documents';
    case Directory.External:
      return 'Downloads';
    case Directory.Data:
      return 'App Storage';
    default:
      return 'Storage';
  }
}

/**
 * Converts a Blob to a base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
