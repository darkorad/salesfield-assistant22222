import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, BarChart3, Settings, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const Layout = () => {
  const location = useLocation();

  const handleLogout = () => {
    toast.success("Logout functionality temporarily disabled");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link to="/sales" className="flex items-center">
                <ShoppingCart className="h-6 w-6 text-primary mr-2" />
                <span className="font-semibold text-gray-900 text-lg">
                  Sales Pro
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
                <Link to="/reports">
                  <Button
                    variant={location.pathname === "/reports" ? "default" : "ghost"}
                    className="text-sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Izveštaji
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
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/reports" className="w-full cursor-pointer">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Izveštaji
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Podešavanja
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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