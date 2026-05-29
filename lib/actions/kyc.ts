"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyIdentity(
  method: "nin" | "bvn",
  number: string,
  dateOfBirth: string,
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // 1. Set status to pending
  await supabase
    .from("profiles")
    .update({ kyc_status: "pending", kyc_method: method })
    .eq("id", user.id);

  // 2. Call Dojah API
  try {
    const endpoint = method === "nin" ? "/api/v1/kyc/nin" : "/api/v1/kyc/bvn";
    const queryParam = method === "nin" ? "nin" : "bvn";

    const response = await fetch(
      `https://sandbox.dojah.io${endpoint}?${queryParam}=${encodeURIComponent(number)}&date_of_birth=${encodeURIComponent(dateOfBirth)}`,
      {
        method: "GET",
        headers: {
          AppId: process.env.DOJAH_APP_ID!,
          Authorization: process.env.DOJAH_BEARER_TOKEN!,
        },
      },
    );

    const result = await response.json();

    // 3. Log the attempt
    await supabase.from("kyc_attempts").insert({
      user_id: user.id,
      method,
      status: result.entity ? "success" : "failed",
      provider: "dojah",
      reference: result.entity?.reference_id ?? null,
      failure_reason: result.error ?? null,
    });

    // 4. Update profile based on result
    if (result.entity) {
      await supabase
        .from("profiles")
        .update({
          kyc_status: "verified",
          kyc_verified_at: new Date().toISOString(),
          kyc_reference: result.entity.reference_id,
        })
        .eq("id", user.id);

      revalidatePath("/", "layout");
      return { success: true };
    }

    await supabase
      .from("profiles")
      .update({ kyc_status: "failed" })
      .eq("id", user.id);

    return {
      error: result.error ?? "Verification failed. Please check your details.",
    };
  } catch {
    await supabase
      .from("profiles")
      .update({ kyc_status: "failed" })
      .eq("id", user.id);

    return { error: "Something went wrong. Please try again." };
  }
}
