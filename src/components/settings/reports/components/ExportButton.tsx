
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, AlertCircle } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  label?: string;
  showFallbackHelp?: boolean;
}

export const ExportButton = ({ 
  onClick, 
  isExporting, 
  label = "Export keš kupovina",
  showFallbackHelp = false
}: ExportButtonProps) => {
  return (
    <div className="space-y-2">
      <Button
        className="w-full py-4 text-sm md:text-base font-medium"
        onClick={onClick}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            Izvoz u toku...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {label}
          </>
        )}
      </Button>
      
      {showFallbackHelp && (
        <div className="text-xs flex items-start gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Problem sa preuzimanjem? Kliknite na dugme "Preuzmi direktno" koje će se pojaviti ako standardno preuzimanje ne uspe.
          </span>
        </div>
      )}
    </div>
  );
};
