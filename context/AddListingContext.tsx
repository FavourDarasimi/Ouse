"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Listing } from "@/types";

interface AddListingContextType {
  open: boolean;
  editingListing: Listing | null;
  setOpen: (open: boolean) => void;
  setEditingListing: (listing: Listing | null) => void;
}

const AddListingContext = createContext<AddListingContextType>({
  open: false,
  editingListing: null,
  setOpen: () => {},
  setEditingListing: () => {},
});

export function AddListingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  return (
    <AddListingContext.Provider
      value={{ open, editingListing, setOpen, setEditingListing }}
    >
      {children}
    </AddListingContext.Provider>
  );
}

export function useAddListing() {
  const ctx = useContext(AddListingContext);
  const openPanel = useCallback(() => {
    ctx.setEditingListing(null);
    ctx.setOpen(true);
  }, [ctx]);
  const closePanel = useCallback(() => {
    ctx.setEditingListing(null);
    ctx.setOpen(false);
  }, [ctx]);
  const openForEdit = useCallback(
    (listing: Listing) => {
      ctx.setEditingListing(listing);
      ctx.setOpen(true);
    },
    [ctx],
  );
  return {
    open: ctx.open,
    editingListing: ctx.editingListing,
    setOpen: ctx.setOpen,
    openPanel,
    closePanel,
    openForEdit,
  };
}
