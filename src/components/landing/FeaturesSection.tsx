"use client";

import { motion } from "framer-motion";
import { Sparkles, Waves, Orbit, Layers } from "lucide-react";
import { HoverScale } from "@/components/animations";

const items = [
  {
    icon: Sparkles,
    title: "Glass & Depth",
    copy: "Blur stacks read as physical distance — foreground crisp, horizon soft. Every layer exists in dimensional space.",
    glow: "rgba(56, 189, 248, 0.15)",
  },
  {
    icon: Waves,
    title: "Synced Motion",
    copy: "Orb pulse, waveform, and subtitles share timing so responses feel composed — not computed.",
    glow: "rgba(34, 211, 238, 0.15)",
  },
  {
    icon: Orbit,
    title: "3D Neural Field",
    copy: "Particles, grids, and neural lines sell infinite space behind the interface. Reality is rendered.",
    glow: "rgba(14, 165, 233, 0.15)",
  },
  {
    icon: Layers,
    title: "Sparse Chrome",
    copy: "Jarvis energy: one focal layer, supportive chrome vanishes when idle. Restraint as luxury.",
    glow: "rgba(99, 102, 241, 0.15)",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-space text-xs font-medium uppercase tracking-[0.35em] text-cyan-400/70">
            Signals
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Feature showcases — restraint as luxury.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            >
              <HoverScale>
                <div
                  className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 backdrop-blur-md transition-all duration-500"
                  style={{
                    boxShadow: `0 0 0 rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,0.03)`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 40px ${item.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 0 rgba(0,0,0,0)`;
                  }}
                >
                  <item.icon className="h-8 w-8 text-cyan-400/80 transition group-hover:text-cyan-300" />
                  <h3 className="mt-6 text-lg font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">
                    {item.copy}
                  </p>
                </div>
              </HoverScale>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
