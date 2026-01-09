// "use server";

// import { siteConfig } from "@/config/site";
// import { createTypedClient } from "@repo/database";
// import { ProductCard } from "./product_card";
// import { Ghost } from "lucide-react";

// // Initialize Server Client
// const [url, key] = [
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
// ];

// interface ProductGridProps {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }

// export async function ProductGridServer({ searchParams }: ProductGridProps) {
//   const supabase = createTypedClient(url, key);

//   // 1. Base Query
//   let query = supabase
//     .from("products")
//     .select("*")
//     .match({ is_available: true, category: siteConfig.niche });

//   // 2. Await Params (Next.js 15 Requirement)
//   const params = await searchParams;

//   // 3. Dynamic Filtering (JSONB Attributes)
//   // Reserved keys that are NOT product attributes
//   const reservedKeys = ["q", "sort", "page", "limit"];

//   Object.entries(params).forEach(([key, value]) => {
//     if (!reservedKeys.includes(key) && value && typeof value === "string") {
//       // Assuming 'attributes' is the JSONB column
//       query = query.contains("attributes", { [key]: value });
//     }
//   });

//   // 4. Text Search
//   if (params.q && typeof params.q === "string") {
//     query = query.ilike("name", `%${params.q}%`);
//   }

//   // 5. Sorting
//   switch (params.sort) {
//     case "price_asc":
//       query = query.order("price", { ascending: true });
//       break;
//     case "price_desc":
//       query = query.order("price", { ascending: false });
//       break;
//     case "latest":
//     default:
//       query = query.order("created_at", { ascending: false });
//       break;
//   }

//   const { data: products } = await query;

//   return (
//     <div className="w-full">
//       {/* Grid */}
//       <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
//         {products?.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>

//       {/* Empty State */}
//       {products?.length === 0 && (
//         <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-300">
//           <div className="bg-muted p-4 rounded-full mb-4">
//             <Ghost className="h-8 w-8 text-muted-foreground" />
//           </div>
//           <h3 className="text-lg font-semibold text-foreground">
//             No products found
//           </h3>
//           <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
//             We couldn't find anything matching your search. Try adjusting your
//             filters.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

"use server";

import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { ProductCard } from "./product_card";
import { Ghost } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";

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
  const params = await searchParams;

  // --- 1. Pagination Settings ---
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 20; // Change this to whatever limit you prefer
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // --- 2. Build Query ---
  // Note: Added { count: 'exact' } to get total items for pagination math
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .match({ is_available: true, category: siteConfig.niche });

  // Reserved keys that are NOT product attributes
  const reservedKeys = ["q", "sort", "page", "limit"];

  // Dynamic Filtering
  Object.entries(params).forEach(([key, value]) => {
    if (!reservedKeys.includes(key) && value && typeof value === "string") {
      query = query.contains("attributes", { [key]: value });
    }
  });

  // Text Search
  if (params.q && typeof params.q === "string") {
    query = query.ilike("name", `%${params.q}%`);
  }

  // Sorting
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

  // --- 3. Execute Query with Range ---
  const { data: products, count } = await query.range(from, to);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper to generate URLs while keeping existing filters
  const createPageUrl = (pageNumber: number) => {
    const newParams = new URLSearchParams();

    // Copy existing params
    Object.entries(params).forEach(([k, v]) => {
      if (v && typeof v === "string") newParams.set(k, v);
    });

    // Set new page
    newParams.set("page", pageNumber.toString());

    return `?${newParams.toString()}`;
  };

  return (
    <div className="w-full space-y-10">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 animate-in fade-in duration-500">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {products?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl bg-muted/30">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {/* Page Numbers (Simplified logic for brevity) */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Logic to show limited pages (e.g. 1, 2 ... 5) can be added here if needed
              return (
                <PaginationItem key={pageNum} className="hidden sm:block">
                  <PaginationLink
                    href={createPageUrl(pageNum)}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Mobile-only current page indicator if list is hidden */}
            <PaginationItem className="sm:hidden">
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? createPageUrl(currentPage + 1)
                    : "#"
                }
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
