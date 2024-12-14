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
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-2 md:space-x-4">
              <Link to="/sales">
                <Button
                  variant={location.pathname === "/sales" ? "default" : "ghost"}
                  className="text-sm md:text-base"
                >
                  Prodaja
                </Button>
              </Link>
              <Link to="/reports">
                <Button
                  variant={location.pathname === "/reports" ? "default" : "ghost"}
                  className="text-sm md:text-base"
                >
                  Izveštaji
                </Button>
              </Link>
              <Link to="/settings">
                <Button
                  variant={location.pathname === "/settings" ? "default" : "ghost"}
                  className="text-sm md:text-base"
                >
                  Podešavanja
                </Button>
              </Link>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-sm md:text-base"
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