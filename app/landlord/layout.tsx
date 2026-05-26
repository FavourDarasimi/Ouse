import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  MobileBottomNav,
  landlordLinks,
} from "@/components/layout/MobileBottomNav";
import { AddListingProvider } from "@/context/AddListingContext";
import { AddListingPanel } from "@/components/listings/AddListingPanel";
import { AddListingFAB } from "@/components/listings/AddListingFAB";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.role !== "landlord") {
    redirect("/tenant/dashboard");
  }

  let unreadCount = 0;
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("landlord_id", user.id);

  if (conversations && conversations.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversations.map((c) => c.id))
      .eq("read", false)
      .neq("sender_id", user.id);
    unreadCount = count ?? 0;
  }

  return (
    <AddListingProvider>
      <Sidebar profile={profile} unreadCount={unreadCount} />
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-background lg:ml-64 pb-16 lg:pb-0">
        {children}
      </main>
      <MobileBottomNav links={landlordLinks} unreadCount={unreadCount} />
      <AddListingFAB />
      <AddListingPanel />
    </AddListingProvider>
  );
}
