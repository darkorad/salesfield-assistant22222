import { Outlet, useLocation } from "react-router-dom";
import NavLogo from "./navigation/NavLogo";
import NavActions from "./navigation/NavActions";

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="container mx-auto">
        {children || <Outlet />}
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full shadow-sm backdrop-blur-sm bg-white/90">
        <div className="max-w-full px-4 md:px-6">
          <div className="flex justify-between h-16 items-center">
            <NavLogo />
            <NavActions />
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6 md:py-8 px-4 md:px-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};