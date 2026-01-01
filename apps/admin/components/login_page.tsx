"use server";

import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { login, signup } from "@/app/(auth)/action";

export default async function LoginPageRender({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const handleLogin = async (formData: FormData) => {
    await login(formData);
  };
  const params = await searchParams;
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-md">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Admin Access</h1>
          <p className="text-gray-500">
            Enter your credentials to manage the store.
          </p>
        </div>

        {params.message && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
            {params.message}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button formAction={handleLogin} className="w-full">
              Sign In
            </Button>
            {/* Optional: Remove this after you create your account */}
            <Button formAction={signup} variant="outline" className="w-full">
              Create Admin Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
