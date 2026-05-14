"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useOrbAudioReactive() {
  const listening = useAppStore((s) => s.voiceState.isListening);
  const setVoiceState = useAppStore((s) => s.setVoiceState);
  const setOrbState = useAppStore((s) => s.setOrbState);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!listening) {
      setVoiceState({ inputLevel: 0 });
      return;
    }

    let cancelled = false;
    let raf = 0;
    let simId: number | null = null;

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i]!;
          const avg = sum / buf.length / 255;
          setVoiceState({ inputLevel: avg });
          setOrbState({ energy: 0.32 + avg * 0.62 });
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        if (cancelled) return;
        simId = window.setInterval(() => {
          setVoiceState({ inputLevel: 0.35 + Math.random() * 0.55 });
          setOrbState({ energy: 0.4 + Math.random() * 0.45 });
        }, 110);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (simId) window.clearInterval(simId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [listening, setOrbState, setVoiceState]);
}
