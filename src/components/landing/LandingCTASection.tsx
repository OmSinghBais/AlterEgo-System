"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingCTASection() {
  return (
    <section className="relative px-6 py-36 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 48, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-4xl rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent p-12 text-center shadow-[0_0_80px_rgba(56,189,248,0.08)] backdrop-blur-xl md:p-16"
      >
        <p className="font-space text-xs font-medium uppercase tracking-[0.4em] text-cyan-400/80">
          Ready layer
        </p>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Enter the AlterEGO shell
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/45">
          Orb states, streaming cognition, and OS chrome — the cinematic spine
          is live. Experience the neural interface.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.25)] transition hover:shadow-[0_0_50px_rgba(56,189,248,0.45)]"
          >
            Open Dashboard
          </Link>
          <Link
            href="/voice"
            className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition hover:border-cyan-400/30 hover:text-cyan-200"
          >
            Voice Lab
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
