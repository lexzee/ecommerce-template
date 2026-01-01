"use client";

import { signup } from "@/app/auth/actions";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Creating account..." : "Create an account"}
    </Button>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const res = await signup(formData);
    if (res?.error) {
      setError(res.error);
    }
  };

  return (
    <div className="grid gap-6 border p-8 rounded-xl shadow-sm">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Sign Up</h1>
        <p className="text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>

      <form action={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <SubmitButton />
      </form>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href={"/login"} className="underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
