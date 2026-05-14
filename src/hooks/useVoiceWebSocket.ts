"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAudioAnalyser } from "./useAudioAnalyser";
import { AudioQueueManager } from "@/services/audioQueue";

const WS_URL =
  process.env.NEXT_PUBLIC_VOICE_WS_URL || "ws://127.0.0.1:8000/ws/voice";

export type VoiceSocketState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export function useVoiceWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [socketState, setSocketState] = useState<VoiceSocketState>("disconnected");
  
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const setOrbMode = useAppStore((s) => s.setOrbMode);
  const setRealtimeStatus = useAppStore((s) => s.setRealtimeStatus);
  const addMessage = useAppStore((s) => s.addMessage);
  const updateChatMessage = useAppStore((s) => s.updateChatMessage);
  const appendChatMessage = useAppStore((s) => s.appendChatMessage);

  const streamMsgIdRef = useRef<string | null>(null);
  const streamTextRef = useRef("");

  const { attachAudio, getEnergy } = useAudioAnalyser();
  const setOrbState = useAppStore((s) => s.setOrbState);
  const rafRef = useRef<number>(0);

  // Initialize AudioQueueManager
  const audioQueue = useMemo(() => new AudioQueueManager((audio) => {
    attachAudio(audio);
    const loop = () => {
      if (audio.paused || audio.ended) return;
      const e = getEnergy();
      setOrbState({ energy: Math.min(0.99, 0.4 + e * 0.6) });
      rafRef.current = requestAnimationFrame(loop);
    };
    audio.onplay = () => {
      cancelAnimationFrame(rafRef.current);
      loop();
    };
  }, () => {
    cancelAnimationFrame(rafRef.current);
  }), [attachAudio, getEnergy, setOrbState]);

  const fadeOutAudio = useCallback(() => {
    const audio = audioQueue.getCurrentAudio();
    if (!audio) return;

    const startVol = audio.volume;
    const steps = 10;
    const stepMs = 20;
    let step = 0;

    const fade = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fade);
        audioQueue.interrupt();
        audio.volume = 1;
      }
    }, stepMs);
  }, [audioQueue]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setSocketState("connecting");

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setSocketState("connected");
        setRealtimeStatus("ready");
        reconnectAttemptRef.current = 0;
        console.log("🔗 Voice WebSocket connected");

        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 15000);
      };

      ws.onclose = () => {
        setSocketState("disconnected");
        setRealtimeStatus("idle");
        wsRef.current = null;
        clearInterval(heartbeatRef.current);

        const attempt = reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        reconnectAttemptRef.current = attempt + 1;
        console.log(`🔌 Reconnecting in ${delay / 1000}s (attempt ${attempt + 1})`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setSocketState("error");
        setRealtimeStatus("error");
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          const url = URL.createObjectURL(event.data);
          audioQueue.enqueue(url);
          return;
        }

        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case "state":
              if (msg.state === "listening") {
                setOrbMode("listening");
                setRealtimeStatus("ready");
              } else if (msg.state === "thinking") {
                setOrbMode("thinking");
                setRealtimeStatus("connecting");
              } else if (msg.state === "speaking") {
                setOrbMode("speaking");
                setRealtimeStatus("streaming");
              } else if (msg.state === "idle") {
                setOrbMode("idle");
                setRealtimeStatus("ready");
                streamMsgIdRef.current = null;
                streamTextRef.current = "";
              }
              break;

            case "transcript_user":
              if (msg.text) {
                addMessage({ role: "user", content: msg.text });
              }
              break;

            case "token":
            case "transcript_ai":
              const textChunk = msg.content || msg.text || "";
              if (!msg.done) {
                if (!streamMsgIdRef.current) {
                  const id = appendChatMessage({
                    role: "assistant",
                    content: textChunk,
                  });
                  streamMsgIdRef.current = id;
                  streamTextRef.current = textChunk;
                } else {
                  streamTextRef.current += textChunk;
                  updateChatMessage(
                    streamMsgIdRef.current,
                    streamTextRef.current
                  );
                }
              } else {
                streamMsgIdRef.current = null;
                streamTextRef.current = "";
              }
              break;

            case "interrupted":
              fadeOutAudio(); // Task 3: smooth fade
              setOrbMode("idle");
              setRealtimeStatus("ready");
              break;

            case "mode_changed":
              console.log(`🎭 Mode: ${msg.mode}`);
              break;

            case "pong":
              break; // heartbeat response

            case "error":
              console.error(`❌ Server: ${msg.message}`);
              setOrbMode("error");
              setRealtimeStatus("error");
              setTimeout(() => {
                setOrbMode("idle");
                setRealtimeStatus("ready");
              }, 2000);
              break;
          }
        } catch {
          // ignore
        }
      };
    } catch {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
      reconnectTimerRef.current = setTimeout(connect, delay);
    }
  }, [
    setOrbMode,
    setRealtimeStatus,
    addMessage,
    updateChatMessage,
    appendChatMessage,
    fadeOutAudio,
  ]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    clearInterval(heartbeatRef.current);
    reconnectAttemptRef.current = 999; // prevent auto-reconnect
    wsRef.current?.close();
    wsRef.current = null;
    setSocketState("disconnected");
  }, []);

  const sendAudio = useCallback((audioBuffer: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioBuffer);
    }
  }, []);

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text_input", text }));
    }
  }, []);

  /** Task 3: Smooth interrupt — fade audio + send interrupt command. */
  const interrupt = useCallback(() => {
    fadeOutAudio();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "interrupt" }));
    }
  }, [fadeOutAudio]);

  const setMode = useCallback((mode: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "set_mode", mode }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    socketState,
    connect,
    disconnect,
    sendAudio,
    sendText,
    interrupt,
    setMode,
  };
}
