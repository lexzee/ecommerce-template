import { PrintButton } from "@/components/orders/print_button";
import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/client";
import { getUserManually } from "@/lib/supabase/proxy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { notFound, redirect } from "next/navigation";

export async function ReceiptDetails({ id }: { id: string }) {
  const user = await getUserManually();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
              *,
              order_items (
                  *,
                  products (name, attributes)
              )
          `
    )
    .match({ id: id, user_id: user.id })
    .single();

  if (!order) return notFound();

  const userAddress = order.shipping_address;

  return (
    <div>
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            {siteConfig.name}
          </h1>
          <div className="text-sm mt-2 space-y-1 text-gray-600">
            <p>{siteConfig.address.street}</p>
            <p>
              {siteConfig.address.state}, {siteConfig.address.country}
            </p>
            <p>{siteConfig.address.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold mb-2">RECEIPT</h2>
          <p className="text-sm text-gray-600">
            Order #: {order.id.slice(0, 8)}
          </p>
          <div className="text-sm text-gray-600">
            Date: {new Date(order.created_at).toLocaleDateString("en-NG")}
          </div>
        </div>
      </div>

      {/* Bill TO () */}
      <div className="clear-both pt-8 mb-8 text-sm">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">
          Bill To
        </h3>
        <p className="font-semibold text-base">
          {userAddress.fullName || "Anon"}
        </p>
        <p className="font-semibold text-base">{user.email}</p>
        {/* <p className="font-semibold">{email}</p> */}
        {/* Customer Address Here... */}
        <p>{userAddress.street}</p>
        <p>
          {userAddress.city}, {userAddress.state}
        </p>
      </div>

      {/* ITEMS TABLE */}
      <Table className="w-full text-sm mb-8">
        <TableHeader>
          {/* <TableRow className="border-b border-black text-left text-black"> */}
          <TableRow>
            <TableHead className="w-1/3 text-black">Item</TableHead>
            <TableHead className=" text-center text-black">Qty</TableHead>
            <TableHead className=" text-right text-black">Price</TableHead>
            <TableHead className=" text-right text-black">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 divide-dashed">
          {order.order_items.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="py-3 pr-4">
                <div className="font-medium">
                  {item.products?.name || "Product"}
                </div>

                {/* Dynamic Attributes Rendering */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.attributes &&
                    Object.entries(item.attributes).map(([key, value]) => (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
              </TableCell>
              <TableCell className="py-3 text-center align-top">
                {item.quantity}
              </TableCell>
              <TableCell className="py-3 text-right align-top">
                {formatCurrency(item.unit_price)}
              </TableCell>
              <TableCell className="py-3 text-right align-top">
                {formatCurrency(item.unit_price * item.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* TOTALS */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
          {/* Add Tax/Shipping lines here if your DB tracks them separately */}
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER / ACTIONS */}
      <div className="flex flex-col items-center gap-4 mt-12 print:hidden">
        <PrintButton />
        <p className="text-xs text-gray-400">
          Have questions? Contact support with your order ID.
        </p>
      </div>
    </div>
  );
}
