
import { saveWorkbookToStorage } from './save';
import { getStoredFiles } from './registry';
import { deleteStoredFile, shareStoredFile, openStoredFile } from './operations';

// Re-export the type properly with 'export type'
export type { StoredFile } from './types';

// Re-export functions for backward compatibility
export {
  saveWorkbookToStorage,
  getStoredFiles,
  deleteStoredFile,
  shareStoredFile,
  openStoredFile
};
