"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ChatState {
  conversationId: string | null;
  isOpen: boolean;
  otherPersonName: string;
  otherPersonAvatar: string | null;
  otherPersonInitials: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyLocation: string;
  listingId: string;
  userId: string;
  role: "tenant" | "landlord";
}

interface ChatContextValue {
  state: ChatState;
  openChat: (conversationId: string) => Promise<void>;
  closeChat: () => void;
  expandChat: () => void;
  toggleChat: () => void;
}

const defaultState: ChatState = {
  conversationId: null,
  isOpen: false,
  otherPersonName: "",
  otherPersonAvatar: null,
  otherPersonInitials: "",
  propertyTitle: "",
  propertyPrice: 0,
  propertyLocation: "",
  listingId: "",
  userId: "",
  role: "tenant",
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(defaultState);
  const router = useRouter();

  const openChat = useCallback(async (conversationId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: conv } = await supabase
      .from("conversations")
      .select("id, listing_id, tenant_id, landlord_id, listings(title, price, location, images)")
      .eq("id", conversationId)
      .single();

    if (!conv) return;

    const rawListing = conv.listings as unknown as {
      title: string;
      price: number;
      location: string;
      images: string[];
    } | null;

    const isLandlord = conv.landlord_id === user.id;
    const otherUserId = isLandlord ? conv.tenant_id : conv.landlord_id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", otherUserId)
      .single();

    const fullName = profile?.full_name ?? "";
    const avatarUrl = profile?.avatar_url ?? null;
    const initials = fullName
      ? fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : isLandlord
        ? "T"
        : "L";

    setState({
      conversationId: conv.id,
      isOpen: true,
      otherPersonName: fullName,
      otherPersonAvatar: avatarUrl,
      otherPersonInitials: initials,
      propertyTitle: rawListing?.title ?? "",
      propertyPrice: rawListing?.price ?? 0,
      propertyLocation: rawListing?.location ?? "",
      listingId: conv.listing_id,
      userId: user.id,
      role: isLandlord ? "landlord" : "tenant",
    });
  }, []);

  const closeChat = useCallback(() => {
    setState(defaultState);
  }, []);

  const expandChat = useCallback(() => {
    const path =
      state.role === "landlord"
        ? `/landlord/messages/${state.conversationId}`
        : `/tenant/messages/${state.conversationId}`;
    setState(defaultState);
    router.push(path);
  }, [state.role, state.conversationId, router]);

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  return (
    <ChatContext.Provider
      value={{ state, openChat, closeChat, expandChat, toggleChat }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
