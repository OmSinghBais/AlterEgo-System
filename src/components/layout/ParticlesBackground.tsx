"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function rnd(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Lightweight floating specks (Framer Motion).
 * Renders only after mount so SSR HTML matches the client (avoids FM style serialization mismatches).
 */
export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const n = 42;

  if (!mounted) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-cyan-400/25 shadow-[0_0_6px_rgba(56,189,248,0.3)]"
          style={{
            width: `${1 + rnd(i, 1) * 2}px`,
            height: `${1 + rnd(i, 2) * 2}px`,
            left: `${rnd(i, 3) * 100}%`,
            top: `${rnd(i, 4) * 100}%`,
          }}
          animate={{
            y: [0, -18 - rnd(i, 5) * 24, 0],
            x: [0, (rnd(i, 6) - 0.5) * 14, 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: 8 + rnd(i, 7) * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: rnd(i, 8) * 6,
          }}
        />
      ))}
    </div>
  );
}
