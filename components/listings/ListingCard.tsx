"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Listing } from "@/types";
import { MapPin, BedDouble, Bath, Heart } from "lucide-react";

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
  const {
    id,
    title,
    location,
    price,
    images,
    bedrooms,
    bathrooms,
    area,
    type,
    available,
    rent_type,
  } = listing;

  return (
    <Link href={`/listings/${id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="bg-white rounded-3xl border border-slate-200 p-2 cursor-pointer"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden"
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
            <div className="bg-slate-100 rounded-2xl aspect-[4/3] flex items-center justify-center w-full h-full">
              <i
                className="ti ti-building text-slate-300"
                style={{ fontSize: 40 }}
              />
            </div>
          )}
        </motion.div>

        <div className="px-1 pt-3 pb-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-text-main line-clamp-1">
              {title}
            </h3>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-text-main whitespace-nowrap">
                {formatPrice(price, rent_type)}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 flex items-center gap-1">
            <MapPin size={13} />
            {location}
          </p>

          <div className="flex items-center gap-2 py-2">
            <span className="bg-slate-50 rounded-full px-3 py-1.5 text-xs text-slate-700 flex items-center gap-1.5">
              <BedDouble size={13} />
              {bedrooms ?? "—"} Bedrooms
            </span>
            <span className="bg-slate-50 rounded-full px-3 py-1.5 text-xs text-slate-700 flex items-center gap-1.5">
              <Bath size={13} />
              {bathrooms ?? "—"} Bathrooms
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="flex-1 bg-primary text-white rounded-full py-3 text-sm font-medium text-center">
              View Property
            </span>
            {onFavouriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onFavouriteToggle(id);
                }}
                className={`w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 transition-colors ${
                  isFavourited ? "text-red-600 " : "text-slate-400"
                }`}
                aria-label={
                  isFavourited ? "Remove from favourites" : "Add to favourites"
                }
              >
                <Heart size={18} fill={isFavourited ? "#dc2626" : "#ffffff"} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
