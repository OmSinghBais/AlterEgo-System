"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-1"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-600/15">
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block size-[5px] rounded-full bg-cyan-400/70"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-xs text-white/30">AlterEgo is thinking…</span>
    </motion.div>
  );
}
