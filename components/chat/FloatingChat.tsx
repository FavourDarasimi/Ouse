"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { getMessages, sendMessage } from "@/lib/actions/messages";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";
import { Send, ExternalLink, Minus, X, Building2 } from "lucide-react";

export function FloatingChat() {
  const { state, closeChat, expandChat } = useChat();
  const {
    conversationId,
    isOpen,
    otherPersonName,
    otherPersonAvatar,
    otherPersonInitials,
    propertyTitle,
    propertyPrice,
    listingId,
    userId,
    role,
  } = state;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [minimised, setMinimised] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValueRef = useRef(inputValue);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    getMessages(conversationId).then((res) => {
      if (!isMounted) return;
      if (res.data) setMessages(res.data);

      channel = supabase
        .channel(`floating:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.sender_id === userId) return;
            setMessages((prev) =>
              prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
            );
          },
        )
        .subscribe();
    });

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, userId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const body = inputValueRef.current.trim();
    if (!body || !conversationId) return;
    const tempId = crypto.randomUUID();
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: userId,
      body,
      read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");
    const { data, error } = await sendMessage(conversationId, body);
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }
    if (data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    }
  }, [conversationId, userId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-[88px] lg:bottom-6 inset-x-0 sm:inset-x-auto sm:right-6 z-[60] w-full sm:w-80 flex-col bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-100 dark:border-border overflow-hidden flex"
          style={{ maxHeight: "min(480px, 75vh)" }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 bg-secondary flex items-center justify-between px-3 py-2.5 cursor-pointer"
            onClick={() => setMinimised((v) => !v)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
                {otherPersonAvatar ? (
                  <img src={otherPersonAvatar} alt={otherPersonName} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  otherPersonInitials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {otherPersonName ||
                    (role === "landlord" ? "Tenant" : "Landlord")}
                </p>
                <p className="text-xs text-slate-400 dark:text-text-muted truncate">
                  {propertyTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  expandChat();
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
                aria-label="Expand chat"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimised((v) => !v);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
                aria-label="Minimise"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeChat();
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!minimised && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col overflow-hidden"
              >
                {/* ── Property context bar ── */}
                <div className="shrink-0 bg-surface border-b border-slate-100 dark:border-border px-3 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-slate-400 dark:text-text-muted shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-main truncate">
                      {propertyTitle || "Property"}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {propertyPrice > 0
                        ? `₦${propertyPrice.toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  {listingId && (
                    <a
                      href={`/listings/${listingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-primary hover:text-emerald-800 transition-colors"
                    >
                      View
                    </a>
                  )}
                </div>

                {/* ── Messages area ── */}
                <div
                  className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-slate-50 dark:bg-surface-elevated"
                  style={{ maxHeight: "320px" }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <p className="text-xs text-slate-400 dark:text-text-muted">
                        No messages yet. Send a message to start the
                        conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div className="max-w-[85%]">
                            <div
                              className={`text-xs px-3 py-2 ${
                                isOwn
                                  ? "bg-primary text-white rounded-2xl rounded-tr-sm"
                                  : "bg-surface text-text-main border border-slate-100 dark:border-border rounded-2xl rounded-tl-sm"
                              }`}
                            >
                              {msg.body}
                            </div>
                            <p
                              className={`text-[10px] mt-0.5 ${
                                isOwn ? "text-right" : "text-left"
                              } text-slate-400 dark:text-text-muted`}
                            >
                              {formatRelativeTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Input bar ── */}
                <div className="shrink-0 bg-surface border-t border-slate-100 dark:border-border px-3 py-2.5 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 dark:bg-surface-elevated border border-slate-200 dark:border-border rounded-xl px-3 py-2 text-xs text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400 dark:placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 text-white hover:bg-emerald-800 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
