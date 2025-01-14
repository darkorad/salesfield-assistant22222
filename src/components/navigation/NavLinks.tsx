import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const NavLinks = () => {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex items-center space-x-2">
      <Link to="/sales">
        <Button
          variant={location.pathname === "/sales" ? "default" : "ghost"}
          className="text-sm"
        >
          Prodaja
        </Button>
      </Link>
      <Link to="/daily-orders">
        <Button
          variant={location.pathname === "/daily-orders" ? "default" : "ghost"}
          className="text-sm"
        >
          Današnje porudžbine
        </Button>
      </Link>
      <Link to="/settings">
        <Button
          variant={location.pathname === "/settings" ? "default" : "ghost"}
          className="text-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Podešavanja i izveštaji
        </Button>
      </Link>
    </div>
  );
};

export default NavLinks;