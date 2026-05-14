"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BreathingGlowProps {
  children: ReactNode;
  className?: string;
  /** CSS color for glow */
  color?: string;
  duration?: number;
}

export default function BreathingGlow({
  children,
  className,
  color = "rgba(56, 189, 248, 0.25)",
  duration = 3,
}: BreathingGlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}, inset 0 0 20px ${color.replace(/[\d.]+\)$/, "0.05)")}`,
          `0 0 50px ${color}, inset 0 0 40px ${color.replace(/[\d.]+\)$/, "0.1)")}`,
          `0 0 20px ${color}, inset 0 0 20px ${color.replace(/[\d.]+\)$/, "0.05)")}`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
