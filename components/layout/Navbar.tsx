"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Moon,
  Sun,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAddListing } from "@/context/AddListingContext";
import { Logo } from "@/components/shared/Logo";
import { AvatarDropdown } from "@/components/layout/AvatarDropdown";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function Navbar() {
  const { openPanel } = useAddListing();
  const { user, role, isAuthInitialized, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted] = useState(true);
  const tenantUnreadCount = useUnreadCount(user?.id, 0);
  const { theme, toggleTheme } = useTheme();

  const isActive = useMemo(
    () => (href: string) => {
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
    },
    [pathname],
  );



  // ── Loading (session hydrating) ────────────────────────────────────

  if (!isAuthInitialized) {
    return (
      <nav className="sticky top-0 z-50 h-16 bg-surface border-b border-slate-100 dark:border-border">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo href="/" />
          <div className="h-8 w-32 bg-slate-100 dark:bg-surface-elevated rounded-xl animate-pulse hidden md:block" />
        </div>
      </nav>
    );
  }

  // ── Public (unauthenticated) ───────────────────────────────────────

  if (!user && !isLoggingOut) {
    const publicLinks = [{ label: "Explore", href: "/listings" }];

    return (
      <nav className="sticky top-0 z-50 h-16 bg-surface border-b border-slate-100 dark:border-border">
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
                    : "text-slate-500 dark:text-text-secondary hover:text-text-main"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-text-secondary hover:text-text-main hover:bg-slate-50 dark:hover:bg-surface-elevated transition"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-text-main hover:text-primary transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150"
              >
                Sign Up
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-slate-500 dark:text-text-secondary hover:text-text-main transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/20 dark:bg-black/60 z-40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-surface z-50 lg:hidden shadow-xl"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border">
                    <Logo href="/" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-1 text-slate-500 dark:text-text-secondary hover:text-text-main transition"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {publicLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          isActive(link.href)
                            ? "bg-primary/5 text-primary"
                            : "text-text-main hover:bg-slate-50 dark:hover:bg-surface-elevated"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-border space-y-2">
                    <Link
                      href="/signup"
                      className="block text-center bg-primary text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/login"
                      className="block text-center border border-slate-200 dark:border-border text-text-main rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-surface-elevated active:scale-95 transition-all duration-150"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
      <nav className="sticky top-0 z-50 h-16 bg-surface border-b border-slate-100 dark:border-border">
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
                    : "text-slate-500 dark:text-text-secondary hover:text-text-main"
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
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-text-secondary hover:text-text-main hover:bg-slate-50 dark:hover:bg-surface-elevated transition"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <AvatarDropdown profileHref="/tenant/profile" />
          </div>
        </div>
      </nav>
    );
  }

  // ── Authenticated: Landlord (minimal top bar) ──────────────────────

  return (
    <nav className="sticky top-0 z-50 h-16 bg-surface border-b border-slate-100 dark:border-border lg:ml-72">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          {mounted && <Logo href="/landlord/dashboard" />}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={openPanel}
            className="hidden lg:inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-text-secondary hover:text-text-main hover:bg-slate-100 dark:hover:bg-surface-elevated transition"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <AvatarDropdown profileHref="/landlord/profile" />
        </div>
      </div>
    </nav>
  );
}
