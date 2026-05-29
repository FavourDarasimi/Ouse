"use client";

import { useAuth } from "@/context/AuthContext";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { getInitials } from "@/lib/utils/getInitials";

export function ProfileHeader() {
  const { profile, role, kyc_status } = useAuth();

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      })
    : null;

  const tagline =
    role === "landlord"
      ? "Trusted landlord on Ouse"
      : "Finding your next home";

  return (
    <div className="bg-white dark:bg-surface rounded-3xl border border-slate-100 dark:border-border p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {getInitials(profile?.full_name)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <h1 className="text-2xl font-bold text-text-main">
              {profile?.full_name ?? "User"}
            </h1>
            {kyc_status === "verified" && (
              <VerifiedBadge size="large" />
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-text-secondary mt-1">
            {tagline}
          </p>

          <div className="flex items-center gap-3 justify-center sm:justify-start mt-3">
            {role && (
              <span className="bg-emerald-50 dark:bg-emerald-50 text-primary text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                {role}
              </span>
            )}
            {joinedDate && (
              <span className="text-xs text-slate-400">
                Joined {joinedDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
