"use client";
import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [dynamicFilters, setDynamicFilters] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const supabase = createTypedClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );
    const getFilters = async () => {
      const { data: rawFilters } = await supabase.rpc("get_niche_attributes", {
        niche_category: siteConfig.niche,
      });

      setDynamicFilters((rawFilters as Record<string, string[]>) || {});
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

    // Reset page to 1 on filter change if you implement pagination later
    // params.delete('page');

    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="hidden md:block">
        <h2 className="text-lg font-bold">Filters</h2>
        <p className="text-muted-foreground text-sm">
          Refine your search by category, price and more
        </p>
      </div>
      {Object.entries(dynamicFilters).map(([attributeKey, options]) => {
        if (!options || options.length === 0) return null;

        const currentVal = searchParams.get(attributeKey);

        return (
          <div className="space-y-3" key={attributeKey}>
            <h3 className="font-semibold capitalize text-sm">
              {attributeKey.replace("_", " ")}
            </h3>

            <RadioGroup
              value={currentVal || ""}
              onValueChange={(val) => updateFilter(attributeKey, val)}
            >
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${attributeKey}-${option}`}
                  />
                  <Label
                    htmlFor={`${attributeKey}-${option}`}
                    className="text-sm cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {currentVal && (
              <Button
                variant={"ghost"}
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => updateFilter(attributeKey, null)}
              >
                {`Reset ${attributeKey}`}
              </Button>
            )}
          </div>
        );
      })}

      <div className="pt-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => router.replace(pathname)}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}
