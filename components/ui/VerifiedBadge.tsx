"use client";

import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "small" | "large";
  showLabel?: boolean;
}

export function VerifiedBadge({ size = "small", showLabel = false }: VerifiedBadgeProps) {
  if (size === "large") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-50 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
        <BadgeCheck className="h-3.5 w-3.5" />
        {showLabel ? "Identity verified by Ouse" : "Verified"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-50 text-primary rounded-full p-0.5" title="Verified">
      <BadgeCheck className="h-3 w-3" />
    </span>
  );
}
