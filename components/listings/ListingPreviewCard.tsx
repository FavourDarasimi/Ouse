"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Listing } from "@/types";

interface ListingPreviewCardProps {
  listing: Listing;
}

export function ListingPreviewCard({ listing }: ListingPreviewCardProps) {
  const { id, title, price, rent_type, location, images, available } = listing;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex  gap-3 rounded-2xl border border-slate-100 dark:border-border bg-surface p-3 transition-colors hover:border-primary/30"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
        {images?.[0] ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-surface-elevated">
            <Building2 className="text-slate-300 dark:text-text-muted" size={20} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 sm:gap-2">
          <h4 className="truncate text-sm font-semibold text-text-main">
            {title}
          </h4>
          <p className="text-sm font-bold text-text-main">
            {formatPrice(price, rent_type)}
          </p>
        </div>
        <p className="truncate text-xs text-slate-400 dark:text-text-muted">{location}</p>
      </div>

      <div className="flex shrink-0 items-start gap-1.5">
        <Link
          href={`/listings/${id}`}
          className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-white dark:bg-surface-elevated dark:text-card-badge-text dark:hover:bg-surface-overlay transition-colors hover:bg-zinc-700"
        >
          View
        </Link>
      </div>
    </motion.div>
  );
}
