"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const content = (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={loading ? undefined : onCancel}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-surface p-6 shadow-2xl"
            style={{ animation: "modal-in 0.15s ease-out" }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="absolute right-4 top-4 p-1 text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-text-main">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{message}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 dark:border-border px-4 py-2.5 text-sm font-medium text-text-main transition-colors hover:bg-slate-50 dark:hover:bg-surface-elevated disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
