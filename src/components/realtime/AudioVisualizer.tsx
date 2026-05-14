"use client";

import { useEffect, useRef } from "react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getFrequencies } = useAudioAnalyser();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const draw = () => {
      const freqs = getFrequencies();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      if (!freqs || freqs.length === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const barWidth = (width / freqs.length) * 2.5;
      let x = 0;

      for (let i = 0; i < freqs.length; i++) {
        const barHeight = (freqs[i] / 255) * height;

        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + (freqs[i] / 255) * 0.7})`; // Cyan fading
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(raf);
  }, [getFrequencies]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="w-full h-12 opacity-80 mix-blend-screen"
    />
  );
}
