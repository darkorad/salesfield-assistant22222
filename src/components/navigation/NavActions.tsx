import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Settings, LogOut, Calendar } from "lucide-react";
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

  const menuItems = [
    { path: "/sales", label: "Prodaja" },
    { path: "/daily-orders", label: "Današnje porudžbine" },
    { path: "/visit-plans", label: "Plan poseta", icon: Calendar },
    { path: "/settings", label: "Podešavanja i izveštaji", icon: Settings },
  ];

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-2">
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`text-sm px-3 py-2 rounded-md transition-colors ${
              location.pathname === item.path 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

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
            {menuItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link 
                  to={item.path} 
                  className={`w-full cursor-pointer text-xs ${
                    location.pathname === item.path ? "font-medium" : ""
                  }`}
                >
                  {item.icon && <item.icon className="h-3 w-3 mr-2" />}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
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