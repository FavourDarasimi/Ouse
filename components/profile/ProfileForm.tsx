"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/actions/profile";

export function ProfileForm() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) {
      setFieldError("Full name is required.");
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: submitError } = await updateProfile({
      fullName: fullName.trim(),
    });

    if (submitError) {
      setError(submitError);
    } else {
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fullName"
          className="text-xs font-medium text-slate-400 uppercase tracking-wide"
        >
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldError) setFieldError(null);
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-surface px-4 py-3 text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition mt-1"
          placeholder="Your full name"
        />
        {fieldError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldError}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save changes"}
        </button>

        {success && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </motion.span>
        )}
      </div>
    </form>
  );
}
