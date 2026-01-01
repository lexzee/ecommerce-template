"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type FormState = {
  success: boolean;
  message: string;
  error: string | null;
};

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Profilt Update Error:", error);
    return { error: "Failed to update profile", success: false, message: "" };
  }

  revalidatePath("/settings");
  return {
    success: true,
    message: "Profile updated successfully!",
    error: null,
  };
}
