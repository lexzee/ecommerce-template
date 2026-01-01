import { formatCurrency, getStatusColor } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "../actions";
import ManagementForm from "./management-form";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
        *,
        items:order_items(
            id,
            quantity,
            unit_price,
            product:products (name, images)
        )
        `
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="space-y-6 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant={"ghost"} size={"icon"}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Order #{order.id.slice(0, 8)}
            <Badge className={`${cn(getStatusColor(order.status))}`}>
              {order.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-muted-forground text-sm">
            Placed on {new Date(order.created_at).toLocaleDateString("en-NG")}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Col: Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item: any) => (
                  <div
                    className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                    key={item.id}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden relative">
                        <Image
                          src={item.product?.images[0] || "/placeholder.png"}
                          alt={item.product?.name || item.id}
                          width={100}
                          height={100}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="flex justify-between border-t pt-4 font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Customer 8 Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ManagementForm order={order} />
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <span className="font-semibold block">Name</span>
                {order.shipping_address?.fullName}
              </div>
              <div>
                <span className="font-semibold block">Phone</span>
                {order.shipping_address?.phone}
              </div>
              <div>
                <span className="font-semibold block">Shipping Address</span>
                {order.shipping_address?.street}
                <br />
                {order.shipping_address?.city}, {order.shipping_address?.city}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
