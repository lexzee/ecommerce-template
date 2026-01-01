"use client";

import { formatCurrency, getStatusColor } from "@/lib/helpers";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";

// This type matches your Supabase table shape
export type Order = {
  id: string;
  total_amount: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  created_at: string;
  shipping_address: {
    fullName: string;
    city: string;
  };
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.getValue<string>("id").slice(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString("en-NG")}</div>;
    },
  },
  {
    accessorKey: "shipping_address",
    header: "Customer",
    cell: ({ row }) => {
      const address = row.original.shipping_address;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{address?.fullName || "N/A"}</span>
          <span className="text-xs text-muted-foreground">
            {address?.city || "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <>
          <Badge className={`${cn(getStatusColor(status))}`}>{status}</Badge>
        </>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      return (
        <div className="text-right font-medium">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/orders/${order.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
