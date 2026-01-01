import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-muted-foreground max-w-[500px] mb-8">
        Thank you for your purchase. We have received your order and are
        processing it.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        {/* We can link to an Orders History page later */}
        {/* <Link href="/account/orders"><Button>View Order</Button></Link> */}
      </div>
    </div>
  );
}
