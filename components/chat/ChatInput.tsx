"use client";

import { useState, useRef } from "react";
import { Paperclip, Smile, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-slate-100 bg-surface px-4 py-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50"
        />
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="shrink-0 rounded-xl bg-primary p-2.5 text-white hover:bg-emerald-800 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
