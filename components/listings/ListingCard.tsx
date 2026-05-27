"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { MapPin, BedDouble, Bath, Heart, Building2 } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  isFavourited?: boolean;
  onFavouriteToggle?: (id: string) => void;
}

export function ListingCard({
  listing,
  isFavourited = false,
  onFavouriteToggle,
}: ListingCardProps) {
  const { id, title, location, price, images, bedrooms, bathrooms } = listing;

  return (
    <Link href={`/listings/${id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="bg-surface rounded-2xl border border-slate-200 p-2 sm:p-2 cursor-pointer"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="relative aspect-[4/5] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden"
        >
          {images?.[0] ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover w-full"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-slate-100 rounded-xl sm:rounded-2xl aspect-[4/5] sm:aspect-[4/3] flex items-center justify-center w-full h-full">
              <Building2 className="text-slate-300" size={40} />
            </div>
          )}
        </motion.div>

        <div className="px-0.5 sm:px-1 pt-2 sm:pt-3 pb-0.5 sm:pb-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-1 mb-1">
            <h3 className="text-sm font-bold text-text-main truncate leading-tight">
              {title}
            </h3>
            <span className="text-sm font-bold text-text-main dark:text-primary-text whitespace-nowrap flex-shrink-0">
              ₦{price.toLocaleString()}
              <span className="text-xs text-slate-400 dark:text-card-meta font-normal ml-0.5">
                /mo
              </span>
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-text-secondary flex items-center gap-1 truncate mb-2">
            <MapPin size={13} className="shrink-0" />
            {location}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-1 mb-2">
            <span className="bg-slate-50 dark:bg-surface-elevated rounded-full px-2 py-1 text-xs text-slate-700 dark:text-card-badge-text flex items-center gap-1">
              <BedDouble size={11} className="shrink-0" />
              {bedrooms ?? "—"} Beds
            </span>
            <span className="bg-slate-50 dark:bg-surface-elevated rounded-full px-2 py-1 text-xs text-slate-700 dark:text-card-badge-text flex items-center gap-1">
              <Bath size={11} className="shrink-0" />
              {bathrooms ?? "—"} Baths
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="flex-1 bg-primary text-white rounded-full py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap text-center">
              <span className="hidden sm:inline">View Property</span>
              <span className="sm:hidden">View</span>
            </span>
            {onFavouriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onFavouriteToggle(id);
                }}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-surface flex items-center justify-center flex-shrink-0 transition-colors ${
                  isFavourited ? "text-accent" : "text-slate-400"
                }`}
                aria-label={
                  isFavourited ? "Remove from favourites" : "Add to favourites"
                }
              >
                <Heart
                  size={15}
                  className="sm:w-[18px] sm:h-[18px]"
                  fill={isFavourited ? "#dc2626" : "none"}
                />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
