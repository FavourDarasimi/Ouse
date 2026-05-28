"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Home, Heart } from "lucide-react";
import type { Listing } from "@/types";

interface ListingRowProps {
  listing: Listing;
  isFavourited?: boolean;
  onFavouriteToggle?: (id: string) => void;
  actions?: React.ReactNode;
}

export function ListingRow({
  listing,
  isFavourited = false,
  onFavouriteToggle,
  actions,
}: ListingRowProps) {
  const {
    id,
    title,
    location,
    price,
    images,
    bedrooms,
    bathrooms,
    available,
  } = listing;

  return (
    <Link href={`/listings/${id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.15 }}
        className="bg-white border border-slate-100 rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-4 hover:border-primary/30 transition-colors duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
          {images?.[0] ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="bg-slate-100 w-full h-full flex items-center justify-center">
              <Home className="text-slate-300" size={28} />
            </div>
          )}
        </div>

        {/* Middle section */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-text-main line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="text-[11px] sm:text-xs text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
              <BedDouble size={10} />
              {bedrooms ?? "—"}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
              <Bath size={10} />
              {bathrooms ?? "—"}
            </span>
            {listing.type && (
              <span className="hidden sm:inline-flex text-[11px] sm:text-xs text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full items-center gap-0.5 sm:gap-1 capitalize">
                <Home size={10} />
                {listing.type}
              </span>
            )}
            <span
              className={`text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                available
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {available ? "Available" : "Rented"}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end justify-between h-full gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
              ₦{price.toLocaleString()}
            </span>
            <div className="text-[11px] sm:text-xs text-slate-400 font-normal">/mo</div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onFavouriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onFavouriteToggle(id);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center ${
                  isFavourited ? "text-accent" : "text-slate-400"
                }`}
                aria-label={
                  isFavourited
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
              >
                <Heart
                  size={12}
                  fill={isFavourited ? "#dc2626" : "none"}
                />
              </button>
            )}
            <span className="bg-secondary text-white text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium whitespace-nowrap">
              View
            </span>
            {actions}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
