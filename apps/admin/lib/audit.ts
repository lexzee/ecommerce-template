"use server";

import { headers } from "next/headers";
import { createClient } from "./supabase/server";

export async function logActivity(
  action: string,
  resourceId: string,
  details: Record<string, any>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    resource_id: resourceId,
    details,
    ip_address: ip,
  });

  if (error) console.error("Failed to write audit log:", error);
}
