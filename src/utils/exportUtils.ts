
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, WriteFileOptions } from '@capacitor/filesystem';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Exports an Excel workbook, handling differences between web and mobile platforms
 * @param wb The XLSX workbook to export
 * @param fileName The name to use for the file (without extension)
 */
export const exportWorkbook = async (wb: XLSX.WorkBook, fileName: string): Promise<void> => {
  try {
    // Generate the Excel file as array buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    // If on mobile device, use Capacitor Filesystem
    if (Capacitor.isNativePlatform()) {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64Data = arrayBufferToBase64(arrayBuffer);
      
      // First save the file to device
      const savedFile = await saveFile(`${fileName}.xlsx`, base64Data);
      
      // Then share it so the user can see it
      if (savedFile?.uri) {
        await openFile(savedFile.uri);
        toast.success("Izveštaj je uspešno izvezen i spreman za pregled");
      } else {
        throw new Error("Failed to save file");
      }
    } else {
      // On web, use the standard XLSX.writeFile approach
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success("Izveštaj je uspešno izvezen");
    }
  } catch (error) {
    console.error("Error exporting workbook:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};

// Helper function to convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
};

// Save file to device
const saveFile = async (fileName: string, data: string) => {
  const options: WriteFileOptions = {
    path: fileName,
    data: data,
    directory: Directory.Documents,
    recursive: true
  };
  
  try {
    const result = await Filesystem.writeFile(options);
    console.log('File saved:', result);
    return result;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Open file with system default app
const openFile = async (filePath: string) => {
  try {
    // On iOS and Android, we can use Capacitor.openUrl to view the file
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      // Convert file:// to a URL that can be opened
      let fileUrl = filePath;
      if (!fileUrl.startsWith('file://')) {
        fileUrl = `file://${fileUrl}`;
      }
      
      // Use Capacitor Browser plugin or App.openUrl if available
      if (Capacitor.isPluginAvailable('Browser')) {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: fileUrl });
      } else {
        const { App } = await import('@capacitor/app');
        await App.openUrl({ url: fileUrl });
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening file:', error);
    toast.error("Greška pri otvaranju fajla. Fajl je sačuvan u Documents direktorijumu.");
    throw error;
  }
};
