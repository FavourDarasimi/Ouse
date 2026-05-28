"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { fadeUp } from "@/lib/utils/motionVariants";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/update-password`,
      });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-text-main">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-text-muted">
              We sent a password reset link to{" "}
              <span className="font-medium text-text-main">{email}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-text-muted">
              Click the link in the email to reset your password.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-center text-2xl font-bold text-text-main">
              Forgot password?
            </h1>
            <p className="mb-8 text-center text-sm text-slate-400 dark:text-text-muted">
              No worries — we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-accent-subtle dark:border-accent-subtle dark:text-accent">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-text-muted" />
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-text-main outline-none placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 dark:border-border dark:bg-surface dark:placeholder:text-text-muted"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-text-main transition-colors dark:text-text-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
