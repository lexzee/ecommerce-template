import { createClient } from "@/lib/supabase/server";
import { columns, CustomerProfile } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        orders (
            id,
            total_amount,
            status
        )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
    return <div className="p-10 text-red-500">Error loading customers</div>;
  }

  const customers: CustomerProfile[] = (rawData || []).map((profile: any) => {
    const validOrders =
      profile.orders?.filter(
        (o: any) =>
          o.status === "paid" ||
          o.status === "shipped" ||
          o.status === "delivered"
      ) || [];

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      is_role: profile.is_role,
      delivery_address: profile.delivery_address,
      orders_count: validOrders.length,
      total_spent: validOrders.reduce(
        (sum: number, o: any) => sum + (o.total_amount || 0),
        0
      ),
    };
  });

  return (
    <div className="container mx-auto py-10 px-2 sm:px-8">
      <div className="flex items-center justify-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your {customers.length} registered users.
          </p>
        </div>
      </div>

      <div className="bg-background rounded-md border">
        <DataTable columns={columns} data={customers} />
      </div>
    </div>
  );
}
