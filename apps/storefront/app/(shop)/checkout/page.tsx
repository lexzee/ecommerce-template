"use server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CheckoutContent } from "./checkout_content";
import { getJwt } from "@/lib/helper-server";

export default async function ChekoutPage() {
  const jwt = await getJwt();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("delivery_address, full_name, phone, email")
    .eq("id", user.id)
    .single();

  const savedAddress = (profile?.delivery_address as any) || null;
  const userDetails = {
    fullName: profile?.full_name || profile?.email || user.email,
    phone: profile?.phone,
    ...savedAddress,
  };

  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-10 text-center">Loading checkout...</div>
      }
    >
      <CheckoutContent user={user} savedAddress={userDetails} />
    </Suspense>
  );
}
