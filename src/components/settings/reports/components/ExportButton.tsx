
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  label?: string;
}

export const ExportButton = ({ onClick, isExporting, label = "Export keš kupovina" }: ExportButtonProps) => {
  return (
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
  );
};
