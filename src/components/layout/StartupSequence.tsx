"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "Initializing neural interface...", delay: 0 },
  { text: "Loading Whisper STT engine...", delay: 600 },
  { text: "Voice synthesis online...", delay: 1200 },
  { text: "Memory systems active...", delay: 1800 },
  { text: "Personality core loaded...", delay: 2200 },
  { text: "WebSocket bridge ready...", delay: 2600 },
  { text: "AlterEGO ready.", delay: 3200 },
];

const TOTAL_DURATION = 4200; // ms before fade-out

interface StartupSequenceProps {
  onComplete: () => void;
}

export default function StartupSequence({ onComplete }: StartupSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay)
      );
    });

    // Start fade
    timers.push(
      setTimeout(() => {
        setFading(true);
      }, TOTAL_DURATION)
    );

    // Complete
    timers.push(
      setTimeout(() => {
        onComplete();
      }, TOTAL_DURATION + 800)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050a0e]"
        >
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(14,116,144,0.08) 0%, transparent 60%)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-orbitron text-4xl font-bold tracking-tight text-white md:text-5xl">
              ALTER
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                EGO
              </span>
            </h1>
            <p className="font-space mt-2 text-center text-xs uppercase tracking-[0.4em] text-cyan-400/50">
              Neural Interface
            </p>
          </motion.div>

          {/* Boot lines */}
          <div className="flex w-full max-w-md flex-col gap-2 px-6">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => {
              const isLast = i === visibleLines - 1;
              const isReady = line.text === "AlterEGO ready.";

              return (
                <motion.div
                  key={line.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {/* Status dot */}
                  <motion.span
                    className={`size-1.5 shrink-0 rounded-full ${
                      isReady
                        ? "bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                        : isLast
                          ? "bg-cyan-400/70"
                          : "bg-white/20"
                    }`}
                    animate={
                      isLast && !isReady
                        ? { opacity: [0.4, 1, 0.4] }
                        : {}
                    }
                    transition={
                      isLast && !isReady
                        ? { duration: 0.8, repeat: Infinity }
                        : {}
                    }
                  />

                  {/* Text */}
                  <span
                    className={`font-mono text-xs ${
                      isReady
                        ? "font-semibold text-cyan-300"
                        : isLast
                          ? "text-white/70"
                          : "text-white/30"
                    }`}
                  >
                    {line.text}
                  </span>

                  {/* Blinking cursor on last line */}
                  {isLast && !isReady && (
                    <motion.span
                      className="ml-1 inline-block h-3 w-[2px] bg-cyan-400/70"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-10 h-px w-full max-w-md overflow-hidden rounded-full bg-white/[0.06] px-6">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500/60 to-blue-500/60"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: TOTAL_DURATION / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
