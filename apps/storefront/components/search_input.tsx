"use client";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    // Reset pagination if you have it
    // params.delete("page");

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "..." : "Search"}
      </Button>
    </form>
  );
}
