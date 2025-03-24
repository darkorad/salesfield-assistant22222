
import { blobToBase64 } from '../fileExport/utils';
import { NavigateFunction } from 'react-router-dom';

/**
 * Creates a URL for a blob
 */
export const createDownloadUrl = (blob: Blob): string => {
  return URL.createObjectURL(
    new Blob([blob], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  );
};

/**
 * Converts a blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const base64data = reader.result as string;
      // Get only the base64 data part (remove metadata prefix like 'data:application/pdf;base64,')
      const commaIndex = base64data.indexOf(',');
      resolve(commaIndex !== -1 ? base64data.substring(commaIndex + 1) : base64data);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Creates a function to redirect to the Documents page
 */
export const createRedirectToDocuments = (navigate: NavigateFunction) => {
  return () => {
    navigate('/documents');
  };
};
