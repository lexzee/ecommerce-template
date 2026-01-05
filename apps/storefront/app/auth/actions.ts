"use server";

import { getJwt } from "@/lib/helper-server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getSupabseCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // @ts-ignore
  const projectId = url.split("//")[1].split(".")[0];
  return `sb-${projectId}-auth-token`;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Error:", error.message);
    return { error: error.message };
  }

  // Manual Cookie fix
  if (data.session) {
    const cookieName = getSupabseCookieName();
    const cookieVlaue = JSON.stringify(data.session);

    cookieStore.set({
      name: cookieName,
      value: cookieVlaue,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // path: "/",
      maxAge: data.session.expires_in,
    });
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Registration Error:", error.message);
    return { error: error.message };
  }

  // Redirect to "Check Email" page later
  login(formData);
  redirect("/");
}

export async function signout() {
  const jwt = await getJwt();
  const supabase = await createAdminClient();
  await supabase.auth.admin.signOut(jwt);
  revalidatePath("/");
  redirect("/");
}
