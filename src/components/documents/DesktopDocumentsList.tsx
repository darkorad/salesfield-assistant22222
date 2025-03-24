
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share2, Eye } from "lucide-react";
import { StoredFile } from "@/utils/fileStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { formatFileSize, handleDeleteFile, handleOpenFile, handleShareFile } from "./DocumentsUtils";

interface DesktopDocumentsListProps {
  files: StoredFile[];
  processingFile: string | null;
  setProcessingFile: (id: string | null) => void;
  onRefresh: () => void;
}

export const DesktopDocumentsList = ({ 
  files, 
  processingFile,
  setProcessingFile,
  onRefresh
}: DesktopDocumentsListProps) => {
  return (
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
                    onClick={() => handleOpenFile(file.id, setProcessingFile)}
                    disabled={processingFile === file.id}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Otvori</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareFile(file.id, setProcessingFile)}
                    disabled={processingFile === file.id}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Podeli</span>
                  </Button>

                  <DeleteDocumentDialog
                    fileName={file.name}
                    onDelete={() => handleDeleteFile(file.id, setProcessingFile, onRefresh)}
                    disabled={processingFile === file.id}
                  >
                    <></>
                  </DeleteDocumentDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
