
import { useState, useEffect } from "react";
import { DocumentsEmptyState } from "./DocumentsEmptyState";
import { MobileDocumentsList } from "./MobileDocumentsList";
import { DesktopDocumentsList } from "./DesktopDocumentsList";
import { StoredFile } from "@/utils/fileStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentsListProps {
  files: StoredFile[];
  onRefresh: () => void;
}

export const DocumentsList = ({ files, onRefresh }: DocumentsListProps) => {
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  
  useEffect(() => {
    // Show the tip if we expect files but none are found
    const storedShowTip = localStorage.getItem('docs_tip_shown');
    if (files.length === 0 && !storedShowTip) {
      setShowTip(true);
      // Remember that we've shown the tip
      localStorage.setItem('docs_tip_shown', 'true');
    }
  }, [files.length]);

  if (files.length === 0) {
    return (
      <div className="space-y-6">
        {showTip && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">Nemate sačuvane dokumente?</AlertTitle>
            <AlertDescription className="text-blue-700">
              Ako ste kreirali izveštaje, ali ih ne vidite ovde, pokušajte sledeće:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Kliknite na dugme "Osveži" ispod</li>
                <li>Kreirajte novi izveštaj iz sekcije "Izveštaji"</li>
                <li>Proverite folder "Preuzimanja" ili "Downloads" na vašem uređaju</li>
              </ul>
              <div className="mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  Osveži listu dokumenata
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <DocumentsEmptyState />
      </div>
    );
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
