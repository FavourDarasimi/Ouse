"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface AddListingContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddListingContext = createContext<AddListingContextType>({
  open: false,
  setOpen: () => {},
});

export function AddListingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AddListingContext.Provider value={{ open, setOpen }}>
      {children}
    </AddListingContext.Provider>
  );
}

export function useAddListing() {
  const ctx = useContext(AddListingContext);
  const openPanel = useCallback(() => ctx.setOpen(true), [ctx]);
  const closePanel = useCallback(() => ctx.setOpen(false), [ctx]);
  return { open: ctx.open, setOpen: ctx.setOpen, openPanel, closePanel };
}
