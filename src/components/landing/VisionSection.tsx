"use client";

import { motion } from "framer-motion";

export default function VisionSection() {
  return (
    <section className="relative px-6 py-36 md:px-12">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <p className="font-space text-xs font-medium uppercase tracking-[0.45em] text-cyan-400/70">
          Vision
        </p>

        <blockquote className="mt-10 text-3xl font-medium leading-snug tracking-tight text-white md:text-5xl md:leading-tight">
          Intelligence should feel{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-white to-blue-400 bg-clip-text text-transparent">
            dimensional
          </span>{" "}
          — not disposable.
        </blockquote>

        <p className="mx-auto mt-10 max-w-2xl text-lg text-white/40">
          We privilege lighting, transparency, and timing over feature density.
          If it doesn&apos;t breathe, it isn&apos;t AlterEGO.
        </p>

        {/* Decorative orb hint */}
        <motion.div
          className="mx-auto mt-16 size-3 rounded-full bg-cyan-400/40"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.8, 0.4],
            boxShadow: [
              "0 0 10px rgba(56,189,248,0.3)",
              "0 0 30px rgba(56,189,248,0.6)",
              "0 0 10px rgba(56,189,248,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
