"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingRow } from "@/components/listings/ListingRow";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useFavourites } from "@/context/FavouritesContext";
import { useAuth } from "@/context/AuthContext";

export default function SavedListingsPage() {
  const { isAuthInitialized } = useAuth();
  const { favourites, toggleFavourite, loading: favsLoading } =
    useFavourites();
  const [ready, setReady] = useState(false);
  const { view, onChange } = useViewMode("ouse_view_saved");

  const loading = !isAuthInitialized || favsLoading;

  useEffect(() => {
    if (!loading && !ready) {
      setReady(true);
    }
  }, [loading, ready]);

  const savedListings = favourites.filter((fav) => fav.listings);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">
            Saved Listings
          </h1>
          {ready && (
            <p className="text-sm text-slate-500 dark:text-text-secondary mt-1">
              {savedListings.length}{" "}
              {savedListings.length === 1 ? "property" : "properties"} saved
            </p>
          )}
        </div>
        <ViewToggle view={view} onChange={onChange} />
      </div>

      {!ready ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : savedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-surface-elevated">
            <Heart className="h-8 w-8 text-slate-400 dark:text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-main">
            No saved listings yet
          </h2>
          <p className="mt-1 text-sm text-slate-400 dark:text-text-muted max-w-sm">
            Start exploring and save properties you love to come back to them
            later.
          </p>
          <Link
            href="/listings"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Explore properties
          </Link>
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
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
            >
              {savedListings.map((fav) => (
                <div key={fav.id}>
                  <ListingCard
                    listing={fav.listings!}
                    isFavourited={true}
                    onFavouriteToggle={toggleFavourite}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {savedListings.map((fav) => (
                <ListingRow
                  key={fav.id}
                  listing={fav.listings!}
                  isFavourited={true}
                  onFavouriteToggle={toggleFavourite}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
