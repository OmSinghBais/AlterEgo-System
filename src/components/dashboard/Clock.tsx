"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

type Props = {
  className?: string;
};

/** Live updating clock — futuristic HUD readout. */
export default function Clock({ className }: Props) {
  /** Avoid hydration mismatch: server and first client paint share the same tree. */
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={className}
      data-live="clock"
    >
      <p className="font-space text-[10px] font-medium uppercase tracking-[0.4em] text-cyan-400/60">
        Local time
      </p>
      <p className="font-orbitron mt-2 min-h-[2.25rem] text-3xl tabular-nums tracking-wide text-white/80 drop-shadow-[0_0_24px_rgba(56,189,248,0.25)]">
        {now ? formatTime(now) : "––:––:––"}
      </p>
    </div>
  );
}
