"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Trash2, Power, ExternalLink, Loader2 } from "lucide-react";
import { useAddListing } from "@/context/AddListingContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import type { Listing } from "@/types";

interface PropertyCardProps {
  listing: Listing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const router = useRouter();
  const { openForEdit } = useAddListing();
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
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setDeleting(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
    >
      <div className="w-full sm:w-40 h-40 sm:h-[130px] rounded-xl overflow-hidden shrink-0 bg-slate-100">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
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
            <p className="text-sm text-slate-400 mt-0.5 truncate">
              {listing.location}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              listing.available
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {listing.available ? "Available" : "Rented"}
          </span>
        </div>

        <p className="text-sm font-semibold text-text-main mt-2">
          {formatPrice(listing.price, listing.rent_type)}
        </p>

        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          {listing.bedrooms && <span>{listing.bedrooms} Beds</span>}
          {listing.bathrooms && <span>{listing.bathrooms} Baths</span>}
          <span className="capitalize">{listing.type}</span>
          {listing.area && <span>{listing.area}</span>}
        </div>

        <p className="text-xs text-slate-400 mt-1">
          Created {formatRelativeTime(listing.created_at)}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
          <button
            onClick={() => openForEdit(listing)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              listing.available
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-green-200 text-green-700 hover:bg-green-50"
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
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition disabled:opacity-50"
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
            className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:text-blue-700 transition"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
