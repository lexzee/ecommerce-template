import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/accounts/profile_form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //   Fetch current profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <ProfileForm
        initialData={{
          fullName: profile?.full_name || "",
          phone: profile?.phone || "",
          email: profile?.email || "unvailable",
          address: profile?.delivery_address,
        }}
      />
    </div>
  );
}
