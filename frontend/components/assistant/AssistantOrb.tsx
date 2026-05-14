"use client";

import { motion } from "framer-motion";
import { useAssistantStore } from "@/store/useAssistantStore";

export default function AssistantOrb() {
  const { isRecording, isThinking, isSpeaking, isStreaming } = useAssistantStore();

  const getStatus = () => {
    if (isRecording) return "listening";
    if (isThinking || isStreaming) return "thinking";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  const variants = {
    idle: {
      scale: [1, 1.02, 1],
      opacity: 0.4,
      filter: "blur(12px)",
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    listening: {
      scale: [1, 1.2, 1.1, 1.25, 1],
      opacity: 1,
      filter: "blur(4px)",
      boxShadow: "0 0 50px rgba(6, 182, 212, 0.4)",
      transition: { duration: 1, repeat: Infinity }
    },
    thinking: {
      rotate: 360,
      scale: 1.1,
      opacity: 0.9,
      filter: "blur(2px)",
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    speaking: {
      scale: [1, 1.1, 0.95, 1.15, 1],
      opacity: 1,
      filter: "blur(6px)",
      boxShadow: "0 0 60px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.6, repeat: Infinity }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-12 group">
      {/* Background Aura */}
      <motion.div
        animate={{ 
          scale: [1, 1.4, 1], 
          opacity: isRecording || isSpeaking ? [0.2, 0.5, 0.2] : [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-[80px] transition-colors duration-1000 ${
          isRecording ? "bg-cyan-500/30" : isSpeaking ? "bg-blue-600/30" : "bg-white/5"
        }`}
      />

      {/* The Orb Body */}
      <motion.div
        variants={variants}
        animate={getStatus()}
        className={`relative z-20 size-32 rounded-full flex items-center justify-center transition-all duration-700 ${
          isRecording 
            ? "bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-[0_0_40px_rgba(6,182,212,0.6)]" 
            : isThinking || isStreaming
              ? "bg-gradient-to-tr from-purple-600 to-fuchsia-400"
              : isSpeaking
                ? "bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_0_50px_rgba(37,99,235,0.4)]"
                : "bg-zinc-800 border border-white/5 shadow-inner"
        }`}
      >
        {/* Internal Core */}
        <div className="absolute inset-2 rounded-full bg-black/60 backdrop-blur-md overflow-hidden">
          {/* Internal Pulse */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"
          />
        </div>

        {/* Dynamic Status Rings */}
        {(isThinking || isStreaming) && (
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-white/10 rounded-full"
          />
        )}
      </motion.div>

      {/* Status Label */}
      <motion.div 
        animate={{ opacity: isRecording || isThinking || isSpeaking ? 1 : 0.2 }}
        className="mt-6 flex flex-col items-center gap-1"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/40">
          {getStatus() === "idle" ? "Passive Mode" : `Neural ${getStatus()}`}
        </span>
        <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
    </div>
  );
}
