
import { useState } from "react";
import { format } from "date-fns";
import { 
  FileSpreadsheet, 
  Share2, 
  Trash2, 
  Eye,
  ChevronDown,
  Clock
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileSpreadsheet className="mx-auto h-12 w-12 mb-3 text-gray-400" />
        <p className="text-lg font-medium text-gray-500">Nema sačuvanih dokumenata</p>
        <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
          Dokumenti će se pojaviti ovde kada izvezete izveštaje. Idite na stranicu "Podešavanja" da kreirate izveštaje.
        </p>
      </div>
    );
  }

  // For mobile view (card layout)
  const renderMobileDocuments = () => (
    <div className="space-y-4 sm:hidden">
      {files.map((file) => (
        <div
          key={file.id}
          className="border rounded-lg overflow-hidden bg-white shadow-sm"
        >
          <div className="border-b border-gray-100 bg-gray-50 p-3 flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-sm">{file.name}</h3>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(file.date), "dd.MM.yyyy, HH:mm")}</span>
              {file.size > 0 && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  {formatFileSize(file.size)}
                </span>
              )}
            </div>
            
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOpenFile(file.id)}
                disabled={processingFile === file.id}
              >
                <Eye className="mr-1 h-4 w-4" />
                <span>Otvori</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
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
                    className="flex-1 text-destructive"
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
        </div>
      ))}
    </div>
  );

  // For desktop view (table layout)
  const renderDesktopDocuments = () => (
    <div className="hidden sm:block overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Naziv dokumenta</TableHead>
            <TableHead>Datum kreiranja</TableHead>
            <TableHead>Veličina</TableHead>
            <TableHead className="text-right">Akcije</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-accent" />
                  <span className="truncate">{file.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(file.date), "dd.MM.yyyy, HH:mm")}
              </TableCell>
              <TableCell>
                {file.size > 0 ? formatFileSize(file.size) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenFile(file.id)}
                    disabled={processingFile === file.id}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Otvori</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareFile(file.id)}
                    disabled={processingFile === file.id}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Podeli</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={processingFile === file.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Obriši</span>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderMobileDocuments()}
      {renderDesktopDocuments()}
    </div>
  );
};
