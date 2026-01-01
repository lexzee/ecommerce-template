import { DataTable } from "@/components/ui/data-table";
import { createTypedClient } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";

export default async function ProductsPage() {
  const [url, key] = [
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  ];
  const supabase = createTypedClient(url, key);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory across different niches.
          </p>
        </div>

        <Link href={"/products/new"} className="ml-40">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={products || []} />
    </div>
  );
}
