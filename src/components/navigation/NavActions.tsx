import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";

const NavActions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        navigate("/login");
        return;
      }
      
      navigate("/login");
      toast.success("Uspešno ste se odjavili");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
      toast.error("Greška prilikom odjavljivanja");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        className="text-sm hidden md:flex"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Odjava
      </Button>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link 
                to="/sales" 
                className={`w-full cursor-pointer text-xs ${location.pathname === "/sales" ? "font-medium" : ""}`}
              >
                Prodaja
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                to="/daily-orders" 
                className={`w-full cursor-pointer text-xs ${location.pathname === "/daily-orders" ? "font-medium" : ""}`}
              >
                Današnje porudžbine
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                to="/sales-manufacturer" 
                className={`w-full cursor-pointer text-xs ${location.pathname === "/sales-manufacturer" ? "font-medium" : ""}`}
              >
                Prodaja po proizvođaču
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                to="/monthly-sales" 
                className={`w-full cursor-pointer text-xs ${location.pathname === "/monthly-sales" ? "font-medium" : ""}`}
              >
                Mesečna prodaja u RSD
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="w-full cursor-pointer text-xs">
                <Settings className="h-3 w-3 mr-2" />
                Podešavanja
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs">
              <LogOut className="h-3 w-3 mr-2" />
              Odjava
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavActions;