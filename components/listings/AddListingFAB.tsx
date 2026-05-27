"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAddListing } from "@/context/AddListingContext";

export function AddListingFAB() {
  const { openPanel } = useAddListing();
  const pathname = usePathname();

  const isMessages =
    pathname.startsWith("/landlord/messages") ||
    pathname.startsWith("/tenant/messages");

  if (isMessages) return null;

  return (
    <button
      type="button"
      onClick={openPanel}
      className="fixed bottom-20 right-5 z-40 md:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-emerald-800 active:scale-95 transition-all duration-150"
      aria-label="Add listing"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
