import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@repo/database";
import { sendEmailReceipt } from "@/lib/email_service";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
];
const paystackSKey = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const hash = crypto
      .createHmac("sha512", paystackSKey)
      .update(rawBody)
      .digest("hex");

    const signature = request.headers.get("x-paystack-signature");

    if (hash !== signature) {
      console.error("Security Alert: Invalid Webhook Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("Webhook received:", event.event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const supabaseAdmin = createAdminClient(url, key);

      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", reference);

      if (error) {
        console.error("Webhook DB Error:", error);
        return NextResponse.json(
          { error: "DB Update failed" },
          { status: 500 }
        );
      }

      console.log(`✅ Order ${reference} confirmed via Webhook`);

      const { data: fullOrder } = await supabaseAdmin
        .from("orders")
        .select(
          `
           *,
           items:order_items (
             quantity, unit_price,
             products (name) 
           ),
           profiles:user_id (email, full_name)
        `
        )
        .eq("id", reference)
        .single();

      if (fullOrder) {
        await sendEmailReceipt(fullOrder);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Crash:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
