import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const NavActions = () => {
  const { setOpen, open } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(!open)}
      className="hover:bg-gray-100"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default NavActions;