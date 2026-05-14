"use client";

import { motion } from "framer-motion";
import type { LiveStatus } from "@/types/app";

const LABELS: Record<LiveStatus, string> = {
  idle: "Idle",
  connecting: "Connecting…",
  streaming: "Live stream",
  ready: "Online",
  error: "Offline",
};

export default function StatusIndicator({ status }: { status: LiveStatus }) {
  const live = status === "streaming" || status === "ready";

  return (
    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/60">
      <motion.span
        className="relative flex h-2 w-2"
        animate={{ scale: live ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 1.6, repeat: live ? Infinity : 0 }}
      >
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status === "error"
              ? "bg-red-500"
              : status === "connecting"
                ? "bg-amber-500"
                : live
                  ? "bg-cyan-400"
                  : "bg-white/25"
          }`}
        />
        {live ? (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        ) : null}
      </motion.span>
      <span>{LABELS[status]}</span>
    </div>
  );
}
