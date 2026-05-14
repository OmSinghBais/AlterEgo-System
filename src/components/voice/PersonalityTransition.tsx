"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  calm: { label: "CALM MODE", color: "from-blue-400 to-cyan-400" },
  assistant: { label: "ASSISTANT MODE", color: "from-green-400 to-emerald-400" },
  cinematic: { label: "CINEMATIC MODE", color: "from-cyan-400 to-blue-500" },
  serious: { label: "SERIOUS MODE", color: "from-slate-300 to-zinc-400" },
};

/**
 * Task 19: Personality transition effect.
 *
 * Shows a brief mode label when personality changes.
 */
export default function PersonalityTransition({
  mode,
  show,
  onDone,
}: {
  mode: string;
  show: boolean;
  onDone: () => void;
}) {
  const cfg = MODE_LABELS[mode] ?? { label: mode.toUpperCase(), color: "from-cyan-400 to-blue-400" };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={(def: { opacity?: number }) => {
            // Fire onDone after exit animation
            if (def.opacity === 0) onDone();
          }}
          className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center"
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.2 }}
          />

          {/* Mode label */}
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            className="relative z-10 text-center"
          >
            <p
              className={`font-orbitron text-2xl font-bold tracking-[0.3em] bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent md:text-4xl`}
            >
              {cfg.label}
            </p>
            <motion.div
              className={`mx-auto mt-3 h-px w-0 bg-gradient-to-r ${cfg.color}`}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
              className="font-space mt-2 text-xs uppercase tracking-[0.4em] text-white/40"
            >
              Active
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
