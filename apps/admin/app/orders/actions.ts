"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/orders`);
  return {
    success: true,
    error: null,
    message: `Status updated to: ${newStatus}`,
  };
}
