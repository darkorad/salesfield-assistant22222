import { Link, useLocation } from "react-router-dom";
import { Settings, Menu } from "lucide-react";
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
} from "@/components/ui/sidebar";

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

  return (
    <>
      <SidebarTrigger className="fixed top-20 left-2 z-40 md:hidden">
        <Menu className="h-4 w-4" />
      </SidebarTrigger>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
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