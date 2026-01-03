import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
// import { createBrowserClient } from "@supabase/ssr";

export * from "./types";
export * from "./browser-client";

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export const createTypedClient = (url: string, key: string) => {
  if (typeof window === "undefined") {
    return createClient<Database>(url, key);
  }

  if (!browserClient) {
    browserClient = createClient<Database>(url, key);
  }

  return browserClient;
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
