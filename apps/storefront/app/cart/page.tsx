"use client";

import { CartItem } from "@/components/cart_item";
import { useCart } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent Hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (cart.items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-6 bg-muted rounded-full">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground">
          Looks like you haven't added anything yet.
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = cart.total();
  // Placeholder for tax
  const estimatedTax = subtotal * 0.075; // 7.5% VAT standard
  const total = subtotal + estimatedTax;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Cart Items List */}
        <section className="lg:col-span-7">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
          <div className="mt-6">
            <Button variant={"outline"} onClick={() => cart.clearCart()}>
              Clear Cart
            </Button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="mt-16 rounded-lg border bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 dark:bg-gray-900/50">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Order summary
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                Subtotal
              </div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(subtotal)}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500">Tax Estimate (7.5%)</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(estimatedTax)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                Order total
              </div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(total)}
              </div>
            </div>

            <div className="mt-6">
              <Link href={"/checkout"}>
                <Button className="w-full" size={"lg"}>
                  checkout
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
