"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen cinematic overlay that plays when wake word is detected.
 * Shows glowing text + orb pulse before redirecting to dashboard.
 */
export default function WakeWordOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050a0e]"
        >
          {/* Ambient glow burst */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.15) 0%, rgba(14,116,144,0.08) 30%, transparent 60%)",
            }}
          />

          {/* Pulsing orb */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 0.8],
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-10 flex size-32 items-center justify-center"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Core sphere */}
            <motion.div
              className="relative z-10 size-20 rounded-full bg-gradient-to-br from-cyan-400/40 via-cyan-500/20 to-blue-600/30"
              style={{
                boxShadow:
                  "0 0 60px rgba(56,189,248,0.5), 0 0 120px rgba(14,116,144,0.3), inset 0 0 30px rgba(56,189,248,0.2)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 60px rgba(56,189,248,0.5), 0 0 120px rgba(14,116,144,0.3), inset 0 0 30px rgba(56,189,248,0.2)",
                  "0 0 100px rgba(56,189,248,0.7), 0 0 180px rgba(14,116,144,0.4), inset 0 0 50px rgba(56,189,248,0.3)",
                  "0 0 60px rgba(56,189,248,0.5), 0 0 120px rgba(14,116,144,0.3), inset 0 0 30px rgba(56,189,248,0.2)",
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-x-3 top-2 h-[30%] rounded-full bg-white/30 blur-[2px]" />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-orbitron text-3xl font-bold tracking-widest text-white md:text-5xl"
          >
            ALTER
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              EGO
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="font-space mt-4 text-sm uppercase tracking-[0.5em] text-cyan-400/70"
          >
            Online
          </motion.p>

          {/* Status line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-8 font-mono text-xs text-white/30"
          >
            Initializing neural interface...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
