"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function SystemMetrics() {
  const [latency, setLatency] = useState(38);
  const [mem, setMem] = useState(52);
  const [neural, setNeural] = useState(78);
  const pulseOrbError = useAppStore((s) => s.pulseOrbError);
  const setOrbMode = useAppStore((s) => s.setOrbMode);
  const realtimeStatus = useAppStore((s) => s.realtimeStatus);
  const orbMode = useAppStore((s) => s.orbState.mode);
  const inputLevel = useAppStore((s) => s.voiceState.inputLevel);

  const statusLine =
    realtimeStatus === "streaming"
      ? "STREAMING"
      : realtimeStatus === "connecting"
        ? "SYNTHESIS"
        : realtimeStatus === "error"
          ? "DEGRADED"
          : "ONLINE";

  const statusClass =
    realtimeStatus === "error"
      ? "text-red-400"
      : realtimeStatus === "streaming" || realtimeStatus === "connecting"
        ? "text-amber-300"
        : "text-emerald-400";

  const voiceLine =
    orbMode === "listening" || orbMode === "speaking"
      ? "ACTIVE"
      : orbMode === "sleeping"
        ? "STANDBY"
        : "ARMED";

  useEffect(() => {
    const id = window.setInterval(() => {
      setLatency((n) =>
        Math.max(18, Math.min(96, Math.round(n + (Math.random() - 0.5) * 8)))
      );
      setMem((n) =>
        Math.min(92, Math.max(34, Math.round(n + (Math.random() - 0.5) * 4)))
      );
      setNeural((n) =>
        Math.min(99, Math.max(40, Math.round(n + (Math.random() - 0.5) * 6)))
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-subtle rounded-2xl p-5"
    >
      <p className="font-space text-[10px] font-medium uppercase tracking-[0.35em] text-cyan-400/60">
        Neural telemetry
      </p>
      <div className="mt-4 grid gap-3 font-mono text-xs text-white/70">
        <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-2">
          <span className="text-white/35">AI latency</span>
          <span className="text-cyan-400/80">{latency} ms</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-2">
          <span className="text-white/35">Memory usage</span>
          <span className="text-cyan-300/70">{mem}%</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-2">
          <span className="text-white/35">Realtime status</span>
          <span className={statusClass}>{statusLine}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-2">
          <span className="text-white/35">Neural activity</span>
          <span className="text-blue-400/70">{neural}%</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-2">
          <span className="text-white/35">Voice activity</span>
          <span className="text-cyan-300/70">
            {voiceLine} · {Math.round(inputLevel * 100)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/35">Core state</span>
          <span className="text-white/60">{orbMode.toUpperCase()}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pulseOrbError()}
          className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-[10px] uppercase tracking-wider text-red-300/70 transition hover:bg-red-900/30"
        >
          Simulate fault
        </button>
        <button
          type="button"
          onClick={() => setOrbMode("sleeping")}
          className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40 transition hover:bg-white/[0.06]"
        >
          Sleep core
        </button>
      </div>
    </motion.div>
  );
}
