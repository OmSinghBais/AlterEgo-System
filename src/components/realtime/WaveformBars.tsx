"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function WaveformBars() {
  const listening = useAppStore((s) => s.voiceState.isListening);
  const level = useAppStore((s) => s.voiceState.inputLevel);

  const heights = [0.35, 0.55, 0.75, 1, 0.85, 0.6, 0.45];

  return (
    <div className="flex h-10 items-end gap-1">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-cyan-950 via-cyan-800 to-cyan-400"
          animate={{
            height: listening ? `${20 + level * 80 * h}px` : "6px",
            opacity: listening ? 0.95 : 0.25,
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
          }}
        />
      ))}
    </div>
  );
}
