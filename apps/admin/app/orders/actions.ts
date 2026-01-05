"use server";

import { logActivity } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import ReceiptEmail from "@workspace/ui/components/receipt-email";
import { render } from "@react-email/components";
import { transporter } from "@/lib/email-service";

export type FormState = {
  error: string | null;
  success: boolean;
  message: string | null;
};

export async function updateOrderStatus(
  //   prevState: any,
  orderId: string,
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient();
  const newStatus = formData.get("status") as string;

  const { data: currentOrder } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const oldStatus = currentOrder?.status;

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    return {
      error: `Failed to update order ${error.message}`,
      success: false,
      message: null,
    };
  }

  await logActivity("ORDER_STATUS_UPDATE", orderId, {
    old_status: oldStatus,
    new_status: newStatus,
  });

  console.log(newStatus);
  if (newStatus === "paid") {
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items (
          id, quantity, unit_price,
          products (name)
        ),
        profiles:user_id ( email, full_name )
      `
      )
      .eq("id", orderId)
      .single();

    if (order && order.profiles?.email) {
      const emailHtml = await render(
        ReceiptEmail({
          orderId: order.id,
          date: new Date(order.created_at).toLocaleDateString("en-NG"),
          customerName: order.profiles.full_name || "Valued Customer",
          customerEmail: order.profiles.email,
          shippingAddress: order.shipping_address,
          items: order.items,
          totalAmount: order.total_amount,
        })
      );

      try {
        await transporter.sendMail({
          from: "Scents by NurryO <receipts@resend.dev>",
          to: order.profiles.email,
          subject: `Payment Receipt: Order #${order.id.slice(0, 8)}`,
          html: emailHtml,
        });

        console.log("✅ Email receipt sent to", order.profiles.email);
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError);
      }
    }
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/orders`);
  return {
    success: true,
    error: null,
    message: `Status updated to: ${newStatus}`,
  };
}
