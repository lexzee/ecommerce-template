"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertTitle } from "@workspace/ui/components/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { updatePassword } from "../actions";

const initialState = {
  success: false,
  message: "",
  error: null as string | null,
};

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* Feedback */}
      {state.success && (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{state.error}</AlertTitle>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••"
          required
          minLength={6}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••"
          required
          minLength={6}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
