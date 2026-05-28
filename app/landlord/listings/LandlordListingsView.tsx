"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { ListingRow } from "@/components/listings/ListingRow";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { useAddListing } from "@/context/AddListingContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/StaggerContainer";
import type { Listing } from "@/types";

export function LandlordListingsView({ listings }: { listings: Listing[] }) {
  const { view, onChange } = useViewMode("ouse_view_my_properties");
  const { openForEdit } = useAddListing();
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">My Properties</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-text-muted">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openForEdit(listing);
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-border flex items-center justify-center text-slate-400 dark:text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
                      aria-label="Edit listing"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setConfirmDeleteId(listing.id);
                      }}
                      disabled={deletingId === listing.id}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-border flex items-center justify-center text-slate-400 dark:text-text-muted hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
                      aria-label="Delete listing"
                    >
                      {deletingId === listing.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </>
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        loading={deletingId !== null}
      />
    </>
  );
}
