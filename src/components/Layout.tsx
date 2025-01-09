import { Outlet, useLocation } from "react-router-dom";
import NavLogo from "./navigation/NavLogo";
import NavLinks from "./navigation/NavLinks";
import NavActions from "./navigation/NavActions";

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
          <div className="max-w-full px-2 md:px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:h-20 items-center py-2 md:py-0">
              <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <NavLogo />
                <NavLinks />
              </div>
              <NavActions />
            </div>
          </div>
        </nav>
      )}
      <main className={`container mx-auto ${!isLoginPage ? 'py-4 md:py-6' : ''}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
};