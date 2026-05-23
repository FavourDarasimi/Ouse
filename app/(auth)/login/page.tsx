"use client";

import { Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Home as HomeIcon,
  ArrowRight,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fadeUp, staggerContainer } from "@/lib/utils/motionVariants";

// ─── Friendly error messages ─────────────────────────────────────────────────

function friendlyError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password.";
  if (message.includes("Email not confirmed"))
    return "Please verify your email address before signing in.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

// ─── Left panel — property showcase ─────────────────────────────────────────

function ShowcasePanel() {
  return (
    <div className="relative hidden h-full lg:flex lg:w-1/2 xl:w-[55%]">
      {/* Background image */}
      <Image
        src="/auth-bg.png"
        alt="Modern apartment in Lagos"
        fill
        className="object-cover"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-secondary/10" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-10">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold text-white"
        >
          <HomeIcon className="h-5 w-5 text-primary" />
          Ouse
        </Link>

        {/* Bottom copy */}
        <div className="space-y-6">
          {/* Testimonial card */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              &ldquo;Found my apartment in Lekki within 3 days. The landlord was
              verified and the process was completely stress-free.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center text-white text-xs font-semibold">
                AO
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Amara Okonkwo
                </p>
                <p className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="h-3 w-3" /> Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
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
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-text-main transition-all duration-150 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {/* Google "G" icon */}
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

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-xs text-slate-400">or continue with email</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

// ─── Login form (inner — needs useSearchParams) ───────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // Google redirect handles the rest — no need to setGoogleLoading(false)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(friendlyError(authError.message));
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    const destination =
      next ??
      (role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
    router.push(destination);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 xl:w-[65%]"
    >
      <div className="mx-auto w-full max-w-sm">
        {/* Mobile logo */}
        <motion.div variants={fadeUp} className="mb-8 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-secondary"
          >
            <HomeIcon className="h-5 w-5 text-primary" />
            Ouse
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-main">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to your Ouse account
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          {/* Google */}
          <GoogleButton
            label="Continue with Google"
            onClick={handleGoogleSignIn}
            loading={googleLoading}
          />

          <Divider />

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text-main placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-text-main placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all duration-150 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ShowcasePanel />
      <div className="flex flex-1 overflow-y-auto justify-center">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
