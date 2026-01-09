import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Package, Receipt, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { sendReceiptEmail } from "../action";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const { orderId } = await searchParams;

  // Note: Ideally, ensure sendReceiptEmail checks if an email was already sent
  // to prevent duplicate emails if the user refreshes this page.
  await sendReceiptEmail(orderId);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="h-24 w-24 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12" />
        </div>
        {/* Decorative Ring */}
        <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping opacity-25 duration-1000" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
        Order Placed Successfully!
      </h1>

      <p className="text-muted-foreground text-lg max-w-[500px] mb-8 leading-relaxed">
        Thank you for your purchase. We have received your order and are getting
        it ready.
      </p>

      {/* Order Reference Box */}
      <div className="bg-muted/50 border border-border rounded-lg px-6 py-3 mb-10 flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Order Reference
        </span>
        <span className="font-mono text-xl font-bold tracking-widest text-foreground">
          {orderId.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/orders">
          <Button className="w-full sm:w-auto gap-2 h-11">
            <Package className="h-4 w-4" />
            View Order
          </Button>
        </Link>

        <Link href={`/orders/${orderId}/receipt`}>
          <Button variant="outline" className="w-full sm:w-auto gap-2 h-11">
            <Receipt className="h-4 w-4" />
            Receipt
          </Button>
        </Link>

        <Link href="/">
          <Button variant="ghost" className="w-full sm:w-auto gap-2 h-11">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
