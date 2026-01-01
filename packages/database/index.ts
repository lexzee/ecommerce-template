import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export * from "./types";
export * from "./browser-client";

export const createTypedClient = (url: string, key: string) => {
  return createClient<Database>(url, key);
};

export const createAdminClient = (url: string, skey: string) => {
  // return createClient<Database>(url, skey, {
  return createClient(url, skey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
