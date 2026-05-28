"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { ListingRow } from "./ListingRow";
import { ListingsFilter } from "./ListingsFilter";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useFavourites } from "@/context/FavouritesContext";
import { useAuth } from "@/context/AuthContext";
import type { Listing } from "@/types";

const ITEMS_PER_PAGE = 12;

interface ExploreListingsProps {
  listings: Listing[];
  initialSearch?: string;
}

function PaginatedGrid({
  items,
  isFavourited,
  toggleFavourite,
  hasUser,
}: {
  items: Listing[];
  isFavourited: (id: string) => boolean;
  toggleFavourite: (id: string) => Promise<void>;
  hasUser: boolean;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = items.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-5">
        {pageItems.map((listing) => (
          <div key={listing.id}>
            <ListingCard
              listing={listing}
              isFavourited={hasUser ? isFavourited(listing.id) : false}
              onFavouriteToggle={hasUser ? toggleFavourite : undefined}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-border bg-surface text-text-main hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                  p === safePage
                    ? "bg-primary text-white"
                    : "text-slate-500 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-elevated hover:text-text-main"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-border bg-surface text-text-main hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

export function ExploreListings({ listings, initialSearch }: ExploreListingsProps) {
  const availableListings = listings.filter((l) => l.available);
  const { user, isAuthInitialized } = useAuth();
  const {
    isFavourited,
    toggleFavourite,
    loading: favsLoading,
  } = useFavourites();
  const [ready, setReady] = useState(false);
  const { view, onChange: onViewChange } = useViewMode("ouse_view_listings");

  const loading = !isAuthInitialized || (!!user && favsLoading);

  useEffect(() => {
    if (!loading && !ready) {
      setReady(true);
    }
  }, [loading, ready]);

  return (
    <ListingsFilter
      listings={availableListings}
      initialSearch={initialSearch ?? ""}
      viewToggle={<ViewToggle view={view} onChange={onViewChange} />}
    >
      {({ filtered, hasActiveFilters, clearAll }) => (
        <>
          {!ready ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-surface-elevated">
                <Search className="h-8 w-8 text-slate-400 dark:text-text-muted" />
              </div>
              <h2 className="text-lg font-semibold text-text-main">
                No properties match your filters
              </h2>
              <p className="mt-1 text-sm text-slate-400 dark:text-text-muted max-w-sm">
                Try adjusting or clearing your filters to see more results.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:text-emerald-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <PaginatedGrid
                    items={filtered}
                    isFavourited={isFavourited}
                    toggleFavourite={toggleFavourite}
                    hasUser={!!user}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 mt-4"
                >
                  {filtered.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      isFavourited={!!user ? isFavourited(listing.id) : false}
                      onFavouriteToggle={!!user ? toggleFavourite : undefined}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </ListingsFilter>
  );
}
