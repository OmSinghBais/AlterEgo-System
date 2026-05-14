"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Task 11: Ambient audio layer.
 *
 * Uses Web Audio API oscillators for subtle background ambience:
 * - Low synth hum (always-on when enabled)
 * - Activation tone (on wake/connect)
 * - Listening chirp (when mic activates)
 */
export function useAmbientAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const [enabled, setEnabled] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  /** Start the low ambient hum. */
  const startHum = useCallback(() => {
    const ctx = getCtx();
    if (humGainRef.current) return;

    // Sub-bass layer
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55; // A1

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 82.5; // E2

    const gain = ctx.createGain();
    gain.gain.value = 0;
    humGainRef.current = gain;

    // Slow LFO for breathing feel
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08; // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.003;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    // Fade in over 2s
    gain.gain.setTargetAtTime(0.008, ctx.currentTime, 0.8);
    setEnabled(true);
  }, [getCtx]);

  /** Stop the ambient hum. */
  const stopHum = useCallback(() => {
    if (humGainRef.current) {
      const ctx = getCtx();
      humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      setTimeout(() => {
        humGainRef.current = null;
      }, 1000);
    }
    setEnabled(false);
  }, [getCtx]);

  /** Play a short activation tone. */
  const playActivationTone = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }, [getCtx]);

  /** Play a listening chirp. */
  const playListeningChirp = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [getCtx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  return {
    enabled,
    startHum,
    stopHum,
    playActivationTone,
    playListeningChirp,
  };
}
