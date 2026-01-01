"use client";

import { signout } from "@/app/(auth)/action";
import { Button } from "@workspace/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@workspace/ui/components/sidebar";
import { Home, Inbox, Settings, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";

// Menu Items
const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Products", url: "/products", icon: ShoppingBag },
  { title: "Orders", url: "/orders", icon: Inbox },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <h2 className="font-bold text-xl">Admin Dashboard</h2>
      </SidebarHeader>

      <SidebarContent>
        {/* <SidebarGroup> */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
          <LogoutButton />
        </nav>

        {/* </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/60">© 2025 Store</div>
      </SidebarFooter>
    </Sidebar>
  );
}

function LogoutButton() {
  const handleLogout = async () => {
    await signout();
  };

  return (
    <Button className="mx-2" onClick={handleLogout}>
      Log out
    </Button>
  );
}
