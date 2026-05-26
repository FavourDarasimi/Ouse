"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useUnreadCount(
  userId: string | undefined,
  initialCount = 0
): number {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const convIdsRef = useRef<Set<string>>(new Set());
  const channelNameRef = useRef(
    userId ? `unread-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : ""
  );

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = channelNameRef.current || `unread-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let channel: RealtimeChannel | null = null;
    let mounted = true;

    async function init() {
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);

      if (!mounted) return;

      const convIds = new Set(conversations?.map((c) => c.id) ?? []);
      convIdsRef.current = convIds;

      if (convIds.size === 0) return;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
          },
          (payload) => {
            const conv = payload.new as {
              id: string;
              tenant_id: string;
              landlord_id: string;
            };
            if (conv.tenant_id === userId || conv.landlord_id === userId) {
              convIdsRef.current.add(conv.id);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const msg = payload.new as {
              conversation_id: string;
              sender_id: string;
            };
            if (
              convIdsRef.current.has(msg.conversation_id) &&
              msg.sender_id !== userId
            ) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: "read=eq.true",
          },
          (payload) => {
            const old = payload.old as { read: boolean };
            const msg = payload.new as {
              conversation_id: string;
              sender_id: string;
            };
            if (
              old.read === false &&
              convIdsRef.current.has(msg.conversation_id) &&
              msg.sender_id !== userId
            ) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    }

    init();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return unreadCount;
}
