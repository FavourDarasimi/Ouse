import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Handles the OAuth callback from Supabase after Google sign-in.
 * Exchanges the code for a session, then redirects by role.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? null;

  if (code) {
    const supabase = await createServerClient();
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const role = data.user.user_metadata?.role;
      const destination =
        next ??
        (role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
