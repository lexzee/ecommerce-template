"use client";

import { siteConfig } from "@/config/site";
import { createBrowserClientSafe } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Initialize Client Safe
const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];
const supabase = createBrowserClientSafe(url, key);

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [dynamicFilters, setDynamicFilters] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFilters = async () => {
      try {
        const { data: rawFilters, error } = await supabase.rpc(
          "get_niche_attributes",
          // @ts-ignore
          {
            niche_category: siteConfig.niche,
          }
        );

        if (error) throw error;
        setDynamicFilters((rawFilters as Record<string, string[]>) || {});
      } catch (err) {
        console.error("Failed to load filters:", err);
      } finally {
        setLoading(false);
      }
    };

    getFilters();
  }, []);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset page on filter change
    params.delete("page");

    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Only keep the search query 'q' and 'sort', delete everything else (filters)
    const query = params.get("q");
    const sort = params.get("sort");

    const newParams = new URLSearchParams();
    if (query) newParams.set("q", query);
    if (sort) newParams.set("sort", sort);

    router.replace(`${pathname}?${newParams.toString()}`);
  };

  if (loading) {
    return <FilterSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="hidden md:block space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
        <p className="text-muted-foreground text-xs">
          Refine by {siteConfig.niche} attributes
        </p>
      </div>

      {Object.entries(dynamicFilters).map(([attributeKey, options]) => {
        if (!options || options.length === 0) return null;

        const currentVal = searchParams.get(attributeKey);

        return (
          <div className="space-y-3" key={attributeKey}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium capitalize text-sm text-foreground">
                {attributeKey.replace(/_/g, " ")}
              </h3>
              {currentVal && (
                <button
                  onClick={() => updateFilter(attributeKey, null)}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <RadioGroup
              value={currentVal || ""}
              onValueChange={(val) => updateFilter(attributeKey, val)}
              className="gap-2.5"
            >
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2 group">
                  <RadioGroupItem
                    value={option}
                    id={`${attributeKey}-${option}`}
                    className="border-muted-foreground/30 text-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`${attributeKey}-${option}`}
                    className="text-sm text-muted-foreground group-hover:text-foreground cursor-pointer font-normal leading-none"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      })}

      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-foreground"
          type="button"
          onClick={clearAllFilters}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-8">
      <div className="hidden md:block space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-40" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
