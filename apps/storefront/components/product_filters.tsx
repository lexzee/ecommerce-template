"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
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
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [gender, setGender] = useState<string | undefined>(
    searchParams.get("gender") || undefined
  );

  useEffect(() => {
    setGender(searchParams.get("gender") || undefined);
  }, [searchParams.toString()]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("q", search);
  };

  return (
    <div className="space-y-8">
      {/* Search by Name */}
      <form onSubmit={handleSearch} className="space-y-2">
        <h3 className="font-semibold mb-2">Search</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" size="sm">
            Go
          </Button>
        </div>

        {/* Gender Filter */}
        <div className="space-y-2">
          <h3 className="font-semibold b-2">Gender</h3>
          <RadioGroup
            className="spcace-y-2 flex lg:flex-col"
            defaultValue={gender}
            onValueChange={(val) => {
              setGender(val || undefined);
              updateFilter("gender", val);
            }}
          >
            {["Male", "Female", "Unisex"].map((val) => (
              <Label key={val} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={val} /> {val}
              </Label>
            ))}
            <Button
              onClick={() => {
                setGender(undefined);
                updateFilter("gender", null);
              }}
              variant="secondary"
              type="button"
              className="text-xs"
              size="sm"
            >
              Clear
            </Button>
          </RadioGroup>
        </div>

        {/* More Sections */}
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
      </form>
    </div>
  );
}
