import { cookies } from "next/headers";

export function getSupabseCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // @ts-ignore
  const projectId = url.split("//")[1].split(".")[0];
  return `sb-${projectId}-auth-token`;
}

export const getJwt = async () => {
  const cookieName = getSupabseCookieName();

  const cookieStore = await cookies();

  const Cookie = cookieStore.get(cookieName);
  if (Cookie) {
    return JSON.parse(Cookie.value).access_token;
  }

  return "No cookie found";
};
