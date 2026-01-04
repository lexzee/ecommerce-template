"use client";

import { useCart } from "@/lib/cart_store";
import { createBrowserClientSafe } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

const supabase = createBrowserClientSafe(url, key);

interface ProductMinimal {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
}
export function AddToCartButton({
  product,
  className,
}: {
  product: ProductMinimal;
  className: string;
}) {
  const cart = useCart();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const cartItem = cart.items.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem?.quantity : 0;

  const handleAdd = () => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
    });
  };

  const handleRemove = () => {
    if (quantity > 1) {
      cart.decreaseItem(product.id);
    } else {
      cart.removeItem(product.id);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  if (quantity > 0) {
    return (
      <div className="flex items-center justify-between border rounded-md p-2 w-full h-12">
        <Button variant={"ghost"} size={"icon"} onClick={handleRemove}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-lg font-bold w-4 text-center">{quantity}</span>
        <Button variant={"ghost"} size={"icon"} onClick={handleAdd}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={"sm"}
      onClick={handleAdd}
      className={`w-full h-12 text-base ${className}`}
    >
      Add
    </Button>
  );
}
