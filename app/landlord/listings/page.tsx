import { createServerClient } from "@/lib/supabase/server";
import { Building2 } from "lucide-react";
import { DashboardStatsCard } from "@/components/shared/DashboardStatsCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/StaggerContainer";
import { PropertyCard } from "@/components/listings/PropertyCard";

export default async function LandlordListingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("landlord_id", user.id)
    .order("created_at", { ascending: false });

  const total = listings?.length ?? 0;
  const active = listings?.filter((l) => l.available).length ?? 0;
  const inactive = total - active;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-main">My Properties</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage your rental listings
            </p>
          </div>
        </div>

        <StaggerContainer className="grid grid-cols-3 gap-2 sm:gap-6 mb-8">
          <StaggerItem>
            <DashboardStatsCard label="Total" value={total} />
          </StaggerItem>
          <StaggerItem>
            <DashboardStatsCard label="Active" value={active} variant="hero" />
          </StaggerItem>
          <StaggerItem>
            <DashboardStatsCard label="Inactive" value={inactive} />
          </StaggerItem>
        </StaggerContainer>

        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-text-main">
              No properties yet
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">
              Post your first property to start receiving enquiries from
              tenants.
            </p>
          </div>
        ) : (
          <StaggerContainer className="space-y-4">
            {listings!.map((listing) => (
              <StaggerItem key={listing.id}>
                <PropertyCard listing={listing} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
