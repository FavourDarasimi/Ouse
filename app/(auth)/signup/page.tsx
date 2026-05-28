"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Mail,
  MapPin,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { fadeUp, staggerContainer } from "@/lib/utils/motionVariants";

// ─── Friendly error messages ─────────────────────────────────────────────────

function friendlyError(message: string): string {
  if (message.includes("User already registered"))
    return "An account with this email already exists.";
  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (message.includes("valid email"))
    return "Please enter a valid email address.";
  return "Something went wrong. Please try again.";
}

// ─── Left panel — property showcase ──────────────────────────────────────────

function ShowcasePanel() {
  return (
    <div className="relative hidden h-full lg:flex lg:w-1/2 xl:w-[55%]">
      <Image
        src="/auth-bg.png"
        alt="Modern apartment in Lagos"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-secondary/10" />
      <div className="relative flex h-full flex-col justify-between p-10">
        <Logo href="/" variant="light" size="lg" />
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              &ldquo;Listed my duplex in Ikeja and got three serious enquiries
              in 48 hours. Ouse made the whole process effortless.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-white text-xs font-semibold">
                CB
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Chidi Bello</p>
                <p className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="h-3 w-3" /> Abuja, Nigeria
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "2,400+", label: "Listings" },
              { value: "840+", label: "Landlords" },
              { value: "12", label: "Cities" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Google OAuth button ──────────────────────────────────────────────────────

function GoogleButton({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm font-medium text-text-main transition-all duration-150 hover:bg-slate-50 dark:hover:bg-surface-elevated active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-100 dark:bg-border" />
      <span className="text-xs text-slate-400 dark:text-text-muted">or continue with email</span>
      <div className="h-px flex-1 bg-slate-100 dark:bg-border" />
    </div>
  );
}

// ─── Email sent screen ────────────────────────────────────────────────────────

function EmailSentScreen({
  email,
  onResend,
}: {
  email: string;
  onResend: () => Promise<void>;
}) {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleResend = async () => {
    if (cooldown > 0) return;
    await onResend();
    startCooldown();
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-main">Check your email</h2>
        <p className="mt-2 text-sm text-slate-400 dark:text-text-muted">
          We sent a verification link to{" "}
          <span className="font-medium text-text-main">{email}</span>.
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-main transition-all duration-150 hover:bg-slate-50 dark:hover:bg-surface-elevated active:scale-95 disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
        </button>
        <div className="mt-4">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Signup form ──────────────────────────────────────────────────────────────

function SignupForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleResend = async () => {
    await supabase.auth.resend({
      type: "signup",
      email,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(friendlyError(authError.message));
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  };

  if (emailSent) {
    return <EmailSentScreen email={email} onResend={handleResend} />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 xl:w-[65%]"
    >
      <div className="mx-auto w-full max-w-sm">
        {/* Heading */}
        <motion.div variants={fadeUp} className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-main">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-text-muted">
            Join thousands finding homes across Nigeria
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          {/* Google */}
          <GoogleButton
            label="Sign up with Google"
            onClick={handleGoogleSignIn}
            loading={googleLoading}
          />

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label
                htmlFor="full-name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
              >
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amara Okonkwo"
                className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
              >
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-text-muted"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 pr-11 text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted hover:text-slate-600 dark:hover:text-text-secondary transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-accent-subtle dark:border-accent-subtle dark:text-accent"
              >
                {error}
              </p>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 dark:text-text-muted">
              By signing up you agree to our {" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </p>
          </form>

          <p className="text-center text-sm text-slate-400 dark:text-text-muted">
            Already have an account? {" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  return (
    <div className="flex lg:h-screen min-h-screen  bg-surface">
      <ShowcasePanel />
      <div className="relative flex flex-1 overflow-y-auto justify-center">
        {/* Mobile/tablet logo — top left */}
        <div className="absolute left-4 top-4 z-10 lg:hidden">
          <Logo href="/" />
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
