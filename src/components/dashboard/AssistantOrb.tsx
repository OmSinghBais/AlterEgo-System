"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useMemo, useState, useEffect } from "react";

export default function AssistantOrb() {
  const mode = useAppStore((s) => s.orbState.mode);
  const energy = useAppStore((s) => s.orbState.energy);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Colors mapped to modes
  const colors = useMemo(() => {
    switch (mode) {
      case "listening": return { primary: "#22d3ee", secondary: "#0891b2", glow: "rgba(34, 211, 238, 0.5)" };
      case "thinking": return { primary: "#a855f7", secondary: "#7e22ce", glow: "rgba(168, 85, 247, 0.5)" };
      case "speaking": return { primary: "#ffffff", secondary: "#e4e4e7", glow: "rgba(255, 255, 255, 0.5)" };
      case "error": return { primary: "#f87171", secondary: "#b91c1c", glow: "rgba(248, 113, 113, 0.5)" };
      case "sleeping": return { primary: "#475569", secondary: "#1e293b", glow: "rgba(71, 85, 105, 0.3)" };
      default: return { primary: "#3b82f6", secondary: "#1d4ed8", glow: "rgba(59, 130, 246, 0.5)" };
    }
  }, [mode]);

  if (!mounted) return <div className="size-[400px]" />;

  return (
    <div className="relative flex items-center justify-center size-[400px]">
      {/* Background Glow (Aura) */}
      <motion.div
        animate={{
          scale: [1, 1.1 + energy * 0.2, 1],
          opacity: [0.2, 0.4 + energy * 0.3, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-[100px]"
        style={{ backgroundColor: colors.glow }}
      />

      {/* Outer Rotating Rings */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border border-white/5 rounded-full"
            style={{ margin: i * 20 }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: mode === "thinking" ? [1, 1.02, 1] : 1,
            }}
            transition={{
              rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        className="relative size-64 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* The Liquid Core */}
        <motion.div
          animate={{
            scale: mode === "speaking" ? [1, 1.1, 1] : [1, 1.05, 1],
          }}
          transition={{
            duration: mode === "speaking" ? 0.8 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative size-48 rounded-full overflow-hidden shadow-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.primary}, ${colors.secondary}, #000)`,
            boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 0 60px ${colors.glow}`,
          }}
        >
          {/* Internal Reflections */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <motion.div 
            animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 left-8 size-24 bg-white/20 blur-2xl rounded-full" 
          />
        </motion.div>

        {/* Thinking / Listening Rings */}
        <AnimatePresence>
          {mode === "thinking" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-[-20px] rounded-full border-2 border-dashed border-purple-500/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          )}
          {mode === "listening" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-[-40px] rounded-full border border-cyan-400/30"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Floating Particles Around Orb */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-1 rounded-full bg-white/40"
              initial={{ 
                x: Math.cos((i / 12) * Math.PI * 2) * 140,
                y: Math.sin((i / 12) * Math.PI * 2) * 140,
                opacity: 0.2
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
                x: Math.cos((i / 12) * Math.PI * 2) * (140 + energy * 20),
                y: Math.sin((i / 12) * Math.PI * 2) * (140 + energy * 20),
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Label Overlay */}
      <div className="absolute -bottom-12 flex flex-col items-center gap-1">
        <motion.span 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-mono"
        >
          Cognitive Presence
        </motion.span>
        <span className="text-[14px] font-bold tracking-widest text-white/90 uppercase">
          {mode}
        </span>
      </div>
    </div>
  );
}
