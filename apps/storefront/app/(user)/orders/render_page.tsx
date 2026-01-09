import { siteConfig } from "@/config/site";
import { getUserManually } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@workspace/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import { Calendar, ChevronDown, Clock, Package, Receipt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// --- Types ---
interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
    slug: string;
    images: string[] | null;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

// --- Helpers ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(siteConfig.billing.currency.locale, {
    style: "currency",
    currency: siteConfig.billing.currency.code,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900";
    case "shipped":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
};

async function RenderOrdersPage() {
  const supabase = await createClient();
  const user = await getUserManually();

  if (!user) redirect("/login");

  const { data: rawOrders } = await supabase
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

  const orders = (rawOrders as unknown as Order[]) || [];

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl bg-muted/20">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">No orders yet</h1>
        <p className="text-muted-foreground mb-6 max-w-[300px]">
          It looks like you haven't placed any orders with us yet.
        </p>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Order History</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} Orders
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Collapsible
            key={order.id}
            className="group border border-border rounded-lg overflow-hidden shadow-sm bg-card transition-all hover:shadow-md"
          >
            {/* Header Trigger */}
            <CollapsibleTrigger className="w-full bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider",
                      getStatusColor(order.status)
                    )}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 mt-2 sm:mt-0">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                  <p className="font-bold text-foreground">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>

                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>

            {/* Content */}
            <CollapsibleContent>
              <div className="p-4 sm:p-6 bg-card">
                <ul className="divide-y divide-border">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0 relative border border-border">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product?.slug}`}
                          className="font-medium text-sm hover:text-primary transition-colors truncate block"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>

                      <div className="text-right font-medium text-sm">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                  <Link
                    href={`/orders/${order.id}/receipt`}
                    className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Receipt className="mr-2 h-3.5 w-3.5" />
                    Download Receipt
                  </Link>

                  {order.status === "pending" && (
                    <Link href={`/checkout?retry=${order.id}`}>
                      <Button size="sm">Complete Payment</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

export default RenderOrdersPage;
