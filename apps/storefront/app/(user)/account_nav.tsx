"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { KeyRound, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/password", label: "Change Password", icon: KeyRound },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href} className="block">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10 font-normal",
                isActive && "font-medium text-foreground bg-muted",
                !isActive && "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {item.label}
            </Button>
          </Link>
        );
      })}

      <div className="pt-2 mt-2 border-t border-border">
        <form action="/api/signout" method="post">
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </nav>
  );
}
