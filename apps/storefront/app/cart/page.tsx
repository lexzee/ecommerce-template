"use client";

import { CartItem } from "@/components/cart_item";
import { siteConfig } from "@/config/site";
import { useCart } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent Hydration Error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Helper for consistent currency formatting
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(siteConfig.billing.currency.locale, {
      style: "currency",
      currency: siteConfig.billing.currency.code,
    }).format(amount);
  };

  // 1. Empty State
  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 bg-muted/50 rounded-full border-2 border-dashed border-muted-foreground/20">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Looks like you haven't added anything yet. Explore our catalog to
            find something you love.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Calculations
  const subtotal = cart.total();
  const estimatedTax = subtotal * siteConfig.billing.taxRate;
  const total = subtotal + estimatedTax;

  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Cart Items List */}
        <section className="lg:col-span-7">
          <div className="space-y-0 divide-y divide-border border-t border-b border-border">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cart.clearCart()}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="lg:col-span-5 mt-16 lg:mt-0 sticky top-24">
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-6 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="text-base text-muted-foreground">Subtotal</div>
                <div className="text-base font-medium text-foreground">
                  {formatPrice(subtotal)}
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-border/50">
                <div className="text-sm text-muted-foreground">
                  Tax Estimate ({(siteConfig.billing.taxRate * 100).toFixed(1)}
                  %)
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatPrice(estimatedTax)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-lg font-bold text-foreground">
                  Order Total
                </div>
                <div className="text-lg font-bold text-primary">
                  {formatPrice(total)}
                </div>
              </div>

              <div className="mt-6">
                <Link href="/checkout" className="w-full block">
                  <Button className="w-full text-base h-12 shadow-md" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Shipping & Delivery fees are calculated at checkout.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
