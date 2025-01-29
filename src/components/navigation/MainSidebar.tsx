import { Link, useLocation } from "react-router-dom";
import { Settings, ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect } from "react";

const menuItems = [
  {
    title: "Prodaja",
    path: "/sales",
  },
  {
    title: "Današnje porudžbine",
    path: "/daily-orders",
  },
  {
    title: "Plan poseta",
    path: "/visit-plans",
    icon: Calendar,
  },
  {
    title: "Podešavanja i izveštaji",
    path: "/settings",
    icon: Settings,
  },
];

export function MainSidebar() {
  const location = useLocation();
  const { open, setOpen } = useSidebar();

  // Close sidebar by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);

  return (
    <Sidebar className="fixed inset-y-0 left-0 z-50">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="text-sm"
                  >
                    <Link to={item.path}>
                      {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}