import { createServerClient } from "@/lib/supabase/server";
import { TenantDashboardClient } from "./TenantDashboardClient";

interface FeaturedListing {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  landlordName: string | null;
  landlordAvatar: string | null;
}

function seededShuffle<T>(items: T[]): T[] {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const result = [...items];
  let s = Math.abs(hash);
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function TenantDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: allListings },
    { data: favourites },
    { data: conversations },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("favourites")
      .select("listing_id")
      .eq("tenant_id", user.id),
    supabase
      .from("conversations")
      .select("id, landlord_id")
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  // Build landlord profile map
  const landlordIds = [
    ...new Set((allListings ?? []).map((l) => l.landlord_id)),
  ];
  const { data: landlordProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", landlordIds);
  const landlordMap = new Map(
    (landlordProfiles ?? []).map((p) => [p.id, p]),
  );

  // Daily-seeded shuffle, pick first 6 with explicit landlord data
  const shuffled = seededShuffle(allListings ?? []);
  const featuredListings: FeaturedListing[] = shuffled.slice(0, 6).map((l) => {
    const landlord = landlordMap.get(l.landlord_id);
    return {
      id: l.id,
      title: l.title,
      location: l.location,
      price: l.price,
      image: l.images?.[0] ?? null,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      landlordName: landlord?.full_name ?? null,
      landlordAvatar: landlord?.avatar_url ?? null,
    };
  });

  // Fetch saved listing details for the sidebar
  let savedListings: Array<{ id: string; title: string; price: number }> = [];
  if (favourites && favourites.length > 0) {
    const faveIds = favourites.map((f) => f.listing_id);
    const { data: listingDetails } = await supabase
      .from("listings")
      .select("id, title, price")
      .in("id", faveIds);
    savedListings = listingDetails ?? [];
  }

  // Fetch landlord profiles + last message + unread count for each conversation
  interface ChatDetail {
    id: string;
    otherUserId: string;
    otherUserName: string | null;
    otherUserAvatar: string | null;
    lastMessage: string | null;
    unreadCount: number;
  }

  let chatDetails: ChatDetail[] = [];
  if (conversations && conversations.length > 0) {
    const convLandlordIds = conversations.map((c) => c.landlord_id);
    const convIds = conversations.map((c) => c.id);

    const [profileResult, messagesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", convLandlordIds),
      supabase
        .from("messages")
        .select("conversation_id, body, sender_id, read")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false }),
    ]);

    const profileMap = new Map(
      profileResult.data?.map((p) => [p.id, p]) ?? [],
    );

    const lastMsgMap = new Map<string, { body: string; unread: number }>();
    for (const msg of messagesResult.data ?? []) {
      if (!lastMsgMap.has(msg.conversation_id)) {
        lastMsgMap.set(msg.conversation_id, {
          body: msg.body,
          unread: 0,
        });
      }
      if (!msg.read && msg.sender_id !== user.id) {
        const entry = lastMsgMap.get(msg.conversation_id)!;
        entry.unread++;
      }
    }

    chatDetails = conversations.map((conv) => {
      const landlordProfile = profileMap.get(conv.landlord_id);
      const msgInfo = lastMsgMap.get(conv.id);
      return {
        id: conv.id,
        otherUserId: conv.landlord_id,
        otherUserName: landlordProfile?.full_name ?? null,
        otherUserAvatar: landlordProfile?.avatar_url ?? null,
        lastMessage: msgInfo?.body ?? null,
        unreadCount: msgInfo?.unread ?? 0,
      };
    });
  }

  return (
    <TenantDashboardClient
      userName={profile?.full_name ?? null}
      userAvatar={profile?.avatar_url ?? null}
      featuredListings={featuredListings}
      savedListings={savedListings}
      chatDetails={chatDetails}
    />
  );
}
