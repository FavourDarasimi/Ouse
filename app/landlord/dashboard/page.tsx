import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2, MessageCircle, Plus } from "lucide-react";
import { DashboardStatsCard } from "@/components/shared/DashboardStatsCard";
import {
  AnimatedSection,
} from "@/components/shared/AnimatedSection";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/StaggerContainer";
import { ListingPreviewCard } from "@/components/listings/ListingPreviewCard";
import { ConversationListItem } from "@/components/chat/ConversationListItem";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function LandlordDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: listings, count: listingCount }, { count: activeCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("listings")
        .select("*", { count: "exact" })
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("landlord_id", user.id)
        .eq("available", true),
    ]);

  const listingIds = listings?.map((l) => l.id) ?? [];

  const { data: allConversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("landlord_id", user.id);

  const allConversationIds = allConversations?.map((c) => c.id) ?? [];

  const [{ count: unreadCount }, { count: favouritesCount }] =
    await Promise.all([
      allConversationIds.length > 0
        ? createAdminClient()
            .from("messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", allConversationIds)
            .eq("read", false)
            .neq("sender_id", user.id)
        : Promise.resolve({ count: 0, error: null }),
      listingIds.length > 0
        ? supabase
            .from("favourites")
            .select("id", { count: "exact", head: true })
            .in("listing_id", listingIds)
        : Promise.resolve({ count: 0, error: null }),
    ]);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, listing_id, tenant_id, created_at")
    .eq("landlord_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const conversationIds = conversations?.map((c) => c.id) ?? [];
  const tenantIds = conversations?.map((c) => c.tenant_id) ?? [];
  const listingIdsInConversations =
    conversations?.map((c) => c.listing_id) ?? [];

  const [profileResult, messagesResult, listingResult] = await Promise.all([
    tenantIds.length > 0
      ? createAdminClient()
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", tenantIds)
      : Promise.resolve({ data: null, error: null }),
    conversationIds.length > 0
      ? supabase
          .from("messages")
          .select("conversation_id, body, created_at, read, sender_id")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null, error: null }),
    listingIdsInConversations.length > 0
      ? supabase
          .from("listings")
          .select("id, title, images")
          .in("id", listingIdsInConversations)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const profileMap = new Map(profileResult?.data?.map((p) => [p.id, p]) ?? []);
  const listingMap = new Map(listingResult?.data?.map((l) => [l.id, l]) ?? []);

  let latestMessageMap = new Map<
    string,
    { body: string; created_at: string; read: boolean; sender_id: string }
  >();
  for (const msg of messagesResult?.data ?? []) {
    if (!latestMessageMap.has(msg.conversation_id)) {
      latestMessageMap.set(msg.conversation_id, msg);
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">
            {getGreeting()}
            {profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s what&apos;s happening with your properties
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 mb-8">
          <StaggerItem>
            <DashboardStatsCard
              variant="hero"
              label="Active Listings"
              value={activeCount ?? 0}
            />
          </StaggerItem>
          <StaggerItem>
            <DashboardStatsCard label="New Messages" value={unreadCount ?? 0} />
          </StaggerItem>
          <StaggerItem>
            <DashboardStatsCard label="Total Listings" value={listingCount ?? 0} />
          </StaggerItem>
          <StaggerItem>
            <DashboardStatsCard
              label="Saved by Tenants"
              value={favouritesCount ?? 0}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-8">
          <AnimatedSection className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-main">
                My Listings
              </h2>
              <Link
                href="/landlord/listings"
                className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            {!listings || listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-main">
                  No listings yet
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Post your first property to start receiving enquiries.
                </p>
                <Link
                  href="/landlord/listings/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <ListingPreviewCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection
            delay={0.15}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-main">
                Recent Messages
              </h2>
              <Link
                href="/landlord/messages"
                className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            {!conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <MessageCircle className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-main">
                  No messages yet
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Messages from interested tenants will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => {
                  const latestMsg = latestMessageMap.get(conv.id);
                  return (
                    <ConversationListItem
                      key={conv.id}
                      conversationId={conv.id}
                      tenantName={
                        profileMap.get(conv.tenant_id)?.full_name ?? null
                      }
                      listingTitle={
                        listingMap.get(conv.listing_id)?.title ?? "Property"
                      }
                      lastMessage={latestMsg?.body ?? null}
                      lastMessageTime={latestMsg?.created_at ?? null}
                      unread={
                        latestMsg
                          ? !latestMsg.read && latestMsg.sender_id !== user.id
                          : false
                      }
                    />
                  );
                })}
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
