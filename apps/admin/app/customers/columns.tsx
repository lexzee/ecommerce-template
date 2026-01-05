"use client";
import { Database } from "@repo/database";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ArrowUpDown, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CustomerProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_role: boolean;
  delivery_address: {
    street?: string;
    city?: string;
    state?: string;
  } | null;
  // Calculated fields (joined from orders)
  total_spent: number;
  orders_count: number;
};

export const columns: ColumnDef<CustomerProfile>[] = [
  {
    accessorKey: "full_name",
    header: "Customer",
    cell: ({ row }) => {
      const id = row.original.id as string;
      return (
        <Link href={`/customers/${id}`}>
          <div className="flex flex-col">
            <span className="font-medium">
              {row.getValue("full_name") || "No Name"}
            </span>
            {row.original.is_role && (
              <Badge
                variant={"outline"}
                className="w-fit mt-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200"
              >
                Admin / Staff
              </Badge>
            )}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact Info",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      const phone = row.original.phone;
      return (
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span>{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "delivery_address",
    header: "Location",
    cell: ({ row }) => {
      const addr = row.original.delivery_address;
      console.log(addr);

      if (!addr || !addr.city)
        return <span className="text-xs text-gray-400">N/A</span>;
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-gray-400" />
          {addr.city}, {addr.state}
        </div>
      );
    },
  },
  {
    accessorKey: "orders_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Orders <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="pl-6">{row.original.orders_count}</div>,
  },
  {
    accessorKey: "total_spent",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full text-right"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        LTV <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(row.original.total_spent);
      return (
        <div className="text-right font-medium text-green-700">{formatted}</div>
      );
    },
  },
];
