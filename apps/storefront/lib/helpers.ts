import { cookies } from "next/headers";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "delivered":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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
