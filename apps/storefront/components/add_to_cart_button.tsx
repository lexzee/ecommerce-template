"use client";

import { useCart } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProductMinimal {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
}

export function AddToCartButton({
  product,
  className = "",
}: {
  product: ProductMinimal;
  className?: string;
}) {
  const cart = useCart();

  // Check store for existing quantity
  const cartItem = cart.items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
    });
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      cart.decreaseItem(product.id);
    } else {
      cart.removeItem(product.id);
    }
  };

  if (quantity > 0) {
    return (
      <div
        className={`flex items-center justify-between border border-input rounded-md p-1 w-full bg-background ${className}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-muted"
          onClick={handleDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="text-sm font-semibold min-w-[1.5rem] text-center">
          {quantity}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-muted"
          onClick={handleAdd}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleAdd}
      className={`w-full gap-2 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      Add to Cart
    </Button>
  );
}
