"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { getInitials } from "@/lib/utils/getInitials";

interface ConversationListItemProps {
  conversationId: string;
  tenantName: string | null;
  listingTitle: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unread: boolean;
}

export function ConversationListItem({
  conversationId,
  tenantName,
  listingTitle,
  lastMessage,
  lastMessageTime,
  unread,
}: ConversationListItemProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/landlord/messages/${conversationId}`}
        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-surface p-3 transition-colors hover:border-primary/30"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {getInitials(tenantName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-text-main">
              {tenantName ?? "Tenant"}
            </h4>
            <div className="flex shrink-0 items-center gap-1.5">
              {unread && (
                <span className="h-2 w-2 rounded-full bg-accent" />
              )}
              {lastMessageTime && lastMessage && (
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(lastMessageTime)}
                </span>
              )}
            </div>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            Re: {listingTitle}
          </p>
          {lastMessage && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
              {lastMessage}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
