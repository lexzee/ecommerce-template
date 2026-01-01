"use client";

import { CartItem, useCart } from "@/lib/cart_store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { initiatePayment, placeOrder, getPendingOrder } from "./action";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { createClient } from "@/lib/supabase/client";
import { useFormStatus } from "react-dom";

export default function ChekoutPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading checkout...</div>}
    >
      <CheckoutContent />
    </Suspense>
  );
}

export function CheckoutContent() {
  const cart = useCart();
  const router = useRouter();
  const retryOrderId = useSearchParams().get("retry");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{} | null>(null);

  const [retryOrder, setRetryOrder] = useState<any>(null);
  const [loadingRetry, setLoadingRetry] = useState(!!retryOrderId);

  useEffect(() => {
    const supabase = createClient();
    async function getUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
      } else {
        setUser(user);
      }
    }

    getUser();
  }, []);

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

  const subtotal = cart.total();
  const taxEstimate = subtotal * 0.075;
  const total = retryOrderId
    ? retryOrder?.total_amount
    : subtotal + taxEstimate;

  const defaultAddress = retryOrder?.shipping_address || {};

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    let activeOrderId = retryOrderId;
    try {
      if (!activeOrderId) {
        setStatus("Creating Order...");
        const orderRes = await placeOrder(formData, user);

        if (orderRes?.error || !orderRes?.orderId) {
          throw new Error(orderRes?.error || "Order Creation failed");
        }
        activeOrderId = orderRes.orderId;
        cart.clearCart();
      }

      setStatus("Redirect to Paystack...");
      console.log(isSubmitting);
      console.log(status);
      const paymentRes = await initiatePayment(activeOrderId!, user);

      if (paymentRes?.url) {
        window.location.href = paymentRes.url;
      } else {
        throw new Error(paymentRes?.error || "Payment Failed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStatus("Idle");
      setIsSubmitting(false);
    }
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        className="w-full mt-4"
        size={"lg"}
        disabled={pending}
        type="submit"
      >
        {pending
          ? !retryOrder
            ? "Creating Order..."
            : "Redirect to Paystack..."
          : `Pay ₦${total?.toLocaleString()}`}
      </Button>
    );
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
          ? `Complete Payment (Order #${retryOrderId.slice(0, 4)})`
          : "Checkout"}
      </h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                placeholder="John Doe"
                defaultValue={defaultAddress.fullName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="080..."
                defaultValue={defaultAddress.phone}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                required
                placeholder="22 Omi Estate, Lagos Ibadan Expressway"
                defaultValue={defaultAddress.street}
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  required
                  placeholder="Ibadan"
                  defaultValue={defaultAddress.city}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  required
                  placeholder="Oyo"
                  defaultValue={defaultAddress.state}
                />
              </div>
            </div>

            {error && (
              <p className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </p>
            )}

            {/* <Button
              className="w-full mt-4"
              size={"lg"}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? status : `Pay ₦${total?.toLocaleString()}`}
            </Button> */}
            <SubmitButton />
          </form>
        </div>

        {/* Right */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit dark:bg-gray-900/50">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-4">
            {items.map((item: CartItem) => (
              <div className="flex justify-between text-sm" key={item.id}>
                <span>
                  {item.quantity}x {item.name || item.product?.name}
                </span>
                <span>
                  ₦
                  {(
                    (item.price || item.product?.price!) * item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            ))}
            {!retryOrderId && (
              <div className="flex justify-between text-sm">
                <span>VAT</span>
                <span>₦{taxEstimate.toLocaleString()}</span>
              </div>
            )}
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
