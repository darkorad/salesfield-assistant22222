
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share2, Eye, Clock } from "lucide-react";
import { StoredFile } from "@/utils/fileStorage";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { formatFileSize, handleDeleteFile, handleOpenFile, handleShareFile } from "./DocumentsUtils";

interface MobileDocumentsListProps {
  files: StoredFile[];
  processingFile: string | null;
  setProcessingFile: (id: string | null) => void;
  onRefresh: () => void;
}

export const MobileDocumentsList = ({ 
  files, 
  processingFile,
  setProcessingFile,
  onRefresh
}: MobileDocumentsListProps) => {
  return (
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
                onClick={() => handleOpenFile(file.id, setProcessingFile)}
                disabled={processingFile === file.id}
              >
                <Eye className="mr-1 h-4 w-4" />
                <span>Otvori</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleShareFile(file.id, setProcessingFile)}
                disabled={processingFile === file.id}
              >
                <Share2 className="mr-1 h-4 w-4" />
                <span>Podeli</span>
              </Button>

              <DeleteDocumentDialog
                fileName={file.name}
                onDelete={() => handleDeleteFile(file.id, setProcessingFile, onRefresh)}
                disabled={processingFile === file.id}
                variant="outline"
                mobileView={true}
              >
                <></>
              </DeleteDocumentDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
