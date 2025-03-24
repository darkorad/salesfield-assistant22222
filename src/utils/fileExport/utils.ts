
import { NavigateFunction } from "react-router-dom";

/**
 * Creates a function that redirects to the Documents page
 */
export const createRedirectToDocuments = (navigate: NavigateFunction) => {
  return () => {
    navigate("/documents");
  };
};

/**
 * Converts a Blob to a base64 string
 */
export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
