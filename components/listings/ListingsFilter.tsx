"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, RotateCcw, SlidersHorizontal, Check } from "lucide-react";
import type { Listing, PropertyType, RentType } from "@/types";

interface Filters {
  search: string;
  types: PropertyType[];
  priceMin: string;
  priceMax: string;
  bedrooms: number | null;
  bathrooms: number | null;
  rentType: RentType | null;
  availableOnly: boolean;
}

interface ListingsFilterProps {
  listings: Listing[];
  children: (result: {
    filtered: Listing[];
    hasActiveFilters: boolean;
    clearAll: () => void;
    totalCount: number;
  }) => React.ReactNode;
}

const propertyTypes: PropertyType[] = [
  "house",
  "apartment",
  "room",
  "duplex",
  "flat",
];

const bedroomOptions = [1, 2, 3, 4];
const bathroomOptions = [1, 2, 3];

const defaultFilters: Filters = {
  search: "",
  types: [],
  priceMin: "",
  priceMax: "",
  bedrooms: null,
  bathrooms: null,
  rentType: null,
  availableOnly: false,
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

function ActiveFilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterOptions({
  draft,
  onChange,
  onClear,
}: {
  draft: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  const set = (key: keyof Filters, value: unknown) =>
    onChange({ ...draft, [key]: value });

  const toggleType = (t: PropertyType) =>
    onChange({
      ...draft,
      types: draft.types.includes(t)
        ? draft.types.filter((x) => x !== t)
        : [...draft.types, t],
    });

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search location, area..."
          value={draft.search}
          onChange={(e) => set("search", e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        {draft.search && (
          <button
            onClick={() => set("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-main"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
          Property Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          {propertyTypes.map((t) => (
            <FilterChip
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              active={draft.types.includes(t)}
              onClick={() => toggleType(t)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
          Price Range
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              ₦
            </span>
            <input
              type="number"
              placeholder="Min"
              value={draft.priceMin}
              onChange={(e) => set("priceMin", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-slate-300 text-sm">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              ₦
            </span>
            <input
              type="number"
              placeholder="Max"
              value={draft.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
          Bedrooms
        </p>
        <div className="flex gap-1.5">
          <FilterChip
            label="Any"
            active={draft.bedrooms === null}
            onClick={() => set("bedrooms", null)}
          />
          {bedroomOptions.map((n) => (
            <FilterChip
              key={n}
              label={n === 4 ? "4+" : String(n)}
              active={draft.bedrooms === n}
              onClick={() => set("bedrooms", n)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
          Bathrooms
        </p>
        <div className="flex gap-1.5">
          <FilterChip
            label="Any"
            active={draft.bathrooms === null}
            onClick={() => set("bathrooms", null)}
          />
          {bathroomOptions.map((n) => (
            <FilterChip
              key={n}
              label={n === 3 ? "3+" : String(n)}
              active={draft.bathrooms === n}
              onClick={() => set("bathrooms", n)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
          Rent Type
        </p>
        <div className="flex gap-1.5">
          <FilterChip
            label="Any"
            active={draft.rentType === null}
            onClick={() => set("rentType", null)}
          />
          <FilterChip
            label="Monthly"
            active={draft.rentType === "monthly"}
            onClick={() =>
              set("rentType", draft.rentType === "monthly" ? null : "monthly")
            }
          />
          <FilterChip
            label="Yearly"
            active={draft.rentType === "yearly"}
            onClick={() =>
              set("rentType", draft.rentType === "yearly" ? null : "yearly")
            }
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => set("availableOnly", !draft.availableOnly)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            draft.availableOnly
              ? "bg-primary border-primary"
              : "border-slate-300 bg-white"
          }`}
        >
          {draft.availableOnly && (
            <svg
              viewBox="0 0 12 12"
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 6L5 8.5L9.5 3.5" />
            </svg>
          )}
        </div>
        <span className="text-sm text-text-main">Available only</span>
      </label>

      <button
        onClick={onClear}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Clear all filters
      </button>
    </div>
  );
}

export function ListingsFilter({ listings, children }: ListingsFilterProps) {
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        open &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        const panel = document.getElementById("filter-panel");
        if (panel && !panel.contains(e.target as Node)) {
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const q = applied.search.toLowerCase().trim();
      if (q) {
        const match =
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.area ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }

      if (applied.types.length > 0 && !applied.types.includes(l.type))
        return false;

      if (applied.priceMin && l.price < Number(applied.priceMin)) return false;
      if (applied.priceMax && l.price > Number(applied.priceMax)) return false;

      if (applied.bedrooms !== null) {
        const beds = l.bedrooms ?? 0;
        if (applied.bedrooms === 4) {
          if (beds < 4) return false;
        } else if (beds !== applied.bedrooms) {
          return false;
        }
      }

      if (applied.bathrooms !== null) {
        const baths = l.bathrooms ?? 0;
        if (applied.bathrooms === 3) {
          if (baths < 3) return false;
        } else if (baths !== applied.bathrooms) {
          return false;
        }
      }

      if (applied.rentType && l.rent_type !== applied.rentType) return false;
      if (applied.availableOnly && !l.available) return false;

      return true;
    });
  }, [listings, applied]);

  const hasActiveFilters = useMemo(() => {
    return (
      applied.search !== "" ||
      applied.types.length > 0 ||
      applied.priceMin !== "" ||
      applied.priceMax !== "" ||
      applied.bedrooms !== null ||
      applied.bathrooms !== null ||
      applied.rentType !== null ||
      applied.availableOnly
    );
  }, [applied]);

  const openPanel = () => {
    setDraft({ ...applied });
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  const applyFilters = () => {
    setApplied({ ...draft });
    setOpen(false);
  };

  const clearAll = () => {
    setApplied(defaultFilters);
    setDraft(defaultFilters);
  };

  const clearDraft = () => setDraft(defaultFilters);

  const removeFilter = (key: keyof Filters, value?: unknown) => {
    if (key === "types" && typeof value === "string") {
      setApplied((f) => ({
        ...f,
        types: f.types.filter((t) => t !== value),
      }));
    } else if (key === "priceMin" && value === "") {
      setApplied((f) => ({ ...f, priceMin: "", priceMax: "" }));
    } else if (key === "priceMax" && value === "") {
      setApplied((f) => ({ ...f, priceMin: "", priceMax: "" }));
    } else {
      setApplied((f) => ({ ...f, [key]: value }));
    }
  };

  const activeFilterBadges = useMemo(() => {
    const badges: { key: string; label: string; onRemove: () => void }[] = [];

    if (applied.search) {
      badges.push({
        key: "search",
        label: `"${applied.search}"`,
        onRemove: () => removeFilter("search", ""),
      });
    }

    applied.types.forEach((t) => {
      badges.push({
        key: `type-${t}`,
        label: t.charAt(0).toUpperCase() + t.slice(1),
        onRemove: () => removeFilter("types", t),
      });
    });

    if (applied.priceMin || applied.priceMax) {
      const min = applied.priceMin || "0";
      const max = applied.priceMax || "∞";
      badges.push({
        key: "price",
        label: `₦${min} — ₦${max}`,
        onRemove: () => removeFilter("priceMin", ""),
      });
    }

    if (applied.bedrooms !== null) {
      const label =
        applied.bedrooms === 4 ? "4+ Beds" : `${applied.bedrooms} Bed`;
      badges.push({
        key: "bedrooms",
        label,
        onRemove: () => removeFilter("bedrooms", null),
      });
    }

    if (applied.bathrooms !== null) {
      const label =
        applied.bathrooms === 3 ? "3+ Baths" : `${applied.bathrooms} Bath`;
      badges.push({
        key: "bathrooms",
        label,
        onRemove: () => removeFilter("bathrooms", null),
      });
    }

    if (applied.rentType) {
      badges.push({
        key: "rentType",
        label: applied.rentType === "monthly" ? "Monthly" : "Yearly",
        onRemove: () => removeFilter("rentType", null),
      });
    }

    if (applied.availableOnly) {
      badges.push({
        key: "available",
        label: "Available",
        onRemove: () => removeFilter("availableOnly", false),
      });
    }

    return badges;
  }, [applied]);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            Explore Properties
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {filtered.length} of {listings.length} properties found
          </p>
        </div>

        <div className="relative" ref={btnRef}>
          <button
            onClick={openPanel}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              hasActiveFilters
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-main border-slate-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-0.5">
                {activeFilterBadges.length}
              </span>
            )}
          </button>

          {/* Desktop dropdown popover */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="desktop-filter"
                id="filter-panel"
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-100 bg-white shadow-lg z-30"
              >
                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  <FilterOptions
                    draft={draft}
                    onChange={setDraft}
                    onClear={clearDraft}
                  />
                </div>
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={applyFilters}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
                  >
                    <Check className="h-4 w-4" />
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {activeFilterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeFilterBadges.map((badge) => (
            <ActiveFilterBadge
              key={badge.key}
              label={badge.label}
              onRemove={badge.onRemove}
            />
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-primary transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile full-screen bottom sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20"
              onClick={closePanel}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                <h3 className="text-sm font-semibold text-text-main">
                  Filters
                </h3>
                <button
                  onClick={closePanel}
                  className="p-1 text-slate-500 hover:text-text-main transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterOptions
                  draft={draft}
                  onChange={setDraft}
                  onClear={clearDraft}
                />
              </div>
              <div className="p-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={applyFilters}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
                >
                  <Check className="h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children({
        filtered,
        hasActiveFilters,
        clearAll,
        totalCount: listings.length,
      })}
    </div>
  );
}
