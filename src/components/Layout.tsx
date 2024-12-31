import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
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

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear all local storage
      localStorage.clear();
      
      // Then attempt to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // Even if there's an error, we'll navigate to login
        navigate("/login");
        return;
      }
      
      navigate("/login");
      toast.success("Uspešno ste se odjavili");
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation to login even if there's an error
      navigate("/login");
      toast.error("Greška prilikom odjavljivanja");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link to="/sales" className="flex items-center">
                <img 
                  src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
                  alt="ŽIR-MD COMPANY Logo" 
                  className="h-8 w-auto mr-2"
                />
                <span className="font-semibold text-gray-900 text-lg">
                  ZIR-MD COMPANY
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/sales">
                  <Button
                    variant={location.pathname === "/sales" ? "default" : "ghost"}
                    className="text-sm"
                  >
                    Prodaja
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant={location.pathname === "/settings" ? "default" : "ghost"}
                    className="text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Podešavanja
                  </Button>
                </Link>
              </div>
            </div>
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
                      <Link to="/settings" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Podešavanja
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Odjava
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;