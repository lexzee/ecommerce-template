import { MobileFilters } from "@/components/mobile_filters";
import { ProductGridServer } from "@/components/product-grid-server";
import { ProductFilters } from "@/components/product_filters";
import { SearchInput } from "@/components/search_input";
import { SortSelect } from "@/components/sort_select";
import { siteConfig } from "@/config/site";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

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
    <main className="container py-10 mx-auto px-4 min-h-screen">
      {/* Hero Section */}
      <section className="mb-12 space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
          {siteConfig.name}
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <Suspense
              fallback={
                <div className="h-64 bg-muted animate-pulse rounded-md" />
              }
            >
              <ProductFilters />
            </Suspense>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full lg:flex-1">
              <Suspense>
                <SearchInput />
              </Suspense>
            </div>

            <div className="hidden lg:block flex-1 sm:flex-none">
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGridServer searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      {/* Mobile Floating Controls */}
      <div className="fixed left-0 right-0 z-20 bottom-8 flex justify-center pointer-events-none lg:hidden">
        <div className="pointer-events-auto flex items-center bg-background border border-border rounded-full shadow-lg px-4 py-2 gap-4">
          <SortSelect />
          <div className="h-6 w-px bg-border" /> {/* Divider */}
          <MobileFilters />
        </div>
      </div>
    </main>
  );
}

// Semantic Skeleton Loader
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-[300px] w-full bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}
