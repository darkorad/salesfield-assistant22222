
import { toast } from "sonner";
import { deleteStoredFile, shareStoredFile, openStoredFile } from "@/utils/fileStorage";

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const handleDeleteFile = async (
  fileId: string, 
  setProcessingFile: (id: string | null) => void, 
  onRefresh: () => void
) => {
  setProcessingFile(fileId);
  try {
    const success = await deleteStoredFile(fileId);
    if (success) {
      toast.success("Dokument je uspešno obrisan");
      onRefresh();
    } else {
      toast.error("Greška pri brisanju dokumenta");
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    toast.error("Greška pri brisanju dokumenta");
  } finally {
    setProcessingFile(null);
  }
};

export const handleShareFile = async (
  fileId: string, 
  setProcessingFile: (id: string | null) => void
) => {
  setProcessingFile(fileId);
  try {
    const success = await shareStoredFile(fileId);
    if (success) {
      toast.success("Dokument je spreman za deljenje");
    } else {
      toast.error("Greška pri deljenju dokumenta");
    }
  } catch (error) {
    console.error("Error sharing file:", error);
    toast.error("Greška pri deljenju dokumenta");
  } finally {
    setProcessingFile(null);
  }
};

export const handleOpenFile = async (
  fileId: string, 
  setProcessingFile: (id: string | null) => void
) => {
  setProcessingFile(fileId);
  try {
    const success = await openStoredFile(fileId);
    if (success) {
      toast.success("Dokument je uspešno otvoren");
    } else {
      toast.error("Greška pri otvaranju dokumenta");
    }
  } catch (error) {
    console.error("Error opening file:", error);
    toast.error("Greška pri otvaranju dokumenta");
  } finally {
    setProcessingFile(null);
  }
};
