"use client";

import { Input } from "@workspace/ui/components/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce"; // or just standard timeout
import { useEffect, useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("q") || "");
  const [query] = useDebounce(text, 500); // Wait 500ms before searching

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }, [query, router, searchParams]);

  return (
    <Input
      placeholder="Search products..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="max-w-sm"
    />
  );
}
