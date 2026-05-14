"use client";

import { useEffect, useRef } from "react";
import { useAssistantStore } from "@/store/useAssistantStore";

export default function AudioVisualizer() {
  const { isRecording } = useAssistantStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const startVisualizer = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.1)");
          gradient.addColorStop(1, "rgba(6, 182, 212, 0.8)");
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      };

      draw();

      return () => {
        audioCtx.close();
        stream.getTracks().forEach(t => t.stop());
      };
    };

    startVisualizer();
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={30} 
      className="opacity-50"
    />
  );
}
