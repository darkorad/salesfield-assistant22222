
import { StoredFile } from './types';
import { saveWorkbookToStorage } from './save';
import { getStoredFiles } from './registry';
import { deleteStoredFile, shareStoredFile, openStoredFile } from './operations';

// Re-export everything for backward compatibility
export {
  StoredFile,
  saveWorkbookToStorage,
  getStoredFiles,
  deleteStoredFile,
  shareStoredFile,
  openStoredFile
};
