
import { Outlet, useLocation } from "react-router-dom";
import NavLogo from "./navigation/NavLogo";
import { NavActions } from "./navigation/NavActions";
import { MainSidebar } from "./navigation/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isMobile = useIsMobile();
  const [showBackdrop, setShowBackdrop] = useState(false);
  
  // Close the mobile menu when changing routes
  useEffect(() => {
    if (isMobile) {
      setShowBackdrop(false);
    }
  }, [location.pathname, isMobile]);

  if (isLoginPage) {
    return (
      <main className="container mx-auto animate-fade-in">
        {children || <Outlet />}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full shadow-sm backdrop-blur-sm bg-white/90">
          <div className="max-w-full px-4 md:px-6">
            <div className="flex justify-between h-16 items-center">
              <NavLogo />
              <h1 className="text-lg font-semibold hidden md:block">ŽIR-MD COMPANY</h1>
              <NavActions />
            </div>
          </div>
        </nav>
        <div className="flex relative">
          <MainSidebar />
          {showBackdrop && (
            <div 
              className="fixed inset-0 bg-black/25 z-40 md:hidden"
              onClick={() => setShowBackdrop(false)}
            />
          )}
          <main className="container mx-auto py-4 md:py-8 px-3 md:px-6 animate-fade-in flex-1 max-w-full overflow-x-hidden">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
