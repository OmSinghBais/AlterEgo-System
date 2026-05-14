"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = rootRef.current;
    const layer = layerRef.current;
    if (!section || !layer) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 110,
        opacity: 0,
        rotateX: -14,
        transformOrigin: "50% 80%",
        stagger: 0.11,
        duration: 1.15,
        ease: "power3.out",
        delay: 0.18,
      });

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
          scale: 0.9,
          opacity: 0.18,
          filter: "blur(16px)",
          ease: "none",
        });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 pb-24 md:min-h-[110vh] md:px-12"
    >
      <div
        ref={layerRef}
        className="hero-layer mx-auto w-full max-w-6xl will-change-[transform,opacity,filter]"
      >
        <p className="hero-reveal font-space mb-8 max-w-xl text-xs font-medium uppercase tracking-[0.5em] text-rose-400/90">
          AlterEGO OS
        </p>
        <h1 className="hero-reveal font-orbitron max-w-6xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-8xl lg:text-9xl">
          ALTEREGO AI
        </h1>
        <p className="hero-reveal gradient-heading mt-8 max-w-4xl text-4xl font-medium leading-tight md:text-6xl lg:text-7xl">
          The Future of Intelligence
        </p>
        <p className="hero-reveal font-space mt-12 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
          Fullscreen intro · scroll to dissolve — GSAP ScrollTrigger pins this lens until
          you slip deeper into the story.
        </p>
        <div className="hero-reveal mt-14 flex flex-wrap gap-4">
          <span className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs tracking-wide text-white/65 backdrop-blur-md neon-edge">
            Scroll Effects
          </span>
          <span className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs tracking-wide text-white/65 backdrop-blur-md">
            Pinned · scrub · blur
          </span>
        </div>
      </div>
    </section>
  );
}
