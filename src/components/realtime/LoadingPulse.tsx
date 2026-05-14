"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoadingPulse({
  label = "Thinking",
  rotatePhases,
}: {
  label?: string;
  /** Cycles for a richer “thinking” feel (psychological latency). */
  rotatePhases?: string[];
}) {
  const phases = rotatePhases?.length ? rotatePhases : null;
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (!phases) return;
    setPhaseIdx(0);
    const id = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % phases.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [phases]);

  const display = phases ? (phases[phaseIdx] ?? label) : label;

  return (
    <div className="flex items-center gap-3 text-sm text-white/60">
      <motion.div className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      <span className="tracking-wide">{display}</span>
    </div>
  );
}
