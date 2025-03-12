
import { useState } from "react";
import { format } from "date-fns";
import { 
  DownloadCloud, 
  FileSpreadsheet, 
  Share2, 
  Trash2, 
  Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { StoredFile, deleteStoredFile, shareStoredFile, openStoredFile } from "@/utils/fileStorage";

interface DocumentsListProps {
  files: StoredFile[];
  onRefresh: () => void;
}

export const DocumentsList = ({ files, onRefresh }: DocumentsListProps) => {
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  const handleDeleteFile = async (fileId: string) => {
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

  const handleShareFile = async (fileId: string) => {
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

  const handleOpenFile = async (fileId: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSpreadsheet className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>Nema sačuvanih dokumenata</p>
        <p className="text-sm mt-2">
          Dokumenti će se pojaviti ovde kada izvezete izveštaje
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all bg-card"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-10 w-10 text-accent" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{format(new Date(file.date), "dd.MM.yyyy, HH:mm")}</span>
                {file.size > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => handleOpenFile(file.id)}
              disabled={processingFile === file.id}
            >
              <Eye className="mr-1 h-4 w-4" />
              <span>Otvori</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => handleShareFile(file.id)}
              disabled={processingFile === file.id}
            >
              <Share2 className="mr-1 h-4 w-4" />
              <span>Podeli</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-destructive"
                  disabled={processingFile === file.id}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  <span>Obriši</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Obriši dokument</AlertDialogTitle>
                  <AlertDialogDescription>
                    Da li ste sigurni da želite da obrišete dokument "{file.name}"? 
                    Ova akcija je nepovratna.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Otkaži</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteFile(file.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Obriši
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
};
