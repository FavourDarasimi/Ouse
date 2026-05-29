"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/actions/profile";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils/getInitials";

export function ProfileAvatarUpload() {
  const { profile, refreshProfile } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const { error: uploadError } = await uploadAvatar(formData);
    if (uploadError) {
      setError(uploadError);
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
    } else {
      await refreshProfile();
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
    }

    setUploading(false);
  };

  const displayUrl = preview || profile?.avatar_url;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group cursor-pointer"
        aria-label="Upload profile picture"
      >
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={profile?.full_name ?? "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {getInitials(profile?.full_name)}
            </span>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Choose profile picture"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-xs">
          {error}
        </p>
      )}

      <p className="text-xs text-slate-400">Click to upload photo (max 2MB)</p>
    </div>
  );
}
