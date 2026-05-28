import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChatShell } from "@/components/chat/ChatShell";
import type { ThreadItem } from "@/types";

export default async function TenantMessagesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });

  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)] max-w-7xl mx-auto w-full flex">
        <ChatShell conversations={[]} currentUserId={user.id} role="tenant" />
      </div>
    );
  }

  const conversationIds = conversations.map((c) => c.id);
  const landlordIds = conversations.map((c) => c.landlord_id);
  const listingIds = conversations.map((c) => c.listing_id);

  const [profileResult, listingResult, messagesResult] = await Promise.all([
    createAdminClient()
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", landlordIds),
    createAdminClient()
      .from("listings")
      .select("id, title, price, location, images")
      .in("id", listingIds),
    supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map(profileResult.data?.map((p) => [p.id, p]) ?? []);
  const listingMap = new Map(listingResult.data?.map((l) => [l.id, l]) ?? []);

  const latestMessageMap = new Map<
    string,
    { body: string; created_at: string }
  >();
  const unreadCountMap = new Map<string, number>();

  for (const msg of messagesResult.data ?? []) {
    if (!latestMessageMap.has(msg.conversation_id)) {
      latestMessageMap.set(msg.conversation_id, {
        body: msg.body,
        created_at: msg.created_at,
      });
    }
    if (msg.sender_id !== user.id && !msg.read) {
      unreadCountMap.set(
        msg.conversation_id,
        (unreadCountMap.get(msg.conversation_id) ?? 0) + 1,
      );
    }
  }

  const threads: ThreadItem[] = conversations
    .map((conv) => {
      const profile = profileMap.get(conv.landlord_id);
      const listing = listingMap.get(conv.listing_id);
      const latest = latestMessageMap.get(conv.id);
      return {
        id: conv.id,
        listingId: conv.listing_id,
        listingTitle: listing?.title ?? "Property",
        listingPrice: listing?.price ?? 0,
        listingLocation: listing?.location ?? "",
        listingImage: listing?.images?.[0] ?? null,
        otherUserId: conv.landlord_id,
        otherUserName: profile?.full_name ?? null,
        otherUserAvatar: profile?.avatar_url ?? null,
        lastMessage: latest?.body ?? null,
        lastMessageTime: latest?.created_at ?? null,
        unreadCount: unreadCountMap.get(conv.id) ?? 0,
      };
    })
    .filter((t) => t.lastMessage !== null);

  return (
    <div className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)] max-w-7xl mx-auto w-full flex">
      <ChatShell
        conversations={threads}
        currentUserId={user.id}
        role="tenant"
      />
    </div>
  );
}
