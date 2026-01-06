"use server";

import { FormValues } from "@/components/accounts/profile_form";
import { getJwt } from "@/lib/helper-server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = {
  success: boolean;
  message?: string | null;
  error?: string | null;
};

export async function updateProfile(values: FormValues) {
  const supabase = await createClient();
  const jwt = await getJwt();
  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.firstName + " " + values.secondName,
      phone: values.phone,
      delivery_address: values.address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user?.id);

  if (error) {
    return {
      success: false,
      message: `Database update failed: ${error.message}`,
    };
  }

  revalidatePath("/account/profile");
  return {
    success: true,
    message: "Profile updated successfully!",
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
  refresh();
  return {
    success: true,
    message: "Password updated successfully!",
    error: null,
  };
}
