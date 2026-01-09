import { ProfileForm } from "@/components/accounts/profile_form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch current profile data with strictly typed select if possible,
  // otherwise rely on the component interface
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Personal Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your contact details and default delivery address.
        </p>
      </div>

      <div className="max-w-xl">
        <ProfileForm
          initialData={{
            fullName: profile?.full_name || "",
            phone: profile?.phone || "",
            // Fallback to auth email if profile email is missing (should be same)
            email: profile?.email || user.email || "",
            address: profile?.delivery_address, // JSONB passed directly
          }}
        />
      </div>
    </div>
  );
}
