"use client";

import { useState, useEffect } from "react";

export function useViewMode(storageKey: string) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved === "grid" || saved === "list") setView(saved);
  }, [storageKey]);

  const onChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem(storageKey, newView);
  };

  return { view: mounted ? view : "grid", onChange };
}
