"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Home, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "@/lib/actions/auth";
import { Logo } from "@/components/shared/Logo";
import type { Role } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 } as const,
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35 } as const,
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.4 } as const,
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "redirect" | "ready">("loading");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarded")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.onboarded === true && (profile.role === "landlord" || profile.role === "tenant")) {
        const dashboard =
          profile.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
        router.replace(dashboard);
        setStatus("redirect");
        return;
      }

      setStatus("ready");
    });
  }, [router, supabase]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setError(null);

    const result = await completeOnboarding(selectedRole);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const dashboard =
      selectedRole === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    router.push(dashboard);
  };

  if (status === "loading" || status === "redirect") {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-background bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center dark:bg-background bg-background px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <Logo href="/" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-10"
        >
          <motion.p variants={cardVariants} className="text-sm text-slate-400 dark:text-text-secondary">
            Welcome, {userName}
          </motion.p>

          <motion.h1 variants={cardVariants} className="mt-2 text-3xl font-bold text-text-main dark:text-text-main">
            What brings you to Ouse?
          </motion.h1>

          <motion.p variants={cardVariants} className="mt-1 text-sm text-slate-400 dark:text-text-secondary">
            Choose your role to get started. You can only pick one.
          </motion.p>

          <motion.div variants={cardVariants} className="mt-8 grid grid-cols-2 gap-4">
            {/* Tenant card */}
            <button
              type="button"
              onClick={() => setSelectedRole("tenant")}
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                selectedRole === "tenant"
                  ? "border-primary bg-blue-50 dark:border-primary dark:bg-surface-elevated"
                  : "border-slate-200 bg-white hover:border-primary/40 dark:bg-surface-elevated dark:border-border"
              }`}
            >
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                  selectedRole === "tenant" ? "bg-primary dark:bg-primary-subtle" : "bg-slate-100 dark:bg-primary-subtle"
                }`}
              >
                <Home
                  className={`text-2xl transition-colors ${
                    selectedRole === "tenant" ? "text-white dark:text-primary-text" : "text-slate-400 dark:text-primary-text"
                  }`}
                  size={28}
                />
              </div>
              <p className="font-semibold text-text-main dark:text-text-main">Tenant</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-text-secondary">
                I am looking for a home to rent
              </p>
            </button>

            {/* Landlord card */}
            <button
              type="button"
              onClick={() => setSelectedRole("landlord")}
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                selectedRole === "landlord"
                  ? "border-primary bg-blue-50 dark:border-primary dark:bg-surface-elevated"
                  : "border-slate-200 bg-white hover:border-primary/40 dark:bg-surface-elevated dark:border-border"
              }`}
            >
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                  selectedRole === "landlord" ? "bg-primary dark:bg-primary-subtle" : "bg-slate-100 dark:bg-primary-subtle"
                }`}
              >
                <Building2
                  className={`text-2xl transition-colors ${
                    selectedRole === "landlord" ? "text-white dark:text-primary-text" : "text-slate-400 dark:text-primary-text"
                  }`}
                  size={28}
                />
              </div>
              <p className="font-semibold text-text-main dark:text-text-main">Landlord</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-text-secondary">
                I have a property to rent out
              </p>
            </button>
          </motion.div>

          <motion.div variants={buttonVariants} className="mt-6">
            {error && (
              <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole || submitting}
              className={`w-full max-w-md py-3 rounded-xl font-medium transition-all ${
                selectedRole && !submitting
                  ? "bg-primary text-white hover:bg-blue-700 dark:bg-primary dark:text-card-btn-text dark:hover:bg-primary-hover"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
