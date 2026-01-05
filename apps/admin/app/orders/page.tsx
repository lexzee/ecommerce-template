import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Adjust path to where your DataTable lives
import { SearchInput } from "@/components/search_input";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const query = typeof q === "string" ? q : "";

  let dbQuery = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("text_id", `%${query}%`);
  }

  // Fetch orders
  const { data: orders, error } = await dbQuery;

  if (error) {
    console.log(error);

    return <div>Error loading orders</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="flex w-full">
        <SearchInput placeholder="Search orders..." />
      </div>

      <div className="bg-background rounded-md border">
        {/* Reuse the DataTable component you already have */}
        <DataTable columns={columns} data={orders || []} />
      </div>
    </div>
  );
}
