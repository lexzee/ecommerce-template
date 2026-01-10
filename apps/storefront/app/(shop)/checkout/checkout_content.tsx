"use client";

import { siteConfig } from "@/config/site";
import { CartItem, useCart } from "@/lib/cart_store";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPendingOrder, initiatePayment, placeOrder } from "./action";

interface CheckoutContentProps {
  user: any; // Type this strictly if you have the User type
  savedAddress: any; // Type this strictly if you have the Address type
}

export function CheckoutContent({ user, savedAddress }: CheckoutContentProps) {
  const cart = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retryOrderId = searchParams.get("retry");

  // Default to Paystack if enabled, otherwise WhatsApp
  const [paymentMethod, setPaymentMethod] = useState(
    siteConfig.features.enablePaystack ? "paystack" : "whatsapp"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryOrder, setRetryOrder] = useState<any>(null);
  const [loadingRetry, setLoadingRetry] = useState(!!retryOrderId);

  // Helper for Currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(siteConfig.billing.currency.locale, {
      style: "currency",
      currency: siteConfig.billing.currency.code,
    }).format(amount);
  };

  // 1. Handle Retry Logic (Fetching existing order)
  useEffect(() => {
    if (retryOrderId) {
      getPendingOrder(retryOrderId).then((res) => {
        if (res.order) {
          setRetryOrder(res.order[0]);
        } else {
          toast.error(res.error || "Could not load order");
          router.push("/");
        }
        setLoadingRetry(false);
      });
    }
  }, [retryOrderId, router]);

  // 2. Calculate Totals (Retry vs New Cart)
  const items: CartItem[] = retryOrderId ? retryOrder?.items || [] : cart.items;

  // Logic: If retrying, use the stored total. If new, calculate based on cart.
  const subtotal = retryOrderId ? retryOrder?.total_amount : cart.total();
  const taxEstimate = retryOrderId ? 0 : subtotal * siteConfig.billing.taxRate;
  const total = retryOrderId
    ? retryOrder?.total_amount
    : subtotal + taxEstimate;

  const defaultAddress = retryOrder?.shipping_address || savedAddress;
  const hasAddress = defaultAddress && defaultAddress.street;

  // 3. Submit Handler
  const handleSubmit = async () => {
    if (!hasAddress && !retryOrderId) {
      toast.warning("Please add a delivery address in your Profile first.");
      return;
    }

    setIsSubmitting(true);
    let activeOrderId = retryOrderId;

    try {
      // A. Create Order (if not retrying)
      if (!activeOrderId) {
        const orderRes = await placeOrder(defaultAddress, user, items, total);

        if (orderRes?.error || !orderRes?.orderId) {
          throw new Error(orderRes?.error || "Order Creation failed");
        }
        activeOrderId = orderRes.orderId;
      }

      // B. Process Payment
      if (paymentMethod === "paystack") {
        const paymentRes = await initiatePayment(activeOrderId!, user);
        if (paymentRes?.url) {
          window.location.href = paymentRes.url;
        } else {
          throw new Error(paymentRes?.error || "Payment initialization failed");
        }
        cart.clearCart();
      } else if (paymentMethod === "whatsapp") {
        const itemsList = items
          .map(
            (item) => `- ${item.quantity}x ${item.name || item.product?.name}`
          )
          .join("\n");

        const message = `*New Order: #${activeOrderId?.slice(0, 8).toUpperCase()}*
------------------
*Customer:* ${defaultAddress?.fullName || user.user_metadata?.full_name || "Guest"}
*Location:* ${defaultAddress?.city}, ${defaultAddress?.state}
*Total:* ${formatPrice(total)}

*Items:*
${itemsList}
------------------
_I am ready to pay. Please confirm delivery details._`;

        const waUrl = `https://wa.me/${siteConfig.contact.phone}?text=${encodeURIComponent(message)}`;

        window.open(waUrl);
        cart.clearCart();
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong processing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Loading States
  if (loadingRetry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!retryOrderId && cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">
        {retryOrderId
          ? `Complete Order #${retryOrderId.slice(0, 8)}`
          : "Checkout"}
      </h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-8">
          {/* Section: Address */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Shipping Details</h2>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary hover:text-primary/80"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </Link>
            </div>

            {hasAddress ? (
              <Card className="border-muted bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-full">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {defaultAddress.fullName}
                      </p>
                      <p className="text-muted-foreground">
                        {defaultAddress.street}
                      </p>
                      <p className="text-muted-foreground">
                        {defaultAddress.city}, {defaultAddress.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 ml-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {defaultAddress.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-xl text-center bg-muted/30">
                <p className="text-muted-foreground mb-4">
                  No shipping address found.
                </p>
                <Link href="/profile">
                  <Button variant="outline">Add Address</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Section: Payment Method */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Method</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid gap-4"
            >
              {/* Option: Paystack */}
              {siteConfig.features.enablePaystack && (
                <div>
                  <RadioGroupItem
                    value="paystack"
                    id="paystack"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="paystack"
                    className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer bg-card hover:bg-muted/50 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-semibold block">Paystack</span>
                        <span className="text-xs text-muted-foreground">
                          Cards, Bank Transfer, USSD
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {/* Option: WhatsApp */}
              {siteConfig.features.enableWhatsApp && (
                <div>
                  <RadioGroupItem
                    value="whatsapp"
                    id="whatsapp"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="whatsapp"
                    className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer bg-card hover:bg-muted/50 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <span className="font-semibold block">Chat to Pay</span>
                        <span className="text-xs text-muted-foreground">
                          Manual Transfer via WhatsApp
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </section>

          {/* Checkout Button */}
          <Button
            size="lg"
            className="w-full text-lg h-12 shadow-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || (!hasAddress && !retryOrderId)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? "Processing..." : `Pay ${formatPrice(total)}`}
          </Button>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="bg-muted/40 p-6 rounded-xl border border-border h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map((item: CartItem) => {
              const price = item.price || item.product?.price || 0;
              return (
                <div
                  className="flex justify-between items-start text-sm"
                  key={item.id}
                >
                  <div className="flex gap-3">
                    <span className="font-mono font-medium text-muted-foreground">
                      {item.quantity}x
                    </span>
                    <span className="text-foreground max-w-[200px] truncate">
                      {item.name || item.product?.name}
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatPrice(price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {!retryOrderId && siteConfig.billing.taxRate > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Tax ({(siteConfig.billing.taxRate * 100).toFixed(1)}%)
                </span>
                <span>{formatPrice(taxEstimate)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-foreground pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
