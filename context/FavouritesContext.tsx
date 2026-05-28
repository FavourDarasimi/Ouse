"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Favourite } from "@/types";

interface FavouritesContextValue {
  favourites: Favourite[];
  isFavourited: (listingId: string) => boolean;
  toggleFavourite: (listingId: string) => Promise<void>;
  loading: boolean;
}

const FavouritesContext = createContext<FavouritesContextValue>({
  favourites: [],
  isFavourited: () => false,
  toggleFavourite: async () => {},
  loading: false,
});

export function FavouritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stable client reference — never recreated across renders
  const supabase = useMemo(() => createClient(), []);
  const { user, role } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    if (!user) return;
    if (role && role !== "tenant") {
      setLoading(false);
      return;
    }
    if (role !== "tenant") return;
    setLoading(true);
    const { data } = await supabase
      .from("favourites")
      .select("*, listings(*)")
      .eq("tenant_id", user.id);
    setFavourites((data as Favourite[]) ?? []);
    setLoading(false);
  }, [user, role, supabase]);

  useEffect(() => {
    let isMounted = true;
    fetchFavourites().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [fetchFavourites]);

  const isFavourited = (listingId: string) =>
    favourites.some((f) => f.listing_id === listingId);

  const toggleFavourite = async (listingId: string) => {
    if (!user) return;

    if (isFavourited(listingId)) {
      // Optimistic remove
      setFavourites((prev) => prev.filter((f) => f.listing_id !== listingId));
      await supabase
        .from("favourites")
        .delete()
        .eq("tenant_id", user.id)
        .eq("listing_id", listingId);
    } else {
      // Optimistic add — refetch to get full row with listing join
      await supabase
        .from("favourites")
        .insert({ tenant_id: user.id, listing_id: listingId });
      fetchFavourites();
    }
  };

  return (
    <FavouritesContext.Provider
      value={{ favourites, isFavourited, toggleFavourite, loading }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
