
/**
 * Options for exporting a workbook
 */
export interface WorkbookExportOptions {
  /**
   * Show toast notifications during export
   * @default true
   */
  showToasts?: boolean;
  
  /**
   * Callback to run after successful export
   */
  onSuccess?: () => void;
  
  /**
   * Callback to run after failed export
   */
  onError?: (error: unknown) => void;
  
  /**
   * Force using a specific export method
   */
  forceMethod?: 'web' | 'mobile' | 'universal';
}
