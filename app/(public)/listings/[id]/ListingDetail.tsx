"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  BedDouble,
  Bath,
  ArrowLeft,
  Building2,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { findOrCreateConversation } from "@/lib/actions/conversations";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { Listing, KycStatus } from "@/types";

interface ListingDetailProps {
  listing: Listing & {
    profiles?: { full_name: string | null; avatar_url: string | null; kyc_status: KycStatus } | null;
  };
  landlordProfile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    kyc_status: KycStatus;
  } | null;
}

export function ListingDetail({
  listing,
  landlordProfile,
}: ListingDetailProps) {
  const router = useRouter();
  const { user, isAuthInitialized } = useAuth();
  const { openChat } = useChat();
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const isOwnListing = user && listing.landlord_id === user.id;

  const handleMessage = async () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    if (isOwnListing) return;
    setSending(true);
    const { data, error } = await findOrCreateConversation(
      listing.id,
      listing.landlord_id,
    );
    setSending(false);
    if (error || !data) return;
    openChat(data.id);
  };

  const rentLabel = listing.rent_type === "yearly" ? "year" : "month";

  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-text-main transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Images */}
      {listing.images && listing.images.length > 0 ? (
        <div className="mb-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-3">
            <Image
              src={listing.images[selectedImage]}
              alt={`${listing.title} ${selectedImage + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 transition-all duration-150 ${
                    i === selectedImage
                      ? " opacity-100"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${listing.title} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[4/3] rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
          <Building2 className="text-slate-300" size={48} />
        </div>
      )}

      {/* Title & Price */}
      <h1 className="text-2xl font-bold text-text-main mb-1">
        {listing.title}
      </h1>
      <p className="text-xl font-semibold text-primary dark:text-primary-text mb-2">
        ₦{listing.price.toLocaleString()}
        <span className="text-sm text-slate-400 dark:text-card-meta font-normal">/{rentLabel}</span>
      </p>

      <p className="text-sm text-slate-600 dark:text-text-secondary flex items-center gap-1 mb-4">
        <MapPin size={14} />
        {listing.location}
        {listing.area ? `, ${listing.area}` : ""}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="bg-slate-50 dark:bg-surface-elevated rounded-full px-3 py-1.5 text-xs text-slate-700 dark:text-card-badge-text flex items-center gap-1">
          <BedDouble size={13} />
          {listing.bedrooms ?? "—"} Beds
        </span>
        <span className="bg-slate-50 dark:bg-surface-elevated rounded-full px-3 py-1.5 text-xs text-slate-700 dark:text-card-badge-text flex items-center gap-1">
          <Bath size={13} />
          {listing.bathrooms ?? "—"} Baths
        </span>
        <span className="bg-slate-50 dark:bg-surface-elevated rounded-full px-3 py-1.5 text-xs text-slate-700 dark:text-card-badge-text capitalize">
          {listing.type}
        </span>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-text-main mb-2">
            Description
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-secondary leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>
      )}

      {/* Landlord card + Message button */}
      <div className="bg-surface rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden shrink-0">
            {landlordProfile?.avatar_url ? (
              <img src={landlordProfile.avatar_url} alt={landlordProfile.full_name ?? ""} className="w-full h-full object-cover" loading="lazy" />
            ) : landlordProfile?.full_name ? (
              landlordProfile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            ) : (
              "L"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text-main">
                {landlordProfile?.full_name ?? "Landlord"}
              </p>
              {landlordProfile?.kyc_status === "verified" && (
                <VerifiedBadge size="large" showLabel />
              )}
            </div>
            <p className="text-xs text-slate-400">Property Owner</p>
          </div>
        </div>

        {isAuthInitialized && user && !isOwnListing && (
          <button
            type="button"
            onClick={handleMessage}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            {sending ? "..." : "chat"}
          </button>
        )}
      </div>
    </div>
  );
}
