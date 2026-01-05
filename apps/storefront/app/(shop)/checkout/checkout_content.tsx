"use client";
import { CartItem, useCart } from "@/lib/cart_store";
import { initiatePayment, placeOrder, getPendingOrder } from "./action";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useFormStatus } from "react-dom";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/helpers";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";

export function CheckoutContent({
  user,
  savedAddress,
}: {
  user: any;
  savedAddress: any;
}) {
  const cart = useCart();
  const router = useRouter();
  const retryOrderId = useSearchParams().get("retry");

  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [retryOrder, setRetryOrder] = useState<any>(null);
  const [loadingRetry, setLoadingRetry] = useState(!!retryOrderId);

  useEffect(() => {
    if (retryOrderId) {
      getPendingOrder(retryOrderId).then((res) => {
        if (res.order) {
          setRetryOrder(res.order[0]);
        } else {
          setError(res.error || "Could not load order");
          router.push("/");
        }
        setLoadingRetry(false);
      });
    }
  }, [retryOrderId]);

  const items: CartItem[] = retryOrderId ? retryOrder?.items || [] : cart.items;
  const subtotal = retryOrderId ? retryOrder?.total_amount : cart.total();
  // const taxEstimate = subtotal * 0.075;
  const taxEstimate = 0;
  const total = retryOrderId
    ? retryOrder?.total_amount
    : subtotal + taxEstimate;

  const defaultAddress = retryOrder?.shipping_address || savedAddress;
  const hasAddress = defaultAddress && defaultAddress.street;

  const handleSubmit = async () => {
    if (!hasAddress && !retryOrderId) {
      toast.warning("Please add a delivery address in your Profile first.");
      return;
    }

    setIsSubmitting(true);
    let activeOrderId = retryOrderId;

    try {
      if (!activeOrderId) {
        const orderRes = await placeOrder(defaultAddress, user, items, total);

        if (orderRes?.error || !orderRes?.orderId) {
          throw new Error(orderRes?.error || "Order Creation failed");
        }
        activeOrderId = orderRes.orderId;
      }

      if (paymentMethod === "paystack") {
        const paymentRes = await initiatePayment(activeOrderId!, user);
        if (paymentRes?.url) {
          window.location.href = paymentRes.url;
        } else {
          throw new Error(paymentRes?.error || "Paystack init failed");
        }
        cart.clearCart();
      } else if (paymentMethod === "whatsapp") {
        const adminNumber = siteConfig.phone;
        const message = `Hello, I just placed Order #${activeOrderId?.slice(0, 8)}. \nI want to pay NGN${total.toLocaleString()} via Bank Transfer directly.`;
        const waUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

        window.open(waUrl, "_blank");
        cart.clearCart();
        router.push(`/orders/${activeOrderId}/receipt`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRetry)
    return <div className="p-10 text-center">Loading order details...</div>;

  if (!retryOrderId && cart.items.length === 0) {
    return <div className="p-10 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {retryOrderId
          ? `Complete Order #${retryOrderId.slice(0, 4)})`
          : "Checkout"}
      </h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shipping Details</h2>
              <Link href="/account/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 gap-2"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              </Link>
            </div>

            {hasAddress ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{defaultAddress.fullName}</p>
                      <p className="text-gray-600">{defaultAddress.street}</p>
                      <p className="text-gray-600">
                        {defaultAddress.city}, {defaultAddress.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <p className="text-gray-600">{defaultAddress.phone}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-6 border border-dashed rounded-lg text-center bg-gray-50">
                <p className="text-gray-500 mb-4">
                  No address found on your profile.
                </p>
                <Link href="/account/profile">
                  <Button>Add Address</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Payment method */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <RadioGroup
              defaultValue="paystack"
              onValueChange={setPaymentMethod}
              className="grid gap-4"
            >
              {/* Paystack Option */}
              <div>
                <RadioGroupItem
                  value="paystack"
                  id="paystack"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="paystack"
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-gray-50 hover:text-blue-600 peer-data-[state=checked]:text-blue-600"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-semibold">Paystack</span>
                      <p className="text-xs text-gray-500">
                        Cards, Bank Transfer, USSD
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              {/* WhatsApp Option */}
              <div>
                <RadioGroupItem
                  value="whatsapp"
                  id="whatsapp"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="whatsapp"
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50 hover:text-green-600 peer-data-[state=checked]:text-green-600"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-semibold">Chat to Pay</span>
                      <p className="text-xs text-gray-500">
                        Direct Transfer via WhatsApp
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </section>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || (!hasAddress && !retryOrderId)}
          >
            {isSubmitting ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
          </Button>
        </div>

        {/* Right */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit border dark:bg-gray-900/50">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-4">
            {items.map((item: CartItem) => (
              <div
                className="flex justify-between items-start text-sm"
                key={item.id}
              >
                <div className="flex gap-3">
                  <span className="font-bold text-gray-500">
                    {item.quantity}x
                  </span>
                  <span> {item.name || item.product?.name}</span>
                </div>
                <span>
                  ₦
                  {(
                    (item.price || item.product?.price!) * item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 space-y-2">
              {!retryOrderId && (
                <div className="flex justify-between text-sm">
                  <span>VAT (7.5%)</span>
                  <span>₦{taxEstimate.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₦{total?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
