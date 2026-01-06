import { getJwt } from "@/lib/helper-server";
import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient();
  const jwt = await getJwt();

  try {
    const { error } = await supabase.auth.admin.signOut(jwt);
    if (error) {
      console.error("Supabase Error: ", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  } catch (e) {
    console.error("SignOut Error: ", e);
    return NextResponse.json(
      { error: "Internal Server Error: " + e },
      { status: 500 }
    );
  }
}
