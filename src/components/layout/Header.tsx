"use client";

import { Menu, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import Clock from "@/components/dashboard/Clock";

export default function Header() {
  const setUiState = useAppStore((s) => s.setUiState);
  const chatPanelOpen = useAppStore((s) => s.uiState.chatPanelOpen);

  return (
    <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between border-b border-white/[0.04] bg-[#060a0e]/40 px-4 py-3 backdrop-blur-xl md:px-6">
      {/* Mobile hamburger */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setUiState({ sidebarOpen: true })}
        className="flex size-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.04] hover:text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </motion.button>

      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="font-orbitron text-sm font-semibold tracking-wide text-white/70 max-md:hidden">
          ALTEREGO
        </span>
        <span className="hidden text-xs text-white/20 md:inline">·</span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/50 md:inline">
          Neural Shell
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Clock />

        {/* Chat toggle — mobile/tablet */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setUiState({ chatPanelOpen: !chatPanelOpen })}
          className="flex size-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.04] hover:text-cyan-300 lg:hidden"
          aria-label="Toggle chat"
        >
          <MessageSquare className="size-5" />
        </motion.button>
      </div>
    </header>
  );
}
