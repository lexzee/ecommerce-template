"use client";

import { useCart, type CartItem as CartItemType } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const cart = useCart();

  const handleDecrease = () => {
    cart.decreaseItem(item.id);
  };

  const handleIncrease = () => {
    cart.addItem({ ...item, quantity: 1 });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(siteConfig.billing.currency.locale, {
      style: "currency",
      currency: siteConfig.billing.currency.code,
    }).format(amount);
  };

  return (
    <div className="flex py-6 border-b border-border last:border-0">
      {/* Image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center"
            width={200}
            height={200}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
            No img
          </div>
        )}
      </div>

      {/* Details */}
      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-foreground">
            <h3>
              <Link
                href={`/product/${item.slug || item.id}`}
                className="hover:underline"
              >
                {item.name}
              </Link>
            </h3>
            <p className="ml-4 font-semibold">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPrice(item.price)} each
          </p>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 border border-input rounded-md p-0.5 bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm"
              onClick={handleDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-medium text-sm tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
            onClick={() => cart.removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
