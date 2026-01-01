"use client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { FormState, updateProfile } from "./actions";
import { useActionState } from "react";

interface ProfileFormProps {
  user: { id: string; email?: string };
  profile: { full_name: string | null; phone: string | null };
}

const initialState: FormState = {
  success: false,
  message: "",
  error: null as string | null,
};

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />

      {/* Success/Error Feedback */}
      {state.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          {state.message}
        </div>
      )}
      {state.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {state.error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name || ""}
          placeholder="Store Admin"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          defaultValue={user.email}
          disabled
          className="bg-gray-100 text-gray-500 cursor-not-allowed"
        />
        <p className="text-[10px] text-muted-foreground">
          Email cannot be changed here
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={profile?.phone || ""}
          placeholder="+234..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
