"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Search,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils/getInitials";
import { useAddListing } from "@/context/AddListingContext";
import { Logo } from "@/components/shared/Logo";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function Navbar() {
  const { openPanel } = useAddListing();
  const { user, profile, role, isAuthInitialized, isLoggingOut, signOut } =
    useAuth();
  const pathname = usePathname();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const tenantUnreadCount = useUnreadCount(user?.id, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/landlord/dashboard") return pathname === href;
    if (href === "/landlord/listings")
      return pathname.startsWith("/landlord/listings");
    if (href === "/landlord/messages")
      return pathname.startsWith("/landlord/messages");
    if (href === "/listings") return pathname.startsWith("/listings");
    if (href === "/tenant/saved") return pathname.startsWith("/tenant/saved");
    if (href === "/tenant/messages")
      return pathname.startsWith("/tenant/messages");
    return pathname === href;
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setAvatarOpen(false);
  }, [pathname]);

  // ── Loading (session hydrating) ────────────────────────────────────

  if (!isAuthInitialized) {
    return (
      <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-100">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo href="/" />
          <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse hidden md:block" />
        </div>
      </nav>
    );
  }

  // ── Public (unauthenticated) ───────────────────────────────────────

  if (!user && !isLoggingOut) {
    const publicLinks = [{ label: "Explore", href: "/listings" }];

    return (
      <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-100">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo href="/" />

          <div className="hidden lg:flex items-center gap-8">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-slate-500 hover:text-text-main"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex lg:hidden p-2 rounded-xl text-slate-500 hover:text-text-main hover:bg-slate-50 transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-text-main hover:text-primary transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all duration-150"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // ── Authenticated: Tenant ──────────────────────────────────────────

  if (role === "tenant") {
    const tenantLinks = [
      { label: "Explore", href: "/listings" },
      { label: "Saved", href: "/tenant/saved" },
      { label: "Inbox", href: "/tenant/messages" },
    ];

    return (
      <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-100">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo href="/tenant/dashboard" />

          <div className="hidden lg:flex items-center gap-8">
            {tenantLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-slate-500 hover:text-text-main"
                }`}
              >
                {link.label}
                {link.label === "Inbox" && tenantUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                    {tenantUnreadCount > 99 ? "99+" : tenantUnreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="flex lg:hidden p-2 rounded-xl text-slate-500 hover:text-text-main hover:bg-slate-50 transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-slate-200 p-1 hover:bg-slate-50 transition ml-1"
                aria-label="User menu"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? ""}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(profile?.full_name)}
                  </div>
                )}
                {avatarOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg"
                  >
                    <div className="space-y-3 rounded-xl px-3 py-2 text-sm  transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-text-main truncate">
                          {profile?.full_name ?? "User"}
                        </span>
                      </div>
                      <button
                        onClick={signOut}
                        disabled={isLoggingOut}
                        className="flex items-center gap-1 text-red-500 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </nav>
    );
  }

  // ── Authenticated: Landlord (minimal top bar) ──────────────────────

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-100 lg:ml-72">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          {mounted && <Logo href="/landlord/dashboard" />}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={openPanel}
            className="hidden lg:inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </button>

          <div ref={avatarRef} className="relative">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-slate-200 p-1 hover:bg-slate-50 transition ml-1"
              aria-label="User menu"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ""}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(profile?.full_name)}
                </div>
              )}
              {avatarOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg"
                >
                  <div className="space-y-3 rounded-xl px-3 py-2 text-sm  transition">
                    <div className="flex items-center gap-2 min-w-0 ">
                      <User className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="text-text-main truncate">
                        {profile?.full_name ?? "User"}
                      </span>
                    </div>
                    <div
                      onClick={isLoggingOut ? undefined : signOut}
                      className="flex items-center gap-2 text-red-500 shrink-0 cursor-pointer "
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span className="text-sm">Logout</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
