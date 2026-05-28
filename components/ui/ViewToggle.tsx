"use client";

import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Listing view"
      className="flex border border-slate-200 rounded-xl overflow-hidden bg-white"
    >
      <button
        type="button"
        aria-label="Switch to grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-150 ${
          view === "grid"
            ? "bg-slate-100 text-primary"
            : "bg-white text-slate-400 hover:text-slate-600"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Switch to list view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-150 ${
          view === "list"
            ? "bg-slate-100 text-primary"
            : "bg-white text-slate-400 hover:text-slate-600"
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
