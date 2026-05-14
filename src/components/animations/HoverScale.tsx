"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  /** Scale factor on hover */
  scale?: number;
  /** Brightness multiplier on hover */
  brightness?: number;
}

export default function HoverScale({
  children,
  className,
  scale = 1.04,
  brightness = 1.08,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{
        scale,
        filter: `brightness(${brightness})`,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
