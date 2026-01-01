"use client";

import { useCart, type CartItem as CartItemType } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <div className="flex py-6 border-b">
      {/* Image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center"
            width={1000}
            height={1000}
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
          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
            <h3>
              <Link href={`/product/${item.slug || item.id}`}>{item.name}</Link>
            </h3>
            <p className="ml-4">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(item.price * item.quantity)}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(item.price)}{" "}
            each
          </p>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          {/* Quanity Controls */}
          <div className="flex items-center gap-2 border rounded-md p-1">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="h-6 w-6"
              onClick={handleDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-4 text-center font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => cart.removeItem(item.id)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
