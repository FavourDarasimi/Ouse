"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  X,
  Fingerprint,
  CreditCard,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { verifyIdentity } from "@/lib/actions/kyc";
import { useAuth } from "@/context/AuthContext";
import type { KycMethod } from "@/types";

interface KycModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "method" | "input" | "result";

export function KycModal({ open, onClose }: KycModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<KycMethod | null>(null);
  const [identityNumber, setIdentityNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();

  const reset = () => {
    setStep("method");
    setMethod(null);
    setIdentityNumber("");
    setDateOfBirth("");
    setSubmitting(false);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!method) return;

    setError(null);

    if (method === "nin" && !/^\d{11}$/.test(identityNumber.trim())) {
      setError("NIN must be an 11-digit number.");
      return;
    }

    if (method === "bvn" && !/^\d{11}$/.test(identityNumber.trim())) {
      setError("BVN must be an 11-digit number.");
      return;
    }

    if (!dateOfBirth.trim()) {
      setError("Date of birth is required.");
      return;
    }

    setSubmitting(true);
    const res = await verifyIdentity(
      method,
      identityNumber.trim(),
      dateOfBirth,
    );
    setSubmitting(false);

    if (res.error) {
      setResult({ success: false, error: res.error });
    } else {
      setResult({ success: true });
      await refreshProfile();
    }

    setStep("result");
  };

  const handleTryAgain = () => {
    reset();
  };

  const methods = [
    {
      id: "nin" as KycMethod,
      label: "National Identification Number (NIN)",
      description: "11-digit NIN issued by NIMC",
      icon: Fingerprint,
    },
    {
      id: "bvn" as KycMethod,
      label: "Bank Verification Number (BVN)",
      description: "11-digit BVN from your bank",
      icon: CreditCard,
    },
  ];

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full sm:max-w-md bg-white dark:bg-surface rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90dvh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-surface z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2">
                {step !== "method" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === "result") {
                        reset();
                      } else {
                        setStep("method");
                        setError(null);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-elevated transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-text-main">
                  {step === "method" && "Verify your identity"}
                  {step === "input" && "Enter your details"}
                  {step === "result" && (result?.success ? "Verified!" : "Verification failed")}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-elevated transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Choose method */}
                {step === "method" && (
                  <motion.div
                    key="method"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-3"
                  >
                    <p className="text-sm text-slate-500 dark:text-text-secondary mb-4">
                      Choose how you&apos;d like to verify your identity. Your data is encrypted and never stored.
                    </p>
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMethod(m.id);
                          setStep("input");
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-surface hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-surface-elevated transition-all duration-150 text-left group"
                      >
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">
                            {m.label}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {m.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Step 2: Enter details */}
                {step === "input" && (
                  <motion.div
                    key="input"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="identityNumber"
                        className="text-xs font-medium text-slate-400 uppercase tracking-wide"
                      >
                        {method?.toUpperCase()} Number
                      </label>
                      <input
                        id="identityNumber"
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={11}
                        value={identityNumber}
                        onChange={(e) => {
                          setIdentityNumber(e.target.value.replace(/\D/g, ""));
                          setError(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-surface px-4 py-3 text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition mt-1"
                        placeholder="Enter 11-digit number"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dateOfBirth"
                        className="text-xs font-medium text-slate-400 uppercase tracking-wide"
                      >
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                          setError(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-surface px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition mt-1"
                      />
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-surface-elevated">
                      <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Your number is encrypted and never stored. We only keep a verification reference.
                      </p>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150 disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting ? "Verifying..." : "Verify identity"}
                    </button>
                  </motion.div>
                )}

                {/* Step 3: Result */}
                {step === "result" && result && (
                  <motion.div
                    key="result"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center text-center py-4"
                  >
                    {result.success ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-100 flex items-center justify-center mb-4"
                        >
                          <CheckCircle2 className="h-8 w-8 text-green-700" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-text-main mb-1">
                          Verification successful
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-text-secondary mb-6">
                          Your verified badge is now active on your profile and listings.
                        </p>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150"
                        >
                          Done
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-100 flex items-center justify-center mb-4">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-main mb-1">
                          Verification failed
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-text-secondary mb-2 max-w-xs">
                          {result.error ?? "We couldn't verify your identity with the details provided."}
                        </p>
                        <p className="text-xs text-slate-400 mb-6">
                          Make sure your details match your official records. Contact support if the issue persists.
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleTryAgain}
                            className="w-full bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150"
                          >
                            Try again
                          </button>
                          <a
                            href="mailto:support@ouse.ng"
                            className="w-full text-center text-sm text-slate-500 hover:text-text-main transition-colors py-2"
                          >
                            Contact support
                          </a>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
