"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Message } from "@/types";

export async function sendMessage(conversationId: string, body: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/", "layout");

  return { data, error: null };
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("read", false);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");

  return { error: null };
}

export async function getMessages(conversationId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as Message[], error: null };
}
