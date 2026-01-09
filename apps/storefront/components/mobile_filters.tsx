"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Filter } from "lucide-react";
import { useState } from "react";
import { ProductFilters } from "./product_filters";

export function MobileFilters() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-transparent hover:text-primary px-2"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] overflow-y-auto p-0"
      >
        <div className="p-6 pb-0">
          <SheetHeader className="text-left">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine your search by category, price, and more.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 pt-4">
          <ProductFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}
