"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

/**
 * Task 10: Live voice waveform HUD visualization.
 *
 * Canvas-based waveform that shows:
 * - Mic input during listening
 * - TTS output during speaking
 * - Flat line when idle
 */
export default function VoiceWaveHUD({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mode = useAppStore((s) => s.orbState.mode);
  const energy = useAppStore((s) => s.orbState.energy);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const midY = H / 2;
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Determine amplitude based on mode
      let amplitude: number;
      let waveSpeed: number;
      let color: string;
      let lineWidth: number;

      if (mode === "speaking") {
        amplitude = 8 + energy * 18;
        waveSpeed = 0.08;
        color = "rgba(255, 255, 255, 0.6)";
        lineWidth = 1.5;
      } else if (mode === "listening") {
        amplitude = 4 + energy * 12;
        waveSpeed = 0.06;
        color = "rgba(34, 211, 238, 0.7)";
        lineWidth = 1.2;
      } else if (mode === "thinking") {
        amplitude = 2 + Math.sin(phase * 2) * 3;
        waveSpeed = 0.03;
        color = "rgba(168, 85, 247, 0.5)";
        lineWidth = 1;
      } else {
        amplitude = 1 + Math.sin(phase * 0.5) * 0.5;
        waveSpeed = 0.015;
        color = "rgba(56, 189, 248, 0.2)";
        lineWidth = 0.8;
      }

      phase += waveSpeed;

      // Draw main wave
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      for (let x = 0; x < W; x++) {
        const t = x / W;
        const y =
          midY +
          Math.sin(t * Math.PI * 4 + phase) * amplitude +
          Math.sin(t * Math.PI * 7 + phase * 1.3) * amplitude * 0.3 +
          Math.sin(t * Math.PI * 11 + phase * 0.7) * amplitude * 0.15;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary wave (softer)
      ctx.beginPath();
      ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.15)");
      ctx.lineWidth = lineWidth * 0.6;

      for (let x = 0; x < W; x++) {
        const t = x / W;
        const y =
          midY +
          Math.sin(t * Math.PI * 3 + phase * 0.8 + 1) * amplitude * 0.6 +
          Math.sin(t * Math.PI * 9 + phase * 1.5) * amplitude * 0.2;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Center glow line
      ctx.beginPath();
      ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.08)");
      ctx.lineWidth = 0.5;
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, energy]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        className="h-10 w-full"
        style={{ imageRendering: "auto" }}
      />
    </motion.div>
  );
}
