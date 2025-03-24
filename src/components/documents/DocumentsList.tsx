
import { useState } from "react";
import { DocumentsEmptyState } from "./DocumentsEmptyState";
import { MobileDocumentsList } from "./MobileDocumentsList";
import { DesktopDocumentsList } from "./DesktopDocumentsList";
import { StoredFile } from "@/utils/fileStorage";

interface DocumentsListProps {
  files: StoredFile[];
  onRefresh: () => void;
}

export const DocumentsList = ({ files, onRefresh }: DocumentsListProps) => {
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  if (files.length === 0) {
    return <DocumentsEmptyState />;
  }

  return (
    <div className="space-y-4">
      <MobileDocumentsList 
        files={files} 
        processingFile={processingFile}
        setProcessingFile={setProcessingFile}
        onRefresh={onRefresh}
      />
      <DesktopDocumentsList 
        files={files} 
        processingFile={processingFile}
        setProcessingFile={setProcessingFile}
        onRefresh={onRefresh}
      />
    </div>
  );
};
