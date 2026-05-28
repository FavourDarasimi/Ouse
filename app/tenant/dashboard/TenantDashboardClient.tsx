"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/utils/motionVariants";
import {
  Search,
  MapPin,
  Heart,
  MessageCircle,
  ChevronRight,
  Bed,
  Bath,
  Building2,
} from "lucide-react";
import { useFavourites } from "@/context/FavouritesContext";

interface FeaturedListing {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  landlordName: string | null;
  landlordAvatar: string | null;
}

interface SavedListing {
  id: string;
  title: string;
  price: number;
}

interface ChatDetail {
  id: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  lastMessage: string | null;
  unreadCount: number;
}

interface TenantDashboardClientProps {
  userName: string | null;
  userAvatar: string | null;
  featuredListings: FeaturedListing[];
  savedListings: SavedListing[];
  chatDetails: ChatDetail[];
}

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    alt: "Modern living room interior",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    alt: "Luxury apartment with city view",
  },
  {
    src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    alt: "Modern apartment bedroom",
  },
];

const CATEGORIES = [
  "Apartments",
  "Self Contain",
  "Hostels",
  "Shared Apartment",
  "Luxury",
  "Cheap Rent",
  "Near Me",
];

const POPULAR_LOCATIONS = [
  "Lekki",
  "Ikoyi",
  "Victoria Island",
  "Yaba",
  "Surulere",
  "Wuse 2",
  "GRA",
  "Ajah",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TenantDashboardClient({
  userName,
  userAvatar,
  featuredListings,
  savedListings,
  chatDetails,
}: TenantDashboardClientProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { isFavourited, toggleFavourite } = useFavourites();

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      router.push(`/listings?location=${encodeURIComponent(q)}`);
    } else {
      router.push("/listings");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* ── Hero Section ─────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          className="relative mt-6 overflow-hidden rounded-3xl  px-6 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10 lg:px-14 lg:pb-16 lg:pt-12"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
            {/* Text content */}
            <div className="relative z-10 flex-1">
              <p className="text-sm font-medium text-slate-500 dark:text-text-secondary">
                {getGreeting()}
                {userName ? `, ${userName}` : ""} ✦
              </p>
              <h1 className="mt-2 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                Find a place that{" "}
                <span className="text-primary">feels like home</span>
              </h1>
              <p className="mt-3 max-w-lg text-base text-slate-400 dark:text-text-muted sm:text-lg">
                Discover premium rental properties across Nigeria&apos;s best
                neighbourhoods
              </p>

              <div className="mt-6 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg shadow-emerald-500/5 backdrop-blur-xl dark:border-border dark:bg-surface/80 sm:gap-3">
                <div className="flex flex-1 items-center gap-2 pl-2">
                  <MapPin className="h-5 w-5 shrink-0 text-slate-400 dark:text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by location, property type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full border-none bg-transparent py-2 text-sm text-text-main outline-none placeholder:text-slate-400 dark:placeholder:text-text-muted"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 sm:px-5"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Image stack: three cards fan layout — hovered card lifts above the rest */}
            <div className="relative h-52 flex-none sm:h-64 lg:h-72 lg:flex-1">
              {HERO_IMAGES.map((img, i) => {
                const pos = [
                  { left: "30%", scale: 1, zIndex: 3 },
                  { left: "60%", scale: 0.85, zIndex: 2 },
                  { left: "0%", scale: 0.85, zIndex: 1 },
                ][i];

                return (
                  <motion.div
                    key={i}
                    className="absolute top-0 h-full overflow-hidden rounded-2xl shadow-lg"
                    style={{ width: "40%", zIndex: pos.zIndex }}
                    animate={{ left: pos.left, scale: pos.scale }}
                    whileHover={{ scale: 1, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="cursor-pointer object-cover"
                      sizes="(max-width: 640px) 40vw, 25vw"
                      priority
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── Main Content: Feed + Sidebar ─────────────────────────── */}
        <motion.section
          variants={fadeUp}
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-main">
                Featured properties
              </h2>
              <Link
                href="/listings"
                className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-emerald-800"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {featuredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 dark:border-border bg-white/50 dark:bg-surface/50 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-main">
                  No properties yet
                </h3>
                <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-text-muted">
                  Check back soon for new rental listings in your area.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {featuredListings.map((listing, i) => {
                  const isFav = isFavourited(listing.id);
                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <Link href={`/listings/${listing.id}`}>
                        <div className="group cursor-pointer">
                          <div className="relative aspect-video overflow-hidden rounded-3xl shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
                            {listing.image ? (
                              <Image
                                src={listing.image}
                                alt={listing.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-surface-elevated">
                                <Building2 className="h-8 w-8 text-slate-300 dark:text-text-muted" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleFavourite(listing.id);
                              }}
                              className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                                isFav ? "text-accent" : "bg-black/30 text-white"
                              }`}
                              aria-label={
                                isFav
                                  ? "Remove from favourites"
                                  : "Add to favourites"
                              }
                            >
                              <Heart
                                className="h-5 w-5"
                                fill={isFav ? "currentColor" : "none"}
                              />
                            </button>
                          </div>

                          <div className="mt-3 space-y-1.5 px-0.5">
                            <h3 className="line-clamp-1 text-base font-semibold text-text-main">
                              {listing.title}
                            </h3>
                            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-text-secondary">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {listing.location}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-base font-bold text-text-main">
                                ₦{listing.price.toLocaleString()}
                                <span className="ml-0.5 text-xs font-normal text-slate-400 dark:text-text-muted">
                                  /mo
                                </span>
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-text-secondary">
                                <span className="flex items-center gap-0.5">
                                  <Bed className="h-3 w-3" />{" "}
                                  {listing.bedrooms ?? "—"}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Bath className="h-3 w-3" />{" "}
                                  {listing.bathrooms ?? "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden space-y-6 lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Saved Listings */}
              <div className="rounded-2xl border border-slate-100/50 dark:border-border bg-white/70 dark:bg-surface/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-text-main">
                      Saved
                    </h3>
                  </div>
                  <Link
                    href="/tenant/saved"
                    className="text-xs font-medium text-primary hover:text-emerald-800"
                  >
                    View all
                  </Link>
                </div>
                {savedListings.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-text-muted">
                    No saved listings yet
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {savedListings.map((item) => (
                      <Link
                        key={item.id}
                        href={`/listings/${item.id}`}
                        className="flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                      >
                        <p className="truncate text-sm text-text-main">
                          {item.title}
                        </p>
                        <span className="ml-2 shrink-0 text-xs font-medium text-black dark:text-text-main">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Chats */}
              <div className="rounded-2xl border border-slate-100/50 dark:border-border bg-white/70 dark:bg-surface/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-text-main">
                      Active chats
                    </h3>
                  </div>
                  <Link
                    href="/tenant/messages"
                    className="text-xs font-medium text-primary hover:text-emerald-800"
                  >
                    View all
                  </Link>
                </div>
                {chatDetails.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-text-muted">
                    No active conversations
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chatDetails.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/tenant/messages/${chat.id}`}
                        className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            chat.unreadCount > 0
                              ? "bg-primary text-white"
                              : "bg-emerald-50 dark:bg-emerald-900/30 text-primary"
                          }`}
                        >
                          {chat.otherUserName
                            ? getInitials(chat.otherUserName)
                            : "LD"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-text-main">
                              {chat.otherUserName ?? "Landlord"}
                            </span>
                            {chat.unreadCount > 0 && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-slate-400 dark:text-text-muted">
                            {chat.lastMessage ?? "Start a conversation"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Locations */}
              <div className="rounded-2xl border border-slate-100/50 dark:border-border bg-white/70 dark:bg-surface/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 dark:text-text-muted" />
                  <h3 className="text-sm font-semibold text-text-main">
                    Popular locations
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <Link
                      key={loc}
                      href={`/listings?location=${encodeURIComponent(loc.toLowerCase())}`}
                      className="rounded-full border border-slate-200 dark:border-border bg-white dark:bg-surface px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-text-secondary transition-all duration-150 hover:border-primary/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-primary"
                    >
                      {loc}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </motion.section>

        <div className="h-12" />
      </motion.div>
    </div>
  );
}
