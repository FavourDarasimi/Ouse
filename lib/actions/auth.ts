"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Signs the current user out server-side.
 * Can be called from Server Components or form actions.
 * For client-side sign-out, use the signOut() from AuthContext instead.
 */
export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
