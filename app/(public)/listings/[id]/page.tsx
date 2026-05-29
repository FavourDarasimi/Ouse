import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListingDetail } from "./ListingDetail";
import { ListingSidebarLayout } from "./ListingSidebarLayout";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(full_name, avatar_url, kyc_status)")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  let landlordProfile = null;
  if (listing.profiles) {
    landlordProfile = {
      id: listing.landlord_id,
      full_name: listing.profiles.full_name,
      avatar_url: listing.profiles.avatar_url,
      kyc_status: listing.profiles.kyc_status,
    };
  } else {
    const { data: profile } = await createAdminClient()
      .from("profiles")
      .select("id, full_name, avatar_url, kyc_status")
      .eq("id", listing.landlord_id)
      .maybeSingle();
    landlordProfile = profile;
  }

  return (
    <ListingSidebarLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ListingDetail listing={listing} landlordProfile={landlordProfile} />
        </div>
      </div>
    </ListingSidebarLayout>
  );
}
