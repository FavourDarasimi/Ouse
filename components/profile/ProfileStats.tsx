"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Heart, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { staggerContainer, fadeUp } from "@/lib/utils/motionVariants";

export function ProfileStats() {
  const { user, role } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<{ label: string; value: number; icon: typeof Building2 }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;
    const uid = user.id;

    async function fetchStats() {
      if (role === "landlord") {
        const [{ count: listingCount }, { count: activeCount }, { count: savedCount }] =
          await Promise.all([
            supabase
              .from("listings")
              .select("id", { count: "exact", head: true })
              .eq("landlord_id", uid),
            supabase
              .from("listings")
              .select("id", { count: "exact", head: true })
              .eq("landlord_id", uid)
              .eq("available", true),
            supabase
              .from("favourites")
              .select("id, listings!inner(landlord_id)", { count: "exact", head: true })
              .eq("listings.landlord_id", uid),
          ]);

        setStats([
          { label: "Total Listings", value: listingCount ?? 0, icon: Building2 },
          { label: "Active", value: activeCount ?? 0, icon: Building2 },
          { label: "Saved by Tenants", value: savedCount ?? 0, icon: Heart },
        ]);
      } else {
        const [{ count: savedCount }, { count: messageCount }] = await Promise.all([
          supabase
            .from("favourites")
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", uid),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", uid),
        ]);

        setStats([
          { label: "Saved Listings", value: savedCount ?? 0, icon: Heart },
          { label: "Conversations", value: messageCount ?? 0, icon: MessageCircle },
        ]);
      }

      setLoading(false);
    }

    fetchStats();
  }, [user, role, supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: role === "landlord" ? 3 : 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface rounded-2xl border border-slate-100 dark:border-border p-5 animate-pulse">
            <div className="h-3 bg-slate-100 dark:bg-surface-elevated rounded w-16 mb-3" />
            <div className="h-8 bg-slate-100 dark:bg-surface-elevated rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="bg-white dark:bg-surface rounded-2xl border border-slate-100 dark:border-border p-5"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-text-main">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
