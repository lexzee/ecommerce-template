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
          variant={"outline"}
          size={"sm"}
          className="lg:hidden gap-2 outline-none border-none"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your search by category, price and more
          </SheetDescription>
        </SheetHeader>
        <div className="p-6">
          <ProductFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}
