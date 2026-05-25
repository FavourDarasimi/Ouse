"use client";

import { Search, RotateCcw } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { ListingsFilter } from "./ListingsFilter";
import { useFavourites } from "@/context/FavouritesContext";
import { useAuth } from "@/context/AuthContext";
import type { Listing } from "@/types";

interface ExploreListingsProps {
  listings: Listing[];
}

export function ExploreListings({ listings }: ExploreListingsProps) {
  const { user } = useAuth();
  const { isFavourited, toggleFavourite } = useFavourites();

  return (
    <ListingsFilter listings={listings}>
      {({ filtered, hasActiveFilters, clearAll }) => (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-text-main">
                No properties match your filters
              </h2>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Try adjusting or clearing your filters to see more results.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:text-blue-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((listing) => (
                <div key={listing.id}>
                  <ListingCard
                    listing={listing}
                    isFavourited={user ? isFavourited(listing.id) : false}
                    onFavouriteToggle={user ? toggleFavourite : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ListingsFilter>
  );
}
