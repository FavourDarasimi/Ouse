"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Trash2, Power, ExternalLink, Loader2 } from "lucide-react";
import { useAddListing } from "@/context/AddListingContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { formatPrice } from "@/lib/utils/formatPrice";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import type { Listing } from "@/types";

interface PropertyCardProps {
  listing: Listing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const router = useRouter();
  const { openForEdit } = useAddListing();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    const res = await fetch("/api/listings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: listing.id,
        available: !listing.available,
      }),
    });
    if (res.ok) router.refresh();
    setToggling(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setDeleting(false);
    setShowConfirm(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-surface rounded-2xl border border-slate-100 dark:border-border p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
    >
      <div className="w-full sm:w-40 h-40 sm:h-[130px] rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-surface-elevated">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-text-muted text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-text-main truncate">
              {listing.title}
            </h3>
            <p className="text-sm text-slate-400 dark:text-text-muted mt-0.5 truncate">
              {listing.location}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              listing.available
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 dark:bg-surface-elevated text-slate-500 dark:text-text-secondary"
            }`}
          >
            {listing.available ? "Available" : "Rented"}
          </span>
        </div>

        <p className="truncate text-sm font-semibold text-text-main mt-2">
          {formatPrice(listing.price, listing.rent_type)}
        </p>

        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-text-muted flex-nowrap overflow-hidden">
          {listing.bedrooms && <span className="whitespace-nowrap">{listing.bedrooms} Beds</span>}
          {listing.bathrooms && <span className="whitespace-nowrap">{listing.bathrooms} Baths</span>}
          <span className="whitespace-nowrap capitalize">{listing.type}</span>
          {listing.area && <span className="whitespace-nowrap">{listing.area}</span>}
        </div>

        <p className="truncate text-xs text-slate-400 dark:text-text-muted mt-1">
          Created {formatRelativeTime(listing.created_at)}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
          <button
            onClick={() => openForEdit(listing)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-surface-elevated transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              listing.available
                ? "border-slate-200 dark:border-border text-slate-600 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-surface-elevated"
                : "border-green-200 text-green-700 hover:bg-green-50 dark:border-border dark:text-primary-text dark:hover:bg-primary-subtle"
            }`}
          >
            {toggling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
            {listing.available ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:text-accent dark:hover:bg-accent-subtle transition disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>

          <a
            href={`/listings/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:text-emerald-800 transition"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Delete listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </motion.div>
  );
}
