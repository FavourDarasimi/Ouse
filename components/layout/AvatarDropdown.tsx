"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils/getInitials";

interface AvatarDropdownProps {
  profileHref: string;
}

export function AvatarDropdown({ profileHref }: AvatarDropdownProps) {
  const { user, profile, isLoggingOut, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-border p-1 hover:bg-slate-50 dark:hover:bg-surface-elevated transition ml-1"
        aria-label="User menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? ""}
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(profile?.full_name)}
          </div>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500 dark:text-text-secondary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500 dark:text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-100 dark:border-border bg-surface p-1.5 shadow-lg"
          >
            <div className="space-y-0.5 rounded-xl py-1 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 min-w-0 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                  {getInitials(profile?.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-text-main font-medium truncate text-sm leading-tight">
                    {profile?.full_name ?? "User"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-border my-1" />

              <Link
                href={profileHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-elevated transition-colors"
              >
                <User className="h-4 w-4 shrink-0 text-slate-500 dark:text-text-secondary" />
                <span className="text-text-main">Profile</span>
              </Link>

              <div className="border-t border-slate-100 dark:border-border my-1" />

              <button
                onClick={signOut}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-elevated transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
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
  );
}
