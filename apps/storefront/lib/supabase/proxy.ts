import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

interface cookiesProps {
  name: string;
  value: string;
  options: CookieOptions;
}

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

// @ts-ignore
const projectId = url.split("//")[1].split(".")[0];
const cookieName = `sb-${projectId}-auth-token`;

export async function updateSession(request: NextRequest) {
  console.log("Starting Supabase Proxy");
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!url || !key) {
    console.error("❌ FATAL ERROR: Supabase Keys are MISSING!");
    return supabaseResponse; // Stop here to prevent crash
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  let user = null;

  console.log("Creating server client...");

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        console.log("Getting cookies...");

        return request.cookies.getAll();
      },
      setAll(cookiesToSet: cookiesProps[]) {
        console.log("Setting Cookies", cookiesToSet.length);

        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          // supabaseResponse.cookies.set(name, value, options)
          supabaseResponse.cookies.set(name, value, {
            ...options,
            secure: false,
            sameSite: "lax",
            // path: "/",
          })
        );
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  // const { data } = await supabase.auth.getClaims();
  // const user = data?.claims;

  console.log("Refreshing session...");

  const tokenCookie = request.cookies.get(cookieName);

  if (tokenCookie) {
    console.log("Found raw cookie manually:", cookieName);
    try {
      const session = JSON.parse(tokenCookie.value);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

      if (sessionError) {
        console.error("Manual session set failed:", sessionError.message);
      } else {
        console.log("✅ Manual session set successfully");
        user = sessionData.user;
      }
    } catch (e) {
      console.error("Manual parse failed:", e);
    }
  }

  try {
    if (!user) {
      console.log("⚠️ No auth cookie found manually: Trying automatic!");
      const { data: getUserData, error } = await supabase.auth.getUser();
      user = getUserData.user;

      if (error) {
        console.error("⚠️ Auth Error:", error.message);
      } else {
        console.log("✅ User found:", user);
      }
    }

    if (!user) {
      if (
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/auth") &&
        !request.nextUrl.pathname.startsWith("/register")
      ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("❌ CRITICAL CRASH in getUser:", error);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export async function getUserManually() {
  const cookieStore = await cookies();

  // 2. Read Cookie
  const tokenCookie = cookieStore.get(cookieName);

  if (!tokenCookie) return null;

  try {
    // 3. Parse JSON
    const session = JSON.parse(tokenCookie.value);
    return session.user; // Return the user directly
  } catch {
    return null;
  }
}
