
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ExportButton = ({ 
  onClick, 
  label, 
  isLoading = false, 
  disabled = false,
  className = "w-full py-6 text-lg font-medium"
}: ExportButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      {isLoading ? "Izvoz u toku..." : label}
    </Button>
  );
};
