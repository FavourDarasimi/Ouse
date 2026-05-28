import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChatShell } from "@/components/chat/ChatShell";
import type { ThreadItem, Message } from "@/types";

export default async function TenantConversationPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", chatId)
    .eq("tenant_id", user.id)
    .maybeSingle();

  if (!conversation) notFound();

  const [profileResult, listingResult, messagesResult] = await Promise.all([
    createAdminClient()
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", conversation.landlord_id)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id, title, price, location, images")
      .eq("id", conversation.listing_id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", chatId)
      .order("created_at", { ascending: true }),
  ]);

  const listing = listingResult.data;
  const otherParty = profileResult.data;
  const messages = (messagesResult.data as Message[]) ?? [];

  const { data: allConversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });

  const conversationIds = allConversations?.map((c) => c.id) ?? [];
  const landlordIds = allConversations?.map((c) => c.landlord_id) ?? [];
  const listingIds = allConversations?.map((c) => c.listing_id) ?? [];

  const [allProfilesResult, allListingsResult, allMessagesResult] =
    await Promise.all([
      createAdminClient()
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", landlordIds),
      supabase
        .from("listings")
        .select("id, title, price, location, images")
        .in("id", listingIds),
      supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false }),
    ]);

  const profileMap = new Map(
    allProfilesResult.data?.map((p) => [p.id, p]) ?? []
  );
  const listingMap = new Map(
    allListingsResult.data?.map((l) => [l.id, l]) ?? []
  );

  const latestMessageMap = new Map<
    string,
    { body: string; created_at: string }
  >();
  const unreadCountMap = new Map<string, number>();

  for (const msg of allMessagesResult.data ?? []) {
    if (!latestMessageMap.has(msg.conversation_id)) {
      latestMessageMap.set(msg.conversation_id, {
        body: msg.body,
        created_at: msg.created_at,
      });
    }
    if (msg.sender_id !== user.id && !msg.read) {
      unreadCountMap.set(
        msg.conversation_id,
        (unreadCountMap.get(msg.conversation_id) ?? 0) + 1
      );
    }
  }

  const threads: ThreadItem[] = (allConversations ?? [])
    .map((conv) => {
      const p = profileMap.get(conv.landlord_id);
      const l = listingMap.get(conv.listing_id);
      const latest = latestMessageMap.get(conv.id);
      return {
        id: conv.id,
        listingId: conv.listing_id,
        listingTitle: l?.title ?? "Property",
        listingPrice: l?.price ?? 0,
        listingLocation: l?.location ?? "",
        listingImage: l?.images?.[0] ?? null,
        otherUserId: conv.landlord_id,
        otherUserName: p?.full_name ?? null,
        otherUserAvatar: p?.avatar_url ?? null,
        lastMessage: latest?.body ?? null,
        lastMessageTime: latest?.created_at ?? null,
        unreadCount: unreadCountMap.get(conv.id) ?? 0,
      };
    })
    .filter((t) => t.lastMessage !== null);

  return (
    <div className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)] max-w-7xl mx-auto w-full flex">
      <ChatShell
        key={chatId}
        conversations={threads}
        activeConversationId={chatId}
        currentUserId={user.id}
        role="tenant"
        messages={messages}
        otherParty={
          otherParty
            ? {
                id: otherParty.id,
                full_name: otherParty.full_name,
                avatar_url: otherParty.avatar_url,
              }
            : null
        }
        listing={
          listing
            ? {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                location: listing.location,
                images: listing.images,
              }
            : null
        }
      />
    </div>
  );
}
