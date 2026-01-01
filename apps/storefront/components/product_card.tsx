"use client";

import { useCart } from "@/lib/cart_store";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add_to_cart_button";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  category: string | null;
  slug: string;
}

export function ProductCard({ product }: { product: any }) {
  // Format currency
  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(product.price);

  return (
    <div className="group w-full md:w-60 relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {/* Image Aspect Ratio Wrapper */}
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
        <Link href={`/product/${product.slug || product.id}`}>
          {product.images?.[0] ? (
            <Image
              //   <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              width={10000}
              height={10000}
            />
          ) : (
            <div className="h-full items-center flex justify-center text-gray-400">
              No Image
            </div>
          )}
        </Link>
      </div>

      <div className="p-4">
        <Link href={`/product/${product.slug || product.id}`}>
          <h3 className="font-semibold leading-none tracking-tight">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-muted-foreground">{product.category}</p>
        <div className="flex mt-4 items-center justify-between">
          <span className="font-bold">{price}</span>

          <div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
