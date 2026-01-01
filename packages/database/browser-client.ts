import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";

export const createBrowserClientSafe = (url: string, key: string) => {
  return createBrowserClient<Database>(url, key);
};
