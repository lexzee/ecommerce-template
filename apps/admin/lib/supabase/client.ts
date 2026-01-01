import { createBrowserClient } from "@supabase/ssr";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];
export function createClient() {
  return createBrowserClient(url, key);
}
