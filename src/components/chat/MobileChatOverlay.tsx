"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import StreamingText from "@/components/realtime/StreamingText";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import { useAppStore } from "@/store/useAppStore";

/** Slide-up chat overlay for mobile / tablet viewports. */
export default function MobileChatOverlay() {
  const chatPanelOpen = useAppStore((s) => s.uiState.chatPanelOpen);
  const setUiState = useAppStore((s) => s.setUiState);
  const messages = useAppStore((s) => s.chatMessages);
  const status = useAppStore((s) => s.realtimeStatus);
  const orbMode = useAppStore((s) => s.orbState.mode);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status, orbMode]);

  const showTyping =
    (status === "connecting" || orbMode === "thinking") &&
    orbMode !== "speaking";

  return (
    <AnimatePresence>
      {chatPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUiState({ chatPanelOpen: false })}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-white/[0.06] bg-[#060a0e]/95 backdrop-blur-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <span className="font-space text-sm font-semibold text-white">
                Chat
              </span>
              <button
                type="button"
                onClick={() => setUiState({ chatPanelOpen: false })}
                className="flex size-8 items-center justify-center rounded-lg text-white/50 transition hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              {messages.map((m, idx) => {
                const isLast = idx === messages.length - 1;
                const streaming =
                  status === "streaming" &&
                  m.role === "assistant" &&
                  isLast &&
                  m.content.length > 0;

                return (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isStreaming={Boolean(streaming)}
                    streamContent={
                      streaming ||
                      (m.role === "assistant" && m.content.length > 0) ? (
                        <StreamingText
                          content={m.content}
                          isStreaming={Boolean(streaming)}
                        />
                      ) : undefined
                    }
                  />
                );
              })}

              <AnimatePresence>
                {showTyping && <TypingIndicator />}
              </AnimatePresence>

              <div ref={bottomRef} aria-hidden className="h-px shrink-0" />
            </div>

            {/* Input */}
            <ChatInput />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
