
// Main export file that re-exports all functionality
import { exportWorkbook, WorkbookExportOptions } from './core';

export { exportWorkbook };

// Re-export types
export type { WorkbookExportOptions };

// Add a utility to create a redirect function based on navigate
export const createRedirectToDocuments = (navigate: (path: string) => void) => {
  return () => navigate('/documents');
};

// Re-export types using explicit 'export type' syntax
export type { StoredFile } from '../fileStorage/types';

