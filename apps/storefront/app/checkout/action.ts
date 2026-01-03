"use server";
import { getUserManually } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@repo/database";
import { error } from "console";
import { redirect } from "next/navigation";

const [url, key, adminKey] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
];

const [paystackSKey, paystackPKey] = [
  process.env.PAYSTACK_SECRET_KEY!,
  process.env.PAYSTACK_PUBLC_KEY!,
];

export async function placeOrder(formData: FormData, user: any) {
  const supabase = await createClient();
  const supabaseAdminClient = createAdminClient(url, adminKey);
  if (!user) return { error: "You must be logged in to continue!" };

  const address = {
    fullName: formData.get("fullName"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    phone: formData.get("phone"),
  };

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("quantity, product: products(id, price)")
    .eq("user_id", user.id);

  //   console.log(cartItems);

  if (!cartItems || cartItems.length === 0) return { error: "Cart is empty" };

  const total = cartItems.reduce(
    (sum: number, item: any) => sum + item.quantity * item.product.price,
    0
  );
  const vat = total * 0.075;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: total + vat,
      shipping_address: address,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };
  //   console.log(order);

  const orderItemsData = cartItems.map((item: any) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  //   console.log(orderItemsData);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);
  if (itemsError)
    return { error: "Failed to save items", message: itemsError.message };

  await supabase.from("cart_items").delete().eq("user_id", user.id);
  //   console.log("🟢 ORDER: Success! Order ID:", order.id);

  // await supabase
  //   .from("profiles")
  //   .update({
  //     phone: formData.get("phone"),
  //     delivery_address: {
  //       street: formData.get("street"),
  //       city: formData.get("city"),
  //       state: formData.get("state"),
  //     },
  //   })
  //   .eq("id", user.id)
  //   .is("delivery_address", null);

  return { sucess: true, orderId: order.id };
}

export async function initiatePayment(orderId: string, user: any) {
  const supabase = await createClient();
  console.log("Fetching order details...");
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) {
    console.log("Failed to fetch order...");
    return { error: "Order not found" };
  }

  console.log("Preparing paystack request");
  const paystackUrl = "https://api.paystack.co/transaction/initialize";
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/verify`;

  try {
    const response = await fetch(paystackUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email || "customer@email.com",
        amount: Math.round(order.total_amount * 100),
        reference: order.id,
        callback_url: callbackUrl,
        channels: ["card", "bank", "ussd", "bank_transfer"],
        metadata: {
          order_id: order.id,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("Paystack Error:", data.message);

      return {
        error:
          "Payment gateway error: " + data.message ||
          "Payment initialization failed",
      };
    }

    return { url: data.data.authorization_url };
  } catch (e) {
    console.error("Payment Action Crash:", e);
    return { error: "Failed to connect to payment provider" };
  }
}

export async function getPendingOrder(orderId: string) {
  const supabase = await createClient();
  const user = await getUserManually();
  if (!user) return { error: "Not logged in!" };

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items: order_items (
        id,
        quantity,
        unit_price,
        product:products (name, price)
      )
    `
    )
    .match({ id: orderId, user_id: user.id, status: "pending" });

  if (error || !order) {
    return { error: "Order not found or already paid" };
  }

  return { order };
}
