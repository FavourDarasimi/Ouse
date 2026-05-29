import { createServerClient } from "@/lib/supabase/server";
import { ExploreListings } from "@/components/listings/ExploreListings";

export default async function PublicListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const supabase = await createServerClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(full_name, avatar_url, kyc_status)")
    .order("created_at", { ascending: false });

  const { location } = await searchParams;

  const initialSearch = location ?? "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ExploreListings
          key={initialSearch || "default"}
          listings={listings ?? []}
          initialSearch={initialSearch}
        />
      </div>
    </div>
  );
}
