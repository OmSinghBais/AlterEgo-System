"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlowPulseProps {
  children: ReactNode;
  className?: string;
  /** CSS color for the glow shadow */
  color?: string;
  /** Max glow spread in px */
  intensity?: number;
  /** Full pulse cycle in seconds */
  duration?: number;
}

export default function GlowPulse({
  children,
  className,
  color = "rgba(56, 189, 248, 0.4)",
  intensity = 40,
  duration = 2.5,
}: GlowPulseProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 ${intensity * 0.3}px ${color}`,
          `0 0 ${intensity}px ${color}`,
          `0 0 ${intensity * 0.3}px ${color}`,
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
