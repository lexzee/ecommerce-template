"use client";
import { logActivity } from "@/lib/audit";
import { createClient } from "@/lib/supabase/client";
import { type Database } from "@repo/database";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const formatted = name.length > 25 ? name.slice(0, 25) + "..." : name;
      return <div className="font-medium">{formatted}</div>;
    },
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
  // {
  //   accessorKey: "is_available",
  //   header: "Available",
  //   cell: ({ row }) => {
  //     const isAvailable = row.getValue("is_available");
  //     return <div>{isAvailable ? "In Stock" : "Out of Stock"}</div>;
  //   },
  // },
  {
    accessorKey: "is_available",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("is_available");
      return (
        <div
          className={`text-xs px-2 py-1 rounded-full w-fit ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {isAvailable ? "Active" : "Draft"}
        </div>
      );
    },
  },

  // Actions Column
  {
    // accessorKey: "actions",
    // header: "Action",
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      const router = useRouter();

      const onDelete = async () => {
        const confirm = window.confirm(
          "Are you sure you want to delete this product?"
        );
        if (!confirm) return;

        // const supabase = createAdminClient(
        //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
        //   process.env.SUPABASE_SERVICE_ROLE_KEY!
        // );

        const supabase = createClient();

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", product.id);

        if (error) {
          toast.error("Failed to delete");
          console.error("Failed to delete");
        } else {
          await logActivity("PRODUCT_DELETION", product.id, {
            deleted: product.name,
          });
          toast.success("Product deleted");
          console.log("Product deleted");
          router.refresh();
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8 p-0">
              {/* <span className="sr-only">Open menu</span> */}
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/products/${product.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="w-4 h-4" /> Edit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 cursor-pointer"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
