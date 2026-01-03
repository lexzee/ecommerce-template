"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(0).max(500),
});

export type ReviewState = {
  success?: boolean;
  error?: string;
};

export async function submitReview(prevState: ReviewState, formData: FormData) {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to review." };

  const productId = formData.get("productId") as string;
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw ? parseInt(ratingRaw as string) : 0;
  const comment = formData.get("comment") as string;

  // 2. Validate Input
  const result = reviewSchema.safeParse({ productId, rating, comment });
  if (!result.success) {
    return { error: "Invalid input.", success: false };
  }

  // 3. Check for "Verified Purchase"
  // We check if the user has a delivered order containing this product
  const { data: orders } = await supabase
    .from("orders")
    .select("items")
    .eq("user_id", user.id)
    .or("status.eq.delivered,status.eq.shipped"); // Only count shipped/delivered

  // Check JSONB items for the product_id
  const hasPurchased = orders?.some(
    (order) =>
      // Assuming your items structure is consistent
      Array.isArray(order.items) &&
      order.items.some(
        (item: any) => item.product_id === productId || item.id === productId
      )
  );

  // 4. Insert Review
  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: productId,
    rating: rating,
    comment: comment,
    is_verified: !!hasPurchased, // Mark as verified if found
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "You have already reviewed this product.",
        success: false,
      };
    }

    return { error: "Failed to submit review.", success: false };
  }

  revalidatePath(`/products/${productId}`);
  return { success: true, error: "" };
}
