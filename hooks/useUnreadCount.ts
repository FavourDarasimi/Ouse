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
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = `unread-${userId}`;
    let mounted = true;

    async function init() {
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);

      if (!mounted) return;

      const convIds = new Set(conversations?.map((c) => c.id) ?? []);
      convIdsRef.current = convIds;

      const ch = supabase
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
      channelRef.current = ch;
    }

    init();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);

  return unreadCount;
}
