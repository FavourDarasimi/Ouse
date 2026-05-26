"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  User,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markMessagesAsRead } from "@/lib/actions/messages";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { getInitials } from "@/lib/utils/getInitials";
import { formatPrice } from "@/lib/utils/formatPrice";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ThreadItem, Message } from "@/types";

interface ChatShellProps {
  conversations: ThreadItem[];
  activeConversationId?: string | null;
  currentUserId: string;
  role: "tenant" | "landlord";
  messages?: Message[];
  otherParty?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  listing?: {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
  } | null;
}

export function ChatShell({
  conversations: initialConversations,
  activeConversationId,
  currentUserId,
  role,
  messages: initialMessages = [],
  otherParty,
  listing,
}: ChatShellProps) {
  const supabase = createClient();

  const [threads, setThreads] = useState(initialConversations);
  const [localMessages, setLocalMessages] =
    useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileInbox, setShowMobileInbox] = useState(!activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const convIdsRef = useRef(new Set(initialConversations.map((t) => t.id)));
  const activeConvIdRef = useRef(activeConversationId);
  activeConvIdRef.current = activeConversationId;

  useEffect(() => {
    if (!activeConversationId) return;
    markMessagesAsRead(activeConversationId, currentUserId);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeConversationId ? { ...t, unreadCount: 0 } : t,
      ),
    );
  }, [activeConversationId, currentUserId]);

  /* Real-time: new conversations + message updates across all threads */
  useEffect(() => {
    if (!currentUserId) return;
    const sb = createClient();
    const channel = sb
      .channel(`chat-threads:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        async (payload) => {
          const conv = payload.new as {
            id: string;
            listing_id: string;
            tenant_id: string;
            landlord_id: string;
          };
          if (
            conv.tenant_id !== currentUserId &&
            conv.landlord_id !== currentUserId
          )
            return;
          if (convIdsRef.current.has(conv.id)) return;
          convIdsRef.current.add(conv.id);

          const otherUserId =
            role === "tenant" ? conv.landlord_id : conv.tenant_id;
          const [listingRes, profileRes] = await Promise.all([
            sb
              .from("listings")
              .select("id, title, price, location, images")
              .eq("id", conv.listing_id)
              .single(),
            sb
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", otherUserId)
              .single(),
          ]);
          const listing = listingRes.data;
          const profile = profileRes.data;

          const newThread: ThreadItem = {
            id: conv.id,
            listingId: conv.listing_id,
            listingTitle: listing?.title ?? "Property",
            listingPrice: listing?.price ?? 0,
            listingLocation: listing?.location ?? "",
            listingImage: listing?.images?.[0] ?? null,
            otherUserId,
            otherUserName: profile?.full_name ?? null,
            otherUserAvatar: profile?.avatar_url ?? null,
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
          };
          setThreads((prev) => [newThread, ...prev]);
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
          const msg = payload.new as Message;
          if (!convIdsRef.current.has(msg.conversation_id)) return;

          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== msg.conversation_id) return t;
              return {
                ...t,
                lastMessage: msg.body,
                lastMessageTime: msg.created_at,
                unreadCount:
                  msg.sender_id === currentUserId ||
                  t.id === activeConvIdRef.current
                    ? t.unreadCount
                    : t.unreadCount + 1,
              };
            }),
          );
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [currentUserId, role]);

  /* Real-time: messages for active conversation */
  useEffect(() => {
    if (!activeConversationId) return;
    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === currentUserId) return;
          setLocalMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
          );
          markMessagesAsRead(activeConversationId!, currentUserId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, currentUserId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = useCallback(
    async (body: string) => {
      if (!activeConversationId) return;
      const tempId = crypto.randomUUID();
      const optimistic: Message = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: currentUserId,
        body,
        read: true,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, optimistic]);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeConversationId
            ? {
                ...t,
                lastMessage: body,
                lastMessageTime: optimistic.created_at,
              }
            : t,
        ),
      );
      const { data, error } = await sendMessage(activeConversationId, body);
      if (error) {
        setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      if (data) {
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data : m)),
        );
      }
    },
    [activeConversationId, currentUserId],
  );

  const inboxPath =
    role === "landlord" ? "/landlord/messages" : "/tenant/messages";

  const filteredThreads = threads.filter((t) =>
    t.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedMessages = localMessages.reduce<
    { date: string; messages: Message[] }[]
  >((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  const isOwnMessage = (msg: Message) => msg.sender_id === currentUserId;

  return (
    <div className="h-full w-full flex bg-white">
      {/* ── Inbox column ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`${
          activeConversationId
            ? "hidden lg:flex lg:w-80 xl:w-96"
            : "flex flex-1 lg:flex-none lg:w-80 xl:w-96"
        } flex-col border-r border-slate-100 bg-white ${
          showMobileInbox ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* Search */}
        <div className="shrink-0 border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-text-main">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                {searchQuery
                  ? "Try a different name"
                  : "When you start a conversation, it will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredThreads.map((thread) => {
                const isActive = thread.id === activeConversationId;
                const href =
                  role === "landlord"
                    ? `/landlord/messages/${thread.id}`
                    : `/tenant/messages/${thread.id}`;
                return (
                  <motion.div key={thread.id} layout>
                    <Link
                      href={href}
                      className={`flex items-start gap-3 w-full px-4 py-3.5 transition-colors duration-150  ${
                        isActive ? " bg-blue-50/60" : " hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {getInitials(thread.otherUserName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-text-main truncate">
                            {thread.otherUserName ??
                              (role === "landlord" ? "Tenant" : "Landlord")}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {thread.unreadCount > 0 && (
                              <span className="min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold px-1">
                                {thread.unreadCount > 99
                                  ? "99+"
                                  : thread.unreadCount}
                              </span>
                            )}
                            {thread.lastMessageTime && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {formatRelativeTime(thread.lastMessageTime)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-0.5 text-xs text-primary font-medium truncate">
                          {thread.listingTitle}
                        </p>
                        {thread.lastMessage && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            {thread.lastMessage}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Conversation column ── */}
      <AnimatePresence mode="wait">
        {activeConversationId ? (
          <motion.div
            key={activeConversationId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`flex-1 flex flex-col min-w-0 bg-slate-50 ${
              !showMobileInbox ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Chat header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={inboxPath}
                  className="lg:hidden shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-text-main transition-colors"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {getInitials(otherParty?.full_name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-main truncate">
                    {otherParty?.full_name ??
                      (role === "landlord" ? "Tenant" : "Landlord")}
                  </h3>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
            </div>

            {/* Property context bar */}
            <div className="shrink-0 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium shrink-0 overflow-hidden">
                {listing?.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing?.title ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "No img"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-main truncate">
                  {listing?.title ?? "Property"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {listing
                    ? `${formatPrice(listing.price)} · ${listing.location}`
                    : ""}
                </p>
              </div>
              {listing && (
                <a
                  href={`/listings/${listing.id}`}
                  className="shrink-0 text-xs font-medium text-primary hover:text-blue-700 transition-colors"
                >
                  View listing
                </a>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {localMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">
                    No messages yet. Send a message to start the conversation.
                  </p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date}>
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        {group.date}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {group.messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            layout
                          >
                            <MessageBubble
                              body={msg.body}
                              createdAt={msg.created_at}
                              isOwn={isOwnMessage(msg)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <ChatInput onSend={handleSend} />
          </motion.div>
        ) : (
          <motion.div
            key="empty-conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex flex-1 flex-col items-center justify-center bg-slate-50"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-1">
              Your messages
            </h3>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              Select a conversation from the left to start chatting.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
