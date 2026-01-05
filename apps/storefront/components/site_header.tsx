"use client";

import { siteConfig } from "@/config/site";
import { useCart } from "@/lib/cart_store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuDropDown } from "./site-header-dropdown";

export function SiteHeader() {
  const [user, setUser] = useState<any>(null);

  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  // Prevent hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background lg:px-72">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto px-4">
        {/* Logo Section */}
        <div className="flex gap-6 md:gap-10">
          <Link href={"/"} className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
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

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium">
                  Hi, {user.user_metadata.full_name || "User"}
                </span>
                <MenuDropDown />
              </>
            ) : (
              // SignOut button or drop down comming up
              <Link href={"/login"}>
                <Button variant={"secondary"} size={"sm"}>
                  Login
                </Button>
              </Link>
            )}

            {/* Cart Button */}
            <Link href={"/cart"}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {isMounted && cart.items.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-900 text-white text-[10px] flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
