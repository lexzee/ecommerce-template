"use server";

import { getJwt } from "@/lib/server_helpers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type FormState = {
  success: boolean;
  message?: string | null;
  error?: string | null;
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

export async function updatePassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const jwt = await getJwt();
  const supabase = await createAdminClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
      message: null,
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match", message: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);

  if (!user) {
    return { success: false, error: "You must be logged in.", message: null };
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: password,
  });
  if (error) {
    return { success: false, error: error.message, message: null };
  }

  revalidatePath("/settings");
  return {
    success: true,
    message: "Password updated successfully!",
    error: null,
  };
}
