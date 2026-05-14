"use client";

import { motion } from "framer-motion";

const RING_COUNT = 6;
const PARTICLE_COUNT = 14;

/** Pure CSS + Framer Motion hero orb — the soul of the landing page. */
export default function HeroOrb() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outermost ambient glow */}
      <motion.div
        className="absolute size-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(14,116,144,0.06) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Concentric rings — each with independent rotation */}
      {Array.from({ length: RING_COUNT }).map((_, i) => {
        const size = 320 - i * 38;
        const duration = 18 + i * 8;
        const direction = i % 2 === 0 ? 360 : -360;
        const borderOpacity = 0.08 + (RING_COUNT - i) * 0.03;
        const isDashed = i % 3 === 1;

        return (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: `1px ${isDashed ? "dashed" : "solid"} rgba(148, 210, 243, ${borderOpacity})`,
            }}
            animate={{ rotate: direction }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}

      {/* Particle sparks orbiting */}
      <motion.div
        className="pointer-events-none absolute size-[300px]"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const angle = (360 / PARTICLE_COUNT) * i;
          const radius = 130 + (i % 3) * 12;
          const particleSize = 1.5 + (i % 4) * 0.5;
          const colors = ["#38bdf8", "#22d3ee", "#a5f3fc", "#0ea5e9", "#67e8f9"];
          const color = colors[i % colors.length];

          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 block rounded-full"
              style={{
                width: particleSize,
                height: particleSize,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </motion.div>

      {/* Inner glow halo — breathing */}
      <motion.div
        className="pointer-events-none absolute size-[200px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(14,116,144,0.1) 50%, transparent 70%)",
          filter: "blur(24px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary breathing layer */}
      <motion.div
        className="pointer-events-none absolute size-[160px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 60%)",
          filter: "blur(16px)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Core sphere */}
      <motion.div
        className="relative z-10 flex size-[140px] items-center justify-center rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(186,230,253,0.3), rgba(56,189,248,0.15) 40%, rgba(14,116,144,0.3) 70%, rgba(8,47,73,0.5))",
          boxShadow:
            "0 0 60px rgba(56,189,248,0.3), 0 0 120px rgba(14,116,144,0.15), inset 0 0 40px rgba(56,189,248,0.1)",
        }}
        animate={{
          scale: [1, 1.04, 1],
          boxShadow: [
            "0 0 60px rgba(56,189,248,0.3), 0 0 120px rgba(14,116,144,0.15), inset 0 0 40px rgba(56,189,248,0.1)",
            "0 0 80px rgba(56,189,248,0.45), 0 0 160px rgba(14,116,144,0.25), inset 0 0 50px rgba(56,189,248,0.15)",
            "0 0 60px rgba(56,189,248,0.3), 0 0 120px rgba(14,116,144,0.15), inset 0 0 40px rgba(56,189,248,0.1)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)",
          }}
        />
        {/* Inner glass core */}
        <div className="relative size-[72px] rounded-full bg-gradient-to-br from-white/20 via-cyan-200/10 to-transparent shadow-[inset_0_-8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
          <span className="absolute inset-x-4 top-3 h-[28%] rounded-full bg-white/30 blur-[2px]" />
        </div>
      </motion.div>

      {/* Ripple rings — pulse outward */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={`ripple-${i}`}
          className="pointer-events-none absolute rounded-full border border-cyan-400/15"
          style={{ width: 160 + i * 30, height: 160 + i * 30 }}
          animate={{
            scale: [0.9, 1.4, 0.9],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
