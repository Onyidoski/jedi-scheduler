import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    // Exchange the temporary code for a permanent session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the final destination (e.g., /auth/update-password)
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}