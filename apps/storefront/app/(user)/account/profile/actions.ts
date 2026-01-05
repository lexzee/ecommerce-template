"use server";

import { FormValues } from "@/components/accounts/profile_form";
import { getJwt } from "@/lib/helper-server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
