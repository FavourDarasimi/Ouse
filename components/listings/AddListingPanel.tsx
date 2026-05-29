"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type DragEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, GripVertical, Upload, ShieldAlert } from "lucide-react";
import { useAddListing } from "@/context/AddListingContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { PropertyType, RentType, Listing } from "@/types";

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Room" },
  { value: "duplex", label: "Duplex" },
  { value: "flat", label: "Flat" },
];

interface ImageItem {
  id: string;
  type: "file" | "url";
  file?: File;
  url?: string;
  preview: string;
}

let imageIdCounter = 0;
function nextImageId(): string {
  return `img_${++imageIdCounter}`;
}

export function AddListingPanel() {
  const { open, editingListing, closePanel } = useAddListing();
  const { kyc_status } = useAuth();
  const listing = editingListing;
  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [rentType, setRentType] = useState<RentType>("monthly");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState<PropertyType>("apartment");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [available, setAvailable] = useState(true);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isEditing = !!listing;
  const isVerified = kyc_status === "verified";

  useEffect(() => {
    if (open && listing) {
      setTitle(listing.title);
      setDescription(listing.description ?? "");
      setPrice(String(listing.price));
      setRentType(listing.rent_type);
      setLocation(listing.location);
      setArea(listing.area ?? "");
      setType(listing.type);
      setBedrooms(listing.bedrooms != null ? String(listing.bedrooms) : "");
      setBathrooms(listing.bathrooms != null ? String(listing.bathrooms) : "");
      setAvailable(listing.available);
      setImageItems(
        (listing.images ?? []).map((url) => ({
          id: nextImageId(),
          type: "url" as const,
          url,
          preview: url,
        })),
      );
    }
  }, [open, listing]);

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.type === "file" && item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const resetForm = () => {
    imageItems.forEach((item) => {
      if (item.type === "file" && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setTitle("");
    setDescription("");
    setPrice("");
    setRentType("monthly");
    setLocation("");
    setArea("");
    setType("apartment");
    setBedrooms("");
    setBathrooms("");
    setAvailable(true);
    setImageItems([]);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    closePanel();
  };

  const handleFileSelect = (files: FileList) => {
    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: nextImageId(),
      type: "file",
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageItems((prev) => [...prev, ...newItems]);
  };

  const removeImageItem = (id: string) => {
    setImageItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.type === "file" && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    setImageItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const uploadFile = async (file: File, userId: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok) throw new Error(json.error ?? "Upload failed");

    return json.url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }
    if (!location.trim()) {
      setError("Location is required");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setSubmitting(false);
      return;
    }

    const filesToUpload = imageItems.filter(
      (item) => item.type === "file" && item.file,
    );

    let finalUrls: string[] = [];

    try {
      const uploadedUrls = await Promise.all(
        filesToUpload.map((item) => uploadFile(item.file!, user.id)),
      );

      let urlIndex = 0;
      finalUrls = imageItems.map((item) => {
        if (item.type === "url" && item.url) return item.url;
        return uploadedUrls[urlIndex++];
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload images",
      );
      setSubmitting(false);
      return;
    }

    if (isEditing && listing) {
      const res = await fetch("/api/listings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listing.id,
          title: title.trim(),
          description: description.trim() || null,
          price: Number(price),
          rent_type: rentType,
          location: location.trim(),
          area: area.trim() || null,
          type,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          available,
          images: finalUrls,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to update listing");
        setSubmitting(false);
        return;
      }
    } else {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlord_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          price: Number(price),
          rent_type: rentType,
          location: location.trim(),
          area: area.trim() || null,
          type,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          available,
          images: finalUrls,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to add listing");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    resetForm();
    closePanel();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-surface shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-border shrink-0">
              <h2 className="text-lg font-semibold text-text-main">
                {isEditing ? "Edit Listing" : "Add Listing"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-elevated text-slate-400 dark:text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
            >
              {error && (
                <div className="rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <fieldset>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-text-main mb-1.5"
                >
                  Title <span className="text-red-500 dark:text-accent">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3-Bedroom Flat in Lekki"
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </fieldset>

              <fieldset>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-text-main mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the property..."
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                />
              </fieldset>

              <div className="grid grid-cols-3 gap-4">
                <fieldset>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Price (₦) <span className="text-red-500 dark:text-accent">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250000"
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </fieldset>

                <fieldset>
                  <label className="block text-sm font-medium text-text-main mb-1.5">
                    Period <span className="text-red-500 dark:text-accent">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setRentType("monthly")}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition ${
                        rentType === "monthly"
                          ? "bg-primary text-white"
                          : "bg-surface text-text-main hover:bg-slate-50 dark:hover:bg-surface-elevated"
                      }`}
                    >
                      /mo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentType("yearly")}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition ${
                        rentType === "yearly"
                          ? "bg-primary text-white"
                          : "bg-surface text-text-main hover:bg-slate-50 dark:hover:bg-surface-elevated"
                      }`}
                    >
                      /yr
                    </button>
                  </div>
                </fieldset>

                <fieldset>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Type <span className="text-red-500 dark:text-accent">*</span>
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  >
                    {propertyTypes.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>

              <fieldset>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-text-main mb-1.5"
                >
                  Location <span className="text-red-500 dark:text-accent">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </fieldset>

              <div className="grid grid-cols-3 gap-4">
                <fieldset>
                  <label
                    htmlFor="area"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Area
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 200sqm"
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </fieldset>

                <fieldset>
                  <label
                    htmlFor="bedrooms"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Bedrooms
                  </label>
                  <input
                    id="bedrooms"
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="3"
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </fieldset>

                <fieldset>
                  <label
                    htmlFor="bathrooms"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Bathrooms
                  </label>
                  <input
                    id="bathrooms"
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </fieldset>
              </div>

              <fieldset>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    disabled={!isVerified}
                    className="sr-only"
                  />
                  <div
                    className={`flex items-center shrink-0 w-10 h-6 rounded-full transition-colors ${
                      available ? "bg-primary" : "bg-slate-200 dark:bg-surface-elevated"
                    } ${!isVerified ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${
                        available ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-main">
                    Available for rent
                  </span>
                </label>
                {!isVerified && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    Verify your identity to make listings available.
                  </p>
                )}
              </fieldset>

              <fieldset>
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Images
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleFileSelect(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-border px-4 py-6 text-sm text-slate-400 dark:text-text-muted hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  Choose images
                </button>

                {imageItems.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-400 dark:text-text-muted">
                      Drag to reorder &middot; First image = cover photo
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imageItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`group relative w-[calc(33.33%-0.5rem)] aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            dragOverIndex === index
                              ? "border-primary border-dashed bg-emerald-50"
                              : "border-slate-200 dark:border-border"
                          }`}
                        >
                          <img
                            src={item.preview}
                            alt=""
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/40 to-transparent">
                            <GripVertical className="h-4 w-4 text-white drop-shadow" />
                            <button
                              type="button"
                              onClick={() => removeImageItem(item.id)}
                              className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>

              {!isVerified && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Your listing will be saved as unavailable until you verify your identity. <a href="/landlord/profile" className="underline font-medium">Verify now</a></span>
                </div>
              )}

              <div className="pt-2 pb-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {imageItems.some((i) => i.type === "file")
                        ? "Uploading images..."
                        : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {isEditing ? "Save Changes" : "Add Listing"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
