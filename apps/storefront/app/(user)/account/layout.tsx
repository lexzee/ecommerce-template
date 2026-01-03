import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { User, MapPin, Package, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getUserManually } from "@/lib/supabase/proxy";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserManually();
  if (!user) redirect("/login");

  const navItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/orders", label: "Orders", icon: Package }, // Redirects to your existing orders page
    // { href: "/account/addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}

          <form action="/auth/signout" method="post">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-6 border rounded-lg shadow-sm">{children}</div>
      </div>
    </div>
  );
}
