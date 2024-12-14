import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="max-w-full px-2">
          <div className="flex justify-between py-2 items-center">
            <div className="flex gap-1">
              <Link to="/sales">
                <Button
                  variant={location.pathname === "/sales" ? "default" : "ghost"}
                  className="text-sm px-2"
                >
                  Prodaja
                </Button>
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/reports" className="w-full cursor-pointer">
                    Izveštaji
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
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
      </nav>
      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;