"use client";

import { siteConfig } from "@/config/site";
import { useCart } from "@/lib/cart_store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuDropDown } from "./site-header-dropdown";

export function SiteHeader() {
  const [user, setUser] = useState<any>(null);
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  // Prevent hydration error and fetch initial state

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      cart.fetchCart();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    // Re-run when cookies change so auth state is re-checked
    // Use a safe read for document.cookie to avoid SSR issues
  }, [typeof document !== "undefined" ? document.cookie : ""]);

  // Calculate total quantity of items, not just unique rows
  const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo & Nav */}
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {siteConfig.mainNav.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                )
            )}
          </nav>
        </div>

        {/* Actions (Auth + Cart) */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
                Hi, {user.user_metadata.full_name?.split(" ")[0] || "User"}
              </span>
              <MenuDropDown />
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}

          {/* Cart Button */}
          <Link href="/cart">
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-full border-border"
            >
              <ShoppingBag className="h-4 w-4" />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
