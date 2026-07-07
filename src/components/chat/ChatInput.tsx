"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { pickMockReply } from "@/lib/mockAi";

export default function ChatInput() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const orbMode = useAppStore((s) => s.orbState.mode);
  const realtimeStatus = useAppStore((s) => s.realtimeStatus);

  const busy =
    orbMode === "thinking" ||
    orbMode === "speaking" ||
    realtimeStatus === "streaming" ||
    realtimeStatus === "connecting";

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setText("");
    await sendMessage(trimmed);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
      <div className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 backdrop-blur-3xl transition-all duration-500 focus-within:border-cyan-500/40 focus-within:bg-cyan-500/[0.03] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={busy ? "Thinking..." : "Message AlterEgo..."}
          disabled={busy}
          className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 focus:outline-none disabled:opacity-50"
        />
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || busy}
          whileTap={{ scale: 0.95 }}
          className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-20 disabled:grayscale"
        >
          <Send className="size-4" />
        </motion.button>
      </div>
    </div>
  );
}
