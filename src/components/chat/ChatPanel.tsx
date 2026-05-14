"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import StatusIndicator from "@/components/realtime/StatusIndicator";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import { useAppStore } from "@/store/useAppStore";
import type { OrbMode } from "@/types/app";

const ORB_STATUS: Record<OrbMode, string> = {
  idle: "Core Online",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Streaming...",
  error: "Neural Error",
  sleeping: "Hibernating",
};

export default function ChatPanel() {
  const messages = useAppStore((s) => s.chatMessages);
  const status = useAppStore((s) => s.realtimeStatus);
  const orbMode = useAppStore((s) => s.orbState.mode);
  const chatPanelOpen = useAppStore((s) => s.uiState.chatPanelOpen);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // User is considered scrolled up if they are more than 100px from the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    isUserScrolledUp.current = !isNearBottom;
  };

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, status, orbMode]);

  const showTyping =
    (status === "connecting" || orbMode === "thinking") &&
    orbMode !== "speaking";

  if (!chatPanelOpen) return null;

  return (
    <div className="hidden w-full max-w-[500px] flex-col border-l border-white/[0.06] bg-[#060a0e]/85 shadow-[inset_1px_0_0_rgba(56,189,248,0.04)] backdrop-blur-3xl lg:flex">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-space text-lg font-semibold tracking-tight text-white">
            Chat
          </h2>
          <StatusIndicator status={status} />
        </div>
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-400/60">
          <span>Core · {ORB_STATUS[orbMode]}</span>
          <span className="text-white/20">orb:{orbMode}</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 scroll-smooth"
      >
        {messages.map((m, idx) => {
          const isLast = idx === messages.length - 1;
          const streaming =
            status === "streaming" &&
            m.role === "assistant" &&
            isLast &&
            m.content.length > 0;

          return (
            <ChatMessage
              key={m.id}
              message={m}
              isStreaming={Boolean(streaming)}
            />
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {showTyping && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} aria-hidden className="h-px shrink-0" />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
