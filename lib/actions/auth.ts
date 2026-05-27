"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@/types";

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

/**
 * Completes onboarding by setting the user's role and marking them as onboarded.
 * Called from the onboarding page after role selection.
 */
export async function completeOnboarding(role: Role) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const full_name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.display_name ??
    null;

  console.log("[completeOnboarding] using full_name:", full_name);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
      full_name,
      onboarded: true,
    },
    { onConflict: "id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { data: { role } };
}
