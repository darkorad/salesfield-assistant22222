import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
        <div className="max-w-full px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-between py-2 sm:py-4 items-center gap-2">
            <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
              <Link to="/sales" className="w-[calc(50%-0.25rem)] sm:w-auto">
                <Button
                  variant={location.pathname === "/sales" ? "default" : "ghost"}
                  className="w-full text-sm"
                >
                  Prodaja
                </Button>
              </Link>
              <Link to="/reports" className="w-[calc(50%-0.25rem)] sm:w-auto">
                <Button
                  variant={location.pathname === "/reports" ? "default" : "ghost"}
                  className="w-full text-sm"
                >
                  Izveštaji
                </Button>
              </Link>
              <Link to="/settings" className="w-[calc(50%-0.25rem)] sm:w-auto">
                <Button
                  variant={location.pathname === "/settings" ? "default" : "ghost"}
                  className="w-full text-sm"
                >
                  Podešavanja
                </Button>
              </Link>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-sm w-full sm:w-auto"
            >
              Logout
            </Button>
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