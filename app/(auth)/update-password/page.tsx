"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { fadeUp } from "@/lib/utils/motionVariants";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login?error=auth_failed");
        return;
      }
      setCheckingSession(false);
    });
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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

        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-text-main">
              Password updated
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-text-muted">
              Your password has been changed successfully.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Sign in with new password
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-center text-2xl font-bold text-text-main">
              Set new password
            </h1>
            <p className="mb-8 text-center text-sm text-slate-400 dark:text-text-muted">
              Must be at least 6 characters.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-accent-subtle dark:border-accent-subtle dark:text-accent">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-11 text-sm text-text-main outline-none placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 dark:border-border dark:bg-surface dark:placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-main transition-colors dark:text-text-muted"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-text-main outline-none placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 dark:border-border dark:bg-surface dark:placeholder:text-text-muted"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
