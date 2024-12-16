import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { toast } from "sonner";

const Layout = () => {
  const location = useLocation();

  const handleLogout = () => {
    toast.success("Logout functionality temporarily disabled");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pirot Kilim Pattern Banner */}
      <div className="w-full h-6 bg-gradient-to-r from-red-700 via-red-800 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-12 h-full">
              <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)] bg-[length:8px_8px]"></div>
            </div>
          ))}
        </div>
      </div>

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