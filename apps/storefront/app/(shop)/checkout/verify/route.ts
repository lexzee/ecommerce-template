import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendReceiptEmail } from "../action";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      new URL("/checkout?error=no_refrence", request.url)
    );
  }

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
      },
    }
  );

  const data = await verifyRes.json();

  if (data.status && data.data.status === "success") {
    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", reference)
      .single();

    if (error) console.error("Failed to update order status:", error);

    // @ts-ignore
    await sendReceiptEmail(order.id);
    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${reference}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/checkout?error=payment_failed`, request.url)
  );
}
