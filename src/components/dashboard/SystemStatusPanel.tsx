"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Cpu, HardDrive, Wifi } from "lucide-react";
import Clock from "@/components/dashboard/Clock";
import StatusIndicator from "@/components/realtime/StatusIndicator";
import { useAppStore } from "@/store/useAppStore";

export default function SystemStatusPanel() {
  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState(44);
  const status = useAppStore((s) => s.realtimeStatus);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu((c) =>
        Math.min(96, Math.max(4, c + (Math.random() - 0.5) * 8))
      );
      setMem((m) =>
        Math.min(92, Math.max(28, m + (Math.random() - 0.5) * 5))
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-subtle w-full max-w-md rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
        <Clock />
        <div className="flex flex-col items-end gap-2">
          <StatusIndicator status={status} />
          <div className="flex items-center gap-2 text-xs text-cyan-300/80">
            <Brain className="size-3.5" />
            <span className="tracking-wide">AI core online</span>
            <motion.span
              className="size-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              animate={{ opacity: [1, 0.35, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/30">
        UTC-local bridge · simulated telemetry
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <Cpu className="size-4 text-cyan-500/70" />
            CPU load
          </div>
          <p className="mt-3 font-mono text-2xl text-white/90">{cpu.toFixed(1)}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-900 to-cyan-500"
              animate={{ width: `${cpu}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <HardDrive className="size-4 text-cyan-500/70" />
            Memory
          </div>
          <p className="mt-3 font-mono text-2xl text-white/90">{mem.toFixed(0)}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-900 to-blue-500"
              animate={{ width: `${mem}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-white/35">
        <span className="flex items-center gap-2">
          <Wifi className="size-3.5 text-cyan-500/50" />
          Uplink · standby
        </span>
        <span className="flex items-center gap-2">
          <Activity className="size-3.5 text-cyan-500/50" />
          Pulse sync · active
        </span>
      </div>
    </motion.div>
  );
}
