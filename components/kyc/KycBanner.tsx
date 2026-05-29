"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface KycBannerProps {
  onVerify: () => void;
}

export function KycBanner({ onVerify }: KycBannerProps) {
  const { kyc_status, role } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const show = (kyc_status === "unverified" || kyc_status === "failed") && !dismissed;
  if (!show) return null;

  const isLandlord = role === "landlord";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`rounded-2xl border p-4 ${
          isLandlord
            ? "bg-amber-50 dark:bg-amber-100 border-amber-200 dark:border-amber-700"
            : "bg-blue-50 dark:bg-blue-50 border-blue-200 dark:border-blue-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded-full shrink-0 ${
            isLandlord ? "bg-amber-100 dark:bg-amber-200" : "bg-blue-100 dark:bg-blue-200"
          }`}>
            <ShieldAlert className={`h-4 w-4 ${
              isLandlord ? "text-amber-700" : "text-primary"
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${
              isLandlord ? "text-amber-900 dark:text-amber-900" : "text-text-main"
            }`}>
              {isLandlord
                ? "Verify your identity to build trust"
                : "Optional: Verify your identity"}
            </p>
            <p className={`text-xs mt-0.5 ${
              isLandlord ? "text-amber-800 dark:text-amber-800" : "text-slate-500 dark:text-text-secondary"
            }`}>
              {isLandlord
                ? "Verified landlords get a badge and appear more trustworthy to tenants."
                : "Verified profiles help landlords recognise serious enquirers."}
            </p>
            <button
              type="button"
              onClick={onVerify}
              className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                isLandlord
                  ? "text-amber-900 hover:text-amber-950"
                  : "text-primary hover:text-emerald-800"
              } transition-colors`}
            >
              Verify now <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`p-1 rounded-full shrink-0 ${
              isLandlord
                ? "hover:bg-amber-100 dark:hover:bg-amber-200 text-amber-600"
                : "hover:bg-blue-100 dark:hover:bg-blue-200 text-slate-400"
            } transition-colors`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
