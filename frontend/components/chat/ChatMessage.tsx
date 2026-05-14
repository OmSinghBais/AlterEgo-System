"use client";

import { motion } from "framer-motion";
import { Message } from "@/store/useAssistantStore";
import MarkdownRenderer from "./MarkdownRenderer";
import { User, Cpu, Clock } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        isUser 
          ? "border-blue-500/20 bg-blue-500/10 text-blue-400" 
          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
      }`}>
        {isUser ? <User size={16} /> : <Cpu size={16} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
            {isUser ? "Operator" : "AlterEgo"}
          </span>
          <span className="text-[8px] opacity-20">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser 
            ? "bg-blue-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(37,99,235,0.15)]" 
            : "bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/5 shadow-xl"
        }`}>
          <MarkdownRenderer content={message.content} />
          
          {isStreaming && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 align-middle"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
