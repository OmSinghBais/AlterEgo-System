"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Task 9: Audio-reactive hook using Web Audio API analyser.
 *
 * Provides FFT frequency data that drives orb reactivity.
 * Attaches to any audio element (TTS playback).
 */
export function useAudioAnalyser() {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceMapRef = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(
    new WeakMap()
  );

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const analyser = ctxRef.current.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(ctxRef.current.destination);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }
    return ctxRef.current;
  }, []);

  /** Attach analyser to an audio element. */
  const attachAudio = useCallback(
    (audio: HTMLAudioElement) => {
      const ctx = getCtx();
      const analyser = analyserRef.current;
      if (!analyser) return;

      // Avoid creating duplicate sources for the same element
      if (sourceMapRef.current.has(audio)) return;

      try {
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        sourceMapRef.current.set(audio, source);
      } catch {
        // Already attached or CORS issue — safe to ignore
      }
    },
    [getCtx]
  );

  /** Get current frequency energy (0-1). */
  const getEnergy = useCallback((): number => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return 0;

    analyser.getByteFrequencyData(data);

    // Weighted average — emphasize mid frequencies (voice range 300-3000Hz)
    let sum = 0;
    let weight = 0;
    for (let i = 0; i < data.length; i++) {
      const w = i < data.length * 0.2 ? 0.5 : i < data.length * 0.6 ? 1.5 : 0.3;
      sum += (data[i]! / 255) * w;
      weight += w;
    }

    return Math.min(1, (sum / weight) * 1.5);
  }, []);

  /** Get bass energy (0-1) for orb scale. */
  const getBass = useCallback((): number => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return 0;

    analyser.getByteFrequencyData(data);
    let sum = 0;
    const bassEnd = Math.floor(data.length * 0.15);
    for (let i = 0; i < bassEnd; i++) {
      sum += data[i]! / 255;
    }
    return sum / bassEnd;
  }, []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  /** Get raw frequency data array for visualisation. */
  const getFrequencies = useCallback((): Uint8Array<ArrayBuffer> | null => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return null;

    analyser.getByteFrequencyData(data);
    return data;
  }, []);

  return { attachAudio, getEnergy, getBass, getFrequencies };
}
