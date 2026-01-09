"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Determine current value for the UI state
  const currentSort = searchParams.get("sort") || "latest";

  const onSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);

    // Replace URL without scrolling to top
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger className="w-[160px] h-9 bg-background">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="latest">Newest Arrivals</SelectItem>
        <SelectItem value="price_asc">Price: Low to High</SelectItem>
        <SelectItem value="price_desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}
