"use client";

import { useRef, useEffect, useState } from "react";
import { useAssistantStore } from "@/store/useAssistantStore";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow() {
  const { conversations, activeConversationId, isThinking, isStreaming } = useAssistantStore();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const conversation = conversations.find(c => c.id === activeConversationId);
  const messages = conversation?.messages || [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, isStreaming, shouldAutoScroll]);

  return (
    <div 
      className="h-full overflow-y-auto p-4 flex flex-col gap-8 custom-scrollbar" 
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="flex-1" />
      
      <AnimatePresence initial={false}>
        {messages.length === 0 && !isThinking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 opacity-20 text-center"
          >
            <div className="size-16 rounded-full border border-dashed border-white/20 mb-6 animate-[spin_20s_linear_infinity]" />
            <p className="text-[10px] uppercase tracking-[0.5em] font-bold">Neural Link Active</p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"} 
          />
        ))}

        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-4 shrink-0" />
    </div>
  );
}
