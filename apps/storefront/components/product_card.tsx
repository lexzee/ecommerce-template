"use client";

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

  const renderName = (name: string) => {
    return name.length > 45 ? `${name.slice(0, 45)}...` : name;
  };

  return (
    <div className="group w-full md:w-60 relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {/* Image Aspect Ratio Wrapper */}

      <Link href={`/product/${product.slug || product.id}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
          {/* <Link href={`/product/${product.slug || product.id}`}> */}
          {product.images?.[0] ? (
            <Image
              loading="eager"
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
          {/* </Link> */}
        </div>

        <div className="flex flex-col gap-1 p-4 h-30">
          {/* <h3 className="font-semibold leading-none tracking-tight"> */}
          <h3 className="font-normal text-xs leading-4 tracking-normal">
            {renderName(product.name)}
          </h3>
          {/* <p className="mt-2 text-muted-foreground">{product.category}</p> */}
          {/* <p className="text-muted-foreground text-xs">{product.category}</p> */}
          <div className="flex items-center justify-between">
            {/* <span className="font-bold">{price}</span> */}
            <span className="font-semibold">{price}</span>
          </div>
        </div>
      </Link>

      <div className="w-full p-2">
        <AddToCartButton product={product} className="h-8 text-sm" />
      </div>
    </div>
  );
}
