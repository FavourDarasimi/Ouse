"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function findOrCreateConversation(
  listingId: string,
  landlordId: string
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("tenant_id", user.id)
    .eq("landlord_id", landlordId)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      tenant_id: user.id,
      landlord_id: landlordId,
    })
    .select("id")
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/", "layout");
  return { data, error: null };
}
