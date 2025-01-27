import { Link, useLocation } from "react-router-dom";
import { Settings, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
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
    title: "Podešavanja i izveštaji",
    path: "/settings",
    icon: Settings,
  },
];

export function MainSidebar() {
  const location = useLocation();
  const { open, setOpen } = useSidebar();

  // Close sidebar by default on sales screen and set initial state
  useEffect(() => {
    const isSalesScreen = location.pathname === '/sales';
    setOpen(!isSalesScreen);
  }, [location.pathname, setOpen]);

  return (
    <>
      <SidebarTrigger asChild>
        <div className="fixed top-20 left-0 z-40 h-12 w-6 flex items-center justify-center bg-white border border-l-0 border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50">
          <ChevronRight className="h-4 w-4" />
        </div>
      </SidebarTrigger>
      <Sidebar>
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
    </>
  );
}