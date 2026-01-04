import { DataTable } from "@/components/ui/data-table";
import { createTypedClient } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { SearchInput } from "@/components/search_input";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [url, key] = [
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  ];
  const supabase = createTypedClient(url, key);

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  let dbQuery = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }
  const { data: products } = await dbQuery;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory ({products?.length || 0}).
          </p>
        </div>

        <Link href={"/products/new"} className="ml-40">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <SearchInput />
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <DataTable columns={columns} data={products || []} />
      </div>
    </div>
  );
}
