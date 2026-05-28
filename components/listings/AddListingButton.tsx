"use client";

import { Plus } from "lucide-react";
import { useAddListing } from "@/context/AddListingContext";

export function AddListingButton() {
  const { openPanel } = useAddListing();

  return (
    <button
      type="button"
      onClick={openPanel}
      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
    >
      <Plus className="h-4 w-4" />
      Add Listing
    </button>
  );
}
