"use client";

import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <section className="relative px-6 py-32 md:px-12">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl"
      >
        <p className="font-space text-xs font-medium uppercase tracking-[0.35em] text-cyan-400/70">
          Introduction
        </p>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Not a chat window taped to a spreadsheet.
        </h2>
        <p className="mt-8 text-lg leading-relaxed text-white/50">
          AlterEGO is built as a{" "}
          <em className="not-italic text-white/80">film sequence</em> —
          establishing shot, tension, reveal. Voice, waveform, subtitles, and
          glow stay in sync so cognition reads as choreography, not latency.
        </p>

        {/* Visual separator */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-xs text-white/20">●</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </motion.div>
    </section>
  );
}
