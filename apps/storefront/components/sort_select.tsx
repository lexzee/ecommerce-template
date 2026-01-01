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

  const onSortChange = async (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set("sort", value);
    else params.delete("sort");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      {/* <span className="text-sm text-muted-foreground">Sort by:</span> */}
      <Select onValueChange={(e) => onSortChange(e)}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Sort by: " />
        </SelectTrigger>
        <SelectContent defaultValue={searchParams.get("sort") || "latest"}>
          <SelectItem value="latest">Newest Arrival</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
