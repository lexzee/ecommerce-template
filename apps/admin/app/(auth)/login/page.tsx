import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { login, signup } from "../action";

function SubmitButton() {
  return (
    <>
      <Button formAction={login} className="w-full">
        Sign In
      </Button>
      <Button formAction={signup} variant="outline" className="w-full">
        Create Admin Account
      </Button>
    </>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;
  console.log(message);

  {
    message && (
      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
        {message}
      </div>
    );
  }

  return (
    <div className="flex w-full h-[93vh] items-center justify-center">
      <div className="grid gap-6 border p-8 rounded-xl shadow-sm">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Admin Access</h1>
          <p className="text-muted-foreground">
            Enter your credentials to manage the store.
          </p>
        </div>

        <form className="grid gap-4">
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

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
