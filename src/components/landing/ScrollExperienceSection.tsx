"use client";

import { motion } from "framer-motion";

const beats = [
  {
    title: "Establish",
    body: "Wide composition. Silence carries weight before any token streams.",
  },
  {
    title: "Tilt",
    body: "Scroll pulls you through strata — glass, grid, void — never eight widgets at once.",
  },
  {
    title: "Resolve",
    body: "The orb answers on rhythm: glow, waveform, text share one tempo.",
  },
];

export default function ScrollExperienceSection() {
  return (
    <section className="relative px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-red-500/85">
          Scroll experience
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
          One continuous shot — cut by intention, not clutter.
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {beats.map((b, i) => (
            <motion.article
              key={b.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.75, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-xl font-medium text-white">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{b.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
