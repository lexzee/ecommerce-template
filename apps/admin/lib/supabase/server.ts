import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

interface cookiesProps {
  name: string;
  value: string;
  options: CookieOptions;
}
function getSupabseCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // @ts-ignore
  const projectId = url.split("//")[1].split(".")[0];
  return `sb-${projectId}-auth-token`;
}

export async function createClient() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(getSupabseCookieName());
  const accessToken = tokenCookie && JSON.parse(tokenCookie.value).access_token;

  return createServerClient(url, key, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: cookiesProps[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: cookiesProps) => {
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          });
        } catch (e) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
