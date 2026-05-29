"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/utils/motionVariants";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { KycBanner } from "@/components/kyc/KycBanner";
import { KycStatusCard } from "@/components/kyc/KycStatusCard";
import { KycModal } from "@/components/kyc/KycModal";

export default function TenantProfilePage() {
  const [kycOpen, setKycOpen] = useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      <motion.div variants={fadeUp}>
        <ProfileHeader />
      </motion.div>

      <motion.div variants={fadeUp}>
        <KycBanner onVerify={() => setKycOpen(true)} />
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface rounded-3xl border border-slate-100 dark:border-border p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">Profile picture</h2>
        <ProfileAvatarUpload />
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface rounded-3xl border border-slate-100 dark:border-border p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">Personal information</h2>
        <ProfileForm />
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface rounded-3xl border border-slate-100 dark:border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-main">Identity verification</h2>
          <button
            type="button"
            onClick={() => setKycOpen(true)}
            className="text-sm font-medium text-primary hover:text-emerald-800 transition-colors"
          >
            Verify
          </button>
        </div>
        <KycStatusCard />
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold text-text-main mb-4">Your stats</h2>
        <ProfileStats />
      </motion.div>

      <KycModal open={kycOpen} onClose={() => setKycOpen(false)} />
    </motion.div>
  );
}
