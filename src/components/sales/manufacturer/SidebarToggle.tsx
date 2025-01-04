import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SidebarToggleProps {
  onClick: () => void;
}

export const SidebarToggle = ({ onClick }: SidebarToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-4 top-4 z-10"
      onClick={onClick}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
};