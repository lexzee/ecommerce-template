import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Adjust path to where your DataTable lives

export default async function OrdersPage() {
  const supabase = await createClient();

  // Fetch orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error loading orders</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="bg-background rounded-md border">
        {/* Reuse the DataTable component you already have */}
        <DataTable columns={columns} data={orders || []} />
      </div>
    </div>
  );
}
