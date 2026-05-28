"use client";

import { Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { ListingRow } from "@/components/listings/ListingRow";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useViewMode } from "@/lib/hooks/useViewMode";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/StaggerContainer";
import type { Listing } from "@/types";

export function LandlordListingsView({ listings }: { listings: Listing[] }) {
  const { view, onChange } = useViewMode("ouse_view_my_properties");

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">My Properties</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your rental listings
          </p>
        </div>
        <ViewToggle view={view} onChange={onChange} />
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <StaggerContainer className="space-y-4">
              {listings.map((listing) => (
                <StaggerItem key={listing.id}>
                  <PropertyCard listing={listing} />
                </StaggerItem>
              ))}
            </StaggerContainer>
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
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                actions={
                  <>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 transition-colors"
                      aria-label="Edit listing"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors"
                      aria-label="Delete listing"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
