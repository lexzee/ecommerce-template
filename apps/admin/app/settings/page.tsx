"use server";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ProfileForm } from "./profile_form";
import { PasswordForm } from "./password_form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return (
      <div className="w-full h-[90vh] flex items-center justify-center">
        <Link href={"/login"}>
          <Button variant={"outline"}>Go To Login</Button>
        </Link>
      </div>
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 p-2 sm:p-10 pb-16 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and profile preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details used in the store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} profile={profile} />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Security (Password) */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay
              secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
