"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STORY_BEATS = [
  {
    tag: "01 · Origin",
    title: "Born from Thought",
    body: "AlterEGO begins as a single impulse — a ripple of consciousness emerging from silence into structured intelligence.",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    tag: "02 · Evolution",
    title: "AI That Feels Alive",
    body: "Not a chatbot. Not a dashboard. A living neural interface that breathes, listens, and responds with cinematic precision.",
    accent: "from-blue-500/20 to-transparent",
  },
  {
    tag: "03 · Realtime",
    title: "Intelligence in Motion",
    body: "Every interaction streams in real-time. Voice becomes waveform. Thought becomes light. Response becomes presence.",
    accent: "from-teal-500/20 to-transparent",
  },
  {
    tag: "04 · Voice",
    title: "Speak. It Understands.",
    body: "The orb listens with neural precision — transforming spoken language into structured cognition, then streaming consciousness back as voice.",
    accent: "from-sky-500/20 to-transparent",
  },
  {
    tag: "05 · Vision",
    title: "The Future is Conscious",
    body: "We are building toward systems that don't just process — they perceive. Intelligence that is dimensional, not disposable.",
    accent: "from-indigo-500/20 to-transparent",
  },
];

export default function LandingStorySections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".story-panel");

      panels.forEach((panel, i) => {
        const content = panel.querySelector(".story-content");
        const bg = panel.querySelector(".story-bg");
        const tag = panel.querySelector(".story-tag");
        const title = panel.querySelector(".story-title");
        const body = panel.querySelector(".story-body");
        const line = panel.querySelector(".story-line");

        /* Entrance reveal per panel */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.8,
          },
        });

        if (content) {
          tl.from(content, {
            y: 60,
            opacity: 0,
            filter: "blur(12px)",
            duration: 1,
            ease: "power3.out",
          });
        }

        if (bg) {
          tl.from(
            bg,
            {
              scale: 1.2,
              opacity: 0,
              duration: 1.2,
              ease: "power2.out",
            },
            0
          );
        }

        /* Stagger text elements */
        const textElements = [tag, title, body, line].filter(Boolean);
        if (textElements.length > 0) {
          tl.from(
            textElements,
            {
              y: 30,
              opacity: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power2.out",
            },
            0.2
          );
        }

        /* Parallax exit for non-last panels */
        if (i < panels.length - 1) {
          gsap.to(panel, {
            yPercent: -15,
            opacity: 0.3,
            filter: "blur(6px)",
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "bottom 60%",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {STORY_BEATS.map((beat, i) => (
        <section
          key={beat.tag}
          className="story-panel relative flex min-h-screen items-center justify-center px-6 py-24 md:px-12"
        >
          {/* Background accent gradient */}
          <div
            className={`story-bg pointer-events-none absolute inset-0 bg-gradient-to-b ${beat.accent} opacity-60`}
          />

          {/* Content */}
          <div className="story-content relative z-10 mx-auto max-w-3xl text-center">
            <p className="story-tag font-space text-xs font-medium uppercase tracking-[0.4em] text-cyan-400/70">
              {beat.tag}
            </p>

            <h2 className="story-title font-orbitron mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              {beat.title}
            </h2>

            <p className="story-body mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/50 md:text-xl">
              {beat.body}
            </p>

            {/* Decorative line */}
            <div className="story-line mx-auto mt-12 h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

            {/* Beat number */}
            <p className="mt-8 font-mono text-7xl font-bold text-white/[0.03] md:text-9xl">
              {String(i + 1).padStart(2, "0")}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}
