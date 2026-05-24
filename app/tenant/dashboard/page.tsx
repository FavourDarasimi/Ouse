import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Home, Heart, MessageCircle } from "lucide-react";

export default async function TenantDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-text-main">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Find and manage your rental journey
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/listings"
            className="rounded-2xl border border-slate-100 bg-white p-6 hover:border-primary/30 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-main">
              Browse listings
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Find your next home across Nigeria
            </p>
          </Link>

          <Link
            href="/tenant/saved"
            className="rounded-2xl border border-slate-100 bg-white p-6 hover:border-primary/30 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-main">
              Saved listings
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Properties you&apos;ve favourited
            </p>
          </Link>

          <Link
            href="/tenant/messages"
            className="rounded-2xl border border-slate-100 bg-white p-6 hover:border-primary/30 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-main">
              Messages
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Chat with landlords about listings
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
