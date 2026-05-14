"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingPanelProps {
  children: ReactNode;
  className?: string;
  /** Y-axis float distance in px */
  amplitude?: number;
  /** Full cycle duration in seconds */
  duration?: number;
  delay?: number;
}

export default function FloatingPanel({
  children,
  className,
  amplitude = 8,
  duration = 4,
  delay = 0,
}: FloatingPanelProps) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
