"use client";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { signout } from "../(auth)/action";

export default function UnauthorizedPage() {
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    async function LogOut() {
      await signout();
    }

    if (logout) {
      LogOut();
    }
  }, [logout]);
  return (
    <div className="fixed top-0 left-0 h-screen w-full flex flex-col items-center justify-center bg-background gap-4 p-4">
      <div className="bg-accent p-8 rounded-lg shadow-sm border text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="mb-6">
          You do not have permission to view this dashboard. This area is
          restricted to administrators only.
        </p>
        <div className="flex gap-4 justify-center">
          {/* <form action="/auth/signout" method="post"> */}
          <Button variant="destructive" onClick={() => setLogout(true)}>
            Sign Out
          </Button>
          {/* </form> */}
          {/* Link back to the main storefront if you have the URL, or just Login */}
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
