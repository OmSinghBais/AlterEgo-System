"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@/types/app";
import MarkdownRenderer from "./MarkdownRenderer";

function relativeTime(timestamp: number): string {
  if (timestamp <= 1) return "";
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  streamContent?: React.ReactNode;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = relativeTime(message.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400"
            : "bg-gradient-to-br from-blue-500/15 to-indigo-600/15 text-blue-400"
        }`}
      >
        {isUser ? (
          <User className="size-4" />
        ) : (
          <Bot className="size-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`relative max-w-[85%] px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? "rounded-2xl rounded-tr-sm border border-cyan-400/20 bg-gradient-to-br from-cyan-600/20 to-blue-700/10 text-white shadow-[0_4px_20px_rgba(6,182,212,0.1)]"
            : "rounded-2xl rounded-tl-sm border border-white/[0.04] bg-white/[0.02] text-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
        )}

        {/* Timestamp */}
        {time && (
          <p
            className={`mt-2 text-[9px] font-medium uppercase tracking-wider opacity-30 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {time}
          </p>
        )}
      </div>
    </motion.div>
  );
}
