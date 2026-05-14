"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { OrbMode } from "@/types/app";

const PARTICLE_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

const coreByMode: Record<OrbMode, string> = {
  idle: "bg-gradient-to-br from-blue-600 via-blue-800 to-slate-950",
  listening: "bg-gradient-to-br from-cyan-400 via-teal-600 to-slate-900",
  thinking: "bg-gradient-to-br from-purple-500 via-violet-800 to-black",
  speaking: "bg-gradient-to-br from-white via-zinc-200 to-zinc-500",
  error: "bg-gradient-to-br from-red-600 via-red-800 to-black",
  sleeping: "bg-gradient-to-br from-slate-700 via-indigo-950 to-black",
};

const ringByMode: Record<OrbMode, string> = {
  idle: "ring-blue-400/40",
  listening: "ring-cyan-300/50",
  thinking: "ring-purple-400/50",
  speaking: "ring-white/60",
  error: "ring-red-500/70",
  sleeping: "ring-slate-600/40",
};

const haloByMode: Record<OrbMode, string> = {
  idle: "from-blue-600/80 via-blue-900/40 to-transparent",
  listening: "from-cyan-400/70 via-teal-800/30 to-transparent",
  thinking: "from-purple-500/70 via-violet-950/40 to-transparent",
  speaking: "from-white/50 via-zinc-300/30 to-transparent",
  error: "from-red-600/80 via-red-950/50 to-transparent",
  sleeping: "from-slate-600/40 via-indigo-950/30 to-transparent",
};

const rimByMode: Record<OrbMode, string> = {
  idle: "border-blue-500/35 shadow-[0_0_36px_rgba(59,130,246,0.35)]",
  listening: "border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.35)]",
  thinking: "border-purple-500/35 shadow-[0_0_38px_rgba(168,85,247,0.35)]",
  speaking: "border-white/30 shadow-[0_0_48px_rgba(255,255,255,0.25)]",
  error: "border-red-500/50 shadow-[0_0_44px_rgba(239,68,68,0.45)]",
  sleeping: "border-slate-600/30 shadow-[0_0_24px_rgba(71,85,105,0.25)]",
};

export default function VoiceOrb() {
  const mode = useAppStore((s) => s.orbState.mode);
  const energy = useAppStore((s) => s.orbState.energy);
  const listening = useAppStore((s) => s.voiceState.isListening);
  const setOrbState = useAppStore((s) => s.setOrbState);
  const startFakeVoiceCycle = useAppStore((s) => s.startFakeVoiceCycle);
  // The orb's energy is driven externally:
  // - When listening: useOrbAudioReactive hook updates energy via mic FFT.
  // - When speaking: useVoiceWebSocket updates energy via TTS playback FFT.
  // - Other states have base energy values set in store.

  const activeListen = listening || mode === "listening";
  const speaking = mode === "speaking";
  const thinking = mode === "thinking";
  const isError = mode === "error";
  const sleeping = mode === "sleeping";

  const pulse =
    speaking || isError
      ? [1, 1.22, 1]
      : activeListen
        ? [1, 1.14 + energy * 0.08, 1]
        : thinking
          ? [1, 1.1, 1]
          : sleeping
            ? [1, 1.03, 1]
            : [1, 1.06 + energy * 0.05, 1];

  return (
    <motion.button
      type="button"
      onClick={() => startFakeVoiceCycle()}
      aria-label="Activate voice interface"
      whileHover={{ scale: sleeping ? 1.02 : 1.04, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className="relative z-[2] flex size-[220px] cursor-pointer items-center justify-center rounded-full outline-none"
    >
      <motion.div
        animate={{ rotate: sleeping ? 180 : 360 }}
        transition={{
          duration: sleeping ? 48 : 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`pointer-events-none absolute h-52 w-52 rounded-full border ${rimByMode[mode]}`}
      />

      <motion.span
        className="pointer-events-none absolute inset-[6px] block rounded-full border border-white/10"
        animate={{ rotateZ: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="pointer-events-none absolute inset-[18px] block rounded-full border border-dashed border-white/10"
        animate={{ rotateZ: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="pointer-events-none absolute inset-[28px] block rounded-full border border-white/5"
        animate={{ rotateZ: 360 }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
      >
        {PARTICLE_ANGLES.map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 block size-1.5 rounded-full opacity-80 shadow-lg"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-102px)`,
              backgroundColor:
                mode === "error"
                  ? "#f87171"
                  : mode === "speaking"
                    ? "#e4e4e7"
                    : mode === "thinking"
                      ? "#c084fc"
                      : mode === "listening"
                        ? "#22d3ee"
                        : mode === "sleeping"
                          ? "#64748b"
                          : "#60a5fa",
            }}
          />
        ))}
      </motion.div>

      {(activeListen || speaking) && !sleeping && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute inset-10 rounded-full border border-white/20"
              initial={{ scale: 0.85, opacity: 0.55 }}
              animate={{
                scale: [0.85, 1.35, 0.85],
                opacity: [0.45, 0, 0.45],
              }}
              transition={{
                duration: 2.2 + i * 0.35,
                repeat: Infinity,
                delay: i * 0.45,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      {thinking && (
        <motion.div
          className="pointer-events-none absolute inset-4 rounded-full border border-purple-400/40"
          animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {(speaking || isError) && (
        <motion.div
          className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t blur-2xl ${
            isError
              ? "from-red-600/60 via-transparent to-red-400/20"
              : "from-white/40 via-transparent to-zinc-400/20"
          }`}
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: isError ? 0.55 : 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        animate={{ scale: pulse }}
        transition={{
          duration: speaking || isError ? 0.85 : 1.35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`pointer-events-none absolute inset-8 rounded-full bg-gradient-to-br blur-3xl ${haloByMode[mode]}`}
        style={{ opacity: 0.4 + energy * 0.45 }}
      />

      <motion.div
        className={`relative z-[1] flex size-[132px] shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-black/90 ${ringByMode[mode]} ${coreByMode[mode]}`}
        animate={{
          boxShadow:
            mode === "speaking"
              ? "0 0 100px rgba(255,255,255,0.35), inset 0 0 40px rgba(255,255,255,0.12)"
              : mode === "listening"
                ? "0 0 78px rgba(34,211,238,0.45), inset 0 0 32px rgba(204,251,241,0.15)"
                : mode === "thinking"
                  ? "0 0 64px rgba(168,85,247,0.45), inset 0 0 28px rgba(0,0,0,0.55)"
                  : mode === "error"
                    ? "0 0 90px rgba(239,68,68,0.65), inset 0 0 28px rgba(0,0,0,0.5)"
                    : mode === "sleeping"
                      ? "0 0 40px rgba(51,65,85,0.35), inset 0 0 24px rgba(0,0,0,0.65)"
                      : "0 0 52px rgba(59,130,246,0.35), inset 0 0 28px rgba(0,0,0,0.55)",
        }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`relative size-[76px] rounded-full backdrop-blur-md ${
            mode === "speaking"
              ? "bg-gradient-to-br from-white/70 via-zinc-100/40 to-transparent"
              : mode === "idle"
                ? "bg-gradient-to-br from-blue-200/30 via-blue-400/15 to-transparent"
                : "bg-gradient-to-br from-white/40 via-white/10 to-transparent"
          } shadow-[inset_0_-8px_24px_rgba(0,0,0,0.45)]`}
        >
          <span className="absolute inset-x-4 top-3 h-[28%] rounded-full bg-white/35 blur-[2px]" />
        </div>
      </motion.div>
    </motion.button>
  );
}
