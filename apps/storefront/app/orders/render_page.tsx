import { formatCurrency, getStatusColor } from "@/lib/helpers";
import { getUserManually } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Calendar, Clock, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

async function RenderOrdersPage() {
  const supabase = await createClient();

  const user = await getUserManually();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
            *,
            items:order_items (
                id,
                quantity,
                unit_price,
                product: products (
                    name,
                    slug,
                    images
                )
            )
        `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="flex justify-center mb-4">
          <Package className="h-16 w-16 text-muted-foreground opacity-50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
        <p className="text-muted-foreground mb-8">
          You haven't placed any orders yet.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cotainer py-10 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      <div className="space-y-8">
        {orders.map((order: any) => (
          <Collapsible
            key={order.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-card"
          >
            {/* Order Header */}
            <CollapsibleTrigger className="w-full bg-muted/30 p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 border-b">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-lg">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} uppercase tracking-wider`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </CollapsibleTrigger>

            {/* Order Items */}
            <CollapsibleContent className="p-4 sm:p-6">
              <ul className="divide-y">
                {order.items.map((item: any) => (
                  <li
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                  >
                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                      {item.product.images ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover h-full w-full"
                          width={10000}
                          height={10000}
                        />
                      ) : (
                        <span>NaN</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product?.slug}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-medium">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer / Actions */}
              {order.status === "pending" && (
                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Link href={`/checkout?retry=${order.id}`}>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                      Complete Payment
                    </button>
                  </Link>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

export default RenderOrdersPage;
