"use client";

import { useCallback, useRef, useState } from "react";

const SAMPLE_RATE = 16000;
const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION_MS = 1500;

/**
 * Hook to capture microphone audio as PCM16 Int16Array.
 *
 * Includes Voice Activity Detection (VAD) / Silence Detection.
 * Automatically triggers `onSilence` if user stops speaking.
 */
export function useMicRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  
  const lastSpokenRef = useRef<number>(Date.now());
  const hasSpokenRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<number | null>(null);

  const startRecording = useCallback(async (onSilence?: () => void): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 85;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      chunksRef.current = [];
      hasSpokenRef.current = false;
      lastSpokenRef.current = Date.now();

      processor.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(data));

        // Simple energy calculation for VAD
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
        const energy = sum / data.length;

        if (energy > SILENCE_THRESHOLD) {
          hasSpokenRef.current = true;
          lastSpokenRef.current = Date.now();
        } else if (hasSpokenRef.current && Date.now() - lastSpokenRef.current > SILENCE_DURATION_MS) {
          // Trigger silence detected
          if (!silenceTimerRef.current && onSilence) {
            silenceTimerRef.current = window.setTimeout(() => {
               onSilence();
               silenceTimerRef.current = null;
            }, 0);
          }
        }
      };

      source.connect(highpass);
      highpass.connect(processor);
      processor.connect(ctx.destination);
      setRecording(true);
    } catch (err) {
      console.error("🎤 Mic access denied:", err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): ArrayBuffer => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    processorRef.current?.disconnect();
    processorRef.current = null;

    void ctxRef.current?.close();
    ctxRef.current = null;

    setRecording(false);

    const totalLength = chunksRef.current.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    chunksRef.current = [];

    const pcm16 = new Int16Array(merged.length);
    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]!));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return pcm16.buffer;
  }, []);

  return { recording, startRecording, stopRecording };
}
