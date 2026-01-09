"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add_to_cart_button";
import { siteConfig } from "@/config/site";

// Strict Interface based on your DB schema
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  category: string | null;
  slug: string;
}

export function ProductCard({ product }: { product: Product }) {
  // Use Site Config for currency formatting
  const price = new Intl.NumberFormat(siteConfig.billing.currency.locale, {
    style: "currency",
    currency: siteConfig.billing.currency.code,
  }).format(product.price);

  return (
    <div className="group w-full md:w-60 relative rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex flex-col overflow-hidden">
      {/* Clickable Area */}
      <Link href={`/product/${product.slug || product.id}`} className="flex-1">
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              loading="eager"
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-medium text-sm leading-tight tracking-normal line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <span className="font-semibold text-foreground">{price}</span>
          </div>
        </div>
      </Link>

      {/* Action Button (Stays at bottom) */}
      <div className="p-3 pt-0 mt-auto">
        <AddToCartButton product={product} className="w-full h-9 text-sm" />
      </div>
    </div>
  );
}
