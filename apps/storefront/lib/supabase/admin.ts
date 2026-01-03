import { createAdminClient } from "@repo/database";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
];
export function createClient() {
  return createAdminClient(url, key);
}
