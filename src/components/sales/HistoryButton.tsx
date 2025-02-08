
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface HistoryButtonProps {
  onClick: () => void;
}

export const HistoryButton = ({ onClick }: HistoryButtonProps) => {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <History className="h-4 w-4" />
    </Button>
  );
};
