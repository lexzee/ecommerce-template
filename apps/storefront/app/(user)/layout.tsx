import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountNav } from "./account_nav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Standard Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh]">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav (Client Component for Active States) */}
        <aside className="w-full md:w-64 flex-shrink-0 sticky lg:top-24">
          <div className="mb-6 px-4 md:px-0">
            <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
            <p className="text-sm text-muted-foreground">
              Manage your settings
            </p>
          </div>
          <AccountNav />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full bg-card rounded-lg shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
