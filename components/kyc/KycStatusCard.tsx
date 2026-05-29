"use client";

import { BadgeCheck, Clock, AlertTriangle, ShieldOff, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const statusConfig = {
  verified: {
    icon: BadgeCheck,
    label: "Verified",
    description: "Your identity has been verified successfully.",
    containerClass: "bg-green-50 dark:bg-green-100 border-green-200 dark:border-green-700",
    iconClass: "text-green-700 dark:text-green-700",
    labelClass: "text-green-800 dark:text-green-800",
    descClass: "text-green-700 dark:text-green-700",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    description: "Your verification is being reviewed.",
    containerClass: "bg-amber-50 dark:bg-amber-100 border-amber-200 dark:border-amber-700",
    iconClass: "text-amber-600 dark:text-amber-600",
    labelClass: "text-amber-800 dark:text-amber-800",
    descClass: "text-amber-700 dark:text-amber-700",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    description: "Verification was unsuccessful. Please try again.",
    containerClass: "bg-red-50 dark:bg-red-100 border-red-200 dark:border-red-700",
    iconClass: "text-red-600 dark:text-red-600",
    labelClass: "text-red-800 dark:text-red-800",
    descClass: "text-red-700 dark:text-red-700",
  },
  unverified: {
    icon: AlertTriangle,
    label: "Not Verified",
    description: "Verify your identity to build trust with tenants.",
    containerClass: "bg-slate-50 dark:bg-surface-elevated border-slate-200 dark:border-border",
    iconClass: "text-slate-400 dark:text-text-muted",
    labelClass: "text-slate-600 dark:text-text-secondary",
    descClass: "text-slate-500 dark:text-text-muted",
  },
};

export function KycStatusCard() {
  const { kyc_status, kyc_method, kyc_verified_at } = useAuth();
  const config = statusConfig[kyc_status];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-5 ${config.containerClass}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full bg-white/80 dark:bg-surface ${config.iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.labelClass}`}>
            {config.label}
          </h3>
          <p className={`text-xs mt-0.5 ${config.descClass}`}>
            {config.description}
          </p>
          {kyc_status === "verified" && kyc_method && (
            <p className="text-xs mt-1 text-slate-500 dark:text-text-muted">
              Verified via {kyc_method.toUpperCase()}
              {kyc_verified_at
                ? ` on ${new Date(kyc_verified_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
