import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const NavActions = () => {
  const { setOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default NavActions;