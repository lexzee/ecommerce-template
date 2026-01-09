"use server";

import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { ProductCard } from "./product_card";
import { Ghost } from "lucide-react";

// Initialize Server Client
const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

interface ProductGridProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function ProductGridServer({ searchParams }: ProductGridProps) {
  const supabase = createTypedClient(url, key);

  // 1. Base Query
  let query = supabase
    .from("products")
    .select("*")
    .match({ is_available: true, category: siteConfig.niche });

  // 2. Await Params (Next.js 15 Requirement)
  const params = await searchParams;

  // 3. Dynamic Filtering (JSONB Attributes)
  // Reserved keys that are NOT product attributes
  const reservedKeys = ["q", "sort", "page", "limit"];

  Object.entries(params).forEach(([key, value]) => {
    if (!reservedKeys.includes(key) && value && typeof value === "string") {
      // Assuming 'attributes' is the JSONB column
      query = query.contains("attributes", { [key]: value });
    }
  });

  // 4. Text Search
  if (params.q && typeof params.q === "string") {
    query = query.ilike("name", `%${params.q}%`);
  }

  // 5. Sorting
  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: products } = await query;

  return (
    <div className="w-full">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {products?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Ghost className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
            We couldn't find anything matching your search. Try adjusting your
            filters.
          </p>
        </div>
      )}
    </div>
  );
}
