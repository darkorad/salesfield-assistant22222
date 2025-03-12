
// Main export file that re-exports all functionality
import { exportWorkbook } from './exportWorkbook';

export { exportWorkbook };

// Add a utility to create a redirect function based on navigate
export const createRedirectToDocuments = (navigate: (path: string) => void) => {
  return () => navigate('/documents');
};
