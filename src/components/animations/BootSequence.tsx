"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Shield, Cpu, Zap } from "lucide-react";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const stages = [
    { icon: Terminal, text: "Initializing Neural Core...", delay: 800 },
    { icon: Shield, text: "Securing Encrypted Tunnel...", delay: 1200 },
    { icon: Cpu, text: "Allocating Memory Buffers...", delay: 600 },
    { icon: Zap, text: "Bypassing Mainframe Locks...", delay: 1000 },
    { icon: Sparkles, text: "System Online.", delay: 500 },
  ];

  useEffect(() => {
    let current = 0;
    const run = async () => {
      for (const s of stages) {
        setStage(current);
        setLogs(prev => [...prev, `[SYS] ${s.text}`]);
        await new Promise(r => setTimeout(r, s.delay));
        current++;
      }
      setTimeout(onComplete, 1000);
    };
    run();
  }, []);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050a0e] font-mono"
    >
      <div className="relative mb-12 flex size-32 items-center justify-center">
        {/* Pulsing rings */}
        {[1, 1.5, 2].map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: s, opacity: [0, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className="absolute inset-0 rounded-full border border-cyan-500/30"
          />
        ))}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="z-10 flex size-20 items-center justify-center rounded-2xl bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.15),inset_0_0_20px_rgba(6,182,212,0.1)]"
          >
            {(() => {
              const Icon = stages[stage]?.icon || Sparkles;
              return <Icon className="size-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]" />;
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm px-6">
        <div className="mb-4 flex items-center justify-between text-[10px] tracking-[0.2em] text-cyan-400/60">
          <span>ALTEREGO_OS_v4.1</span>
          <span>BOOT_SEQ_00{stage}</span>
        </div>
        
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${(stage / (stages.length - 1)) * 100}%` }}
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
        </div>

        <div className="mt-8 h-24 overflow-hidden rounded-lg border border-white/5 bg-black/20 p-3">
          <div className="flex flex-col gap-1">
            {logs.slice(-3).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[9px] leading-relaxed text-white/40"
              >
                <span className="text-cyan-500/50 mr-2">{">"}</span>
                {log}
              </motion.div>
            ))}
            <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="mt-1 size-1.5 rounded-full bg-cyan-400/50"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 text-center">
        <p className="text-[8px] uppercase tracking-[0.4em] text-white/20">
          Neural Interface Hardware: Detected
        </p>
      </div>
    </motion.div>
  );
}
