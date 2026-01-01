"use client";
import type { Database } from "@repo/database";
import { ColumnDef } from "@tanstack/react-table";
export type Product = Database["public"]["Tables"]["products"]["Row"];

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(price);
      // return formatted;
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock_quantity",
    header: "Stock Quantity",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      // const date = new Date(row.getValue("created_at"));
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString("en-NG")}</div>;
    },
  },
  {
    accessorKey: "is_available",
    header: "Available",
    cell: ({ row }) => {
      const isAvailable = row.getValue("is_available");
      return <div>{isAvailable ? "In Stock" : "Out of Stock"}</div>;
    },
  },
];
