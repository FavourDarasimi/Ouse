"use client";

import { formatRelativeTime } from "@/lib/utils/formatDate";

interface MessageBubbleProps {
  body: string;
  createdAt: string;
  isOwn: boolean;
}

export function MessageBubble({ body, createdAt, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs sm:max-w-sm">
        <div
          className={`text-sm px-4 py-2.5 ${
            isOwn
              ? "bg-primary text-white rounded-2xl rounded-tr-sm"
              : "bg-surface text-text-main border border-slate-100 rounded-2xl rounded-tl-sm"
          }`}
        >
          {body}
        </div>
        <p
          className={`text-[10px] mt-1 ${
            isOwn ? "text-right" : "text-left"
          } text-slate-400`}
        >
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
