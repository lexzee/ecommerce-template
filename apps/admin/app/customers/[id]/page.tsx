import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { ArrowLeft, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("profiles")
    .select(
      `
      *,
      orders (
        id,
        created_at,
        status,
        total_amount,
        items:order_items(count)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!customer) return notFound();

  const orders = customer.orders || [];
  const totalSpent = orders.reduce(
    (sum: number, o: any) =>
      sum +
      (o.status === "paid" || o.status === "shipped" || o.status === "delivered"
        ? o.total_amount
        : 0),
    0
  );
  const lastOrderDate =
    orders.length > 0
      ? new Date(orders[0].created_at).toLocaleDateString("en-NG")
      : "Never";

  const address = customer.delivery_address as any;

  return (
    <div className="flex-1 space-y-4 p-2 sm:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {customer.full_name}
        </h1>
        {customer.is_role && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Admin/Staff
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent (LTV)
            </CardTitle>
            <span className="text-green-600 font-bold">₦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(totalSpent)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <span className="text-xs text-muted-foreground">Date</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {lastOrderDate}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Left Column: Contact Info */}
        <Card className="col-span-3 h-fit">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Personal details and shipping info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {customer.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{customer.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Customer ID: {customer.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || "No phone number"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-medium">Shipping Address</span>
                  {address?.street ? (
                    <span className="text-muted-foreground">
                      {address.street}
                      <br />
                      {address.city}, {address.state}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      No address provided
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Order History */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent purchases by this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:underline text-blue-600"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-NG").format(
                        new Date(order.created_at)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          order.status === "paid"
                            ? "border-green-500 text-green-600 bg-green-50"
                            : order.status === "pending"
                              ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                              : ""
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(order.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
