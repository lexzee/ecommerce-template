"use server";
import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { ProductCard } from "./product_card";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

interface ProductGridProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function ProductGridServer({ searchParams }: ProductGridProps) {
  const supabase = createTypedClient(url, key);
  let query = supabase
    .from("products")
    .select("*")
    .match({ is_available: true, category: siteConfig.niche });

  let params = await searchParams;

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  if (params.gender) {
    query = query.contains("attributes", { gender: params.gender });
  }

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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      {products?.length === 0 && (
        <div className="col-span-full text-center py-20">
          <p className="text-lg font-semibold">No products found.</p>
          <p className="text-muted-foreground">Try Adjusting search filters.</p>
        </div>
      )}
    </div>
  );
}
