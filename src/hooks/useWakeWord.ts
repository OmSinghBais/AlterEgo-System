"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Listens for wake_word_detected events from the voice WebSocket.
 * Works globally — mounted at root layout level.
 * When detected, triggers cinematic activation then navigates to /dashboard.
 */
export function useWakeWord() {
  const router = useRouter();
  const pathname = usePathname();
  const [activated, setActivated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleWakeWord = useCallback(() => {
    // Don't re-trigger if already on dashboard or already activating
    if (pathname === "/dashboard" || activated) return;

    console.log("🔔 Wake word received! Activating...");
    setActivated(true);

    // Show cinematic overlay, then navigate
    setTimeout(() => {
      // Use window.location for guaranteed navigation
      window.location.href = "/dashboard";
    }, 1800);
  }, [pathname, activated]);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_VOICE_WS_URL || "ws://127.0.0.1:8000/ws/voice";

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("🔗 Wake word listener connected");
        };

        ws.onmessage = (event) => {
          if (event.data instanceof Blob) return; // skip binary audio

          try {
            const data = JSON.parse(event.data);
            if (data.type === "wake_word_detected") {
              handleWakeWord();
            }
          } catch {
            // ignore non-JSON
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          // Reconnect after 3s
          reconnectRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [handleWakeWord]);

  return { activated };
}
