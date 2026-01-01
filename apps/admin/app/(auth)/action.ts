"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
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
    return redirect("/login?message=Could not authenticate user");
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
  const supabase = await createClient();
  const origin = headers().then((res) => res.get("origin"));

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Registration Error:", error.message);
    return redirect("/login?message=Could not register user");
  }

  // Redirect to "Check Email" page later
  login(formData);
  redirect("/");

  // return redirect("/login?message=Check email to continue sign in process");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
