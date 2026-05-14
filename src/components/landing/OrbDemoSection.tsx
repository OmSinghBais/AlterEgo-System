"use client";

import { motion } from "framer-motion";
import VoiceOrb from "@/components/voice/VoiceOrb";
import WaveformBars from "@/components/realtime/WaveformBars";
import StatusIndicator from "@/components/realtime/StatusIndicator";
import TypingText from "@/components/realtime/TypingText";
import { useOrbAudioReactive } from "@/hooks/useOrbAudioReactive";
import { useAppStore } from "@/store/useAppStore";

export default function OrbDemoSection() {
  useOrbAudioReactive();
  const status = useAppStore((s) => s.realtimeStatus);

  return (
    <section id="orb-demo" className="relative px-6 py-32 md:px-12">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85 }}
        >
          <p className="font-space text-xs font-medium uppercase tracking-[0.35em] text-cyan-400/70">
            Interactive Orb
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Tap the orb — experience the voice cycle.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/45">
            Idle → listening → thinking → streamed reply → idle. The full
            neural pipeline visualized as light and motion.
          </p>

          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            <p className="font-space text-xs uppercase tracking-[0.25em] text-white/30">
              Live subtitle lane
            </p>
            <p className="mt-4 font-mono text-sm leading-relaxed text-cyan-100/80">
              <TypingText
                key="landing-subtitle"
                text="Listening shapes light — streaming shapes trust."
                msPerChar={22}
              />
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-cyan-500/10 bg-white/[0.02] p-10 shadow-[0_0_100px_rgba(14,116,144,0.08)] backdrop-blur-2xl"
        >
          <div className="absolute top-8 left-8">
            <StatusIndicator status={status} />
          </div>
          <VoiceOrb />
          <div className="mt-12 w-full max-w-xs">
            <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-white/30">
              Voice energy
            </p>
            <div className="flex justify-center">
              <WaveformBars />
            </div>
          </div>
          <p className="mt-10 max-w-sm text-center text-xs text-white/35">
            One tap runs listen → think → speak. Grant mic for real analyser;
            otherwise levels are simulated.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
