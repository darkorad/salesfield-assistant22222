import { Outlet, useLocation } from "react-router-dom";
import NavLogo from "./navigation/NavLogo";
import NavActions from "./navigation/NavActions";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "./navigation/MainSidebar";

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
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
          <div className="max-w-full px-2 md:px-4">
            <div className="flex justify-between h-16 items-center">
              <NavLogo />
              <NavActions />
            </div>
          </div>
        </nav>
        <div className="flex">
          <MainSidebar />
          <main className="flex-1 container mx-auto py-4 md:py-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};