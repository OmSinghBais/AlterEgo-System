"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900 rounded-xl w-fit border border-white/5">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        className="size-1.5 rounded-full bg-zinc-400"
      />
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        className="size-1.5 rounded-full bg-zinc-400"
      />
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        className="size-1.5 rounded-full bg-zinc-400"
      />
      <span className="ml-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
        Thinking
      </span>
    </div>
  );
}
