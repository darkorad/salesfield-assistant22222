import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryButtonProps {
  onClick: () => void;
}

export const HistoryButton = ({ onClick }: HistoryButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="flex-shrink-0"
          >
            <History className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Istorija naručivanja</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};