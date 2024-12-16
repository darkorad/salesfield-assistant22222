import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  label: string;
}

export const ExportButton = ({ onClick, label }: ExportButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="w-full sm:w-auto"
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};