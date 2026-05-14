"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroOrb from "./HeroOrb";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = rootRef.current;
    const layer = layerRef.current;
    if (!section || !layer) return;

    const ctx = gsap.context(() => {
      /* Entrance reveal */
      gsap.from(".hero-reveal", {
        y: 100,
        opacity: 0,
        rotateX: -12,
        transformOrigin: "50% 80%",
        stagger: 0.12,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      /* Pin & dissolve on scroll */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=150%",
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
          },
        })
        .to(layer, {
          y: -80,
          scale: 0.92,
          opacity: 0.1,
          filter: "blur(20px)",
          ease: "none",
        });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 md:min-h-[110vh]"
    >
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 70%, rgba(14,116,144,0.06) 0%, transparent 50%)",
          }}
        />
      </div>

      <div
        ref={layerRef}
        className="hero-layer relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 will-change-[transform,opacity,filter] lg:flex-row lg:items-center lg:justify-between"
      >
        {/* Text block */}
        <div className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
          <p className="hero-reveal font-space mb-6 text-xs font-medium uppercase tracking-[0.5em] text-cyan-400/80">
            AlterEGO OS · Neural Interface
          </p>

          <h1 className="hero-reveal font-orbitron text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
            ALTEREGO
            <span className="block gradient-heading">AI</span>
          </h1>

          <p className="hero-reveal mt-6 text-2xl font-medium leading-tight text-white/80 md:text-3xl lg:text-4xl">
            Cinematic Intelligence
          </p>

          <p className="hero-reveal font-space mt-4 text-base text-white/40 md:text-lg">
            Realtime Conscious Systems
          </p>

          <p className="hero-reveal font-space mt-8 max-w-lg text-sm leading-relaxed text-white/35 md:text-base">
            A motion-first neural interface where voice, vision, and intelligence
            converge into a single conscious experience.
          </p>

          <div className="hero-reveal mt-10 flex flex-wrap gap-3">
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.3)] transition hover:shadow-[0_0_50px_rgba(56,189,248,0.5)]"
            >
              Enter the Shell
            </motion.a>
            <motion.a
              href="#orb-demo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-3 text-sm font-medium text-white/75 backdrop-blur-md transition hover:border-cyan-400/30 hover:text-cyan-200"
            >
              See the Orb
            </motion.a>
          </div>
        </div>

        {/* Hero Orb */}
        <motion.div
          className="hero-reveal relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroOrb />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
        animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
          Scroll
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-white/25"
        >
          <path
            d="M10 4v12m0 0l-4-4m4 4l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  );
}
