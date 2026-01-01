import { ProductGridServer } from "@/components/product-grid-server";
import { ProductFilters } from "@/components/product_filters";
import { SortSelect } from "@/components/sort_select";
import { siteConfig } from "@/config/site";
import { Suspense } from "react";

type SearchParams = {
  sort?: string;
  q?: string;
  gender?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="container py-10 mx-auto px-4">
      {/* Hero */}
      <section className="mb-12 space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-20">
            <Suspense>
              <ProductFilters />
            </Suspense>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Catalog
              {/* ({products?.length || 0}) */}
            </h2>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>

          {/* ProductGrid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGridServer searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

// Simple Loading Skeleton
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}
