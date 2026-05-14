"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useIdleTimer(timeoutMs = 5 * 60 * 1000) {
  const enterSleepMode = useAppStore((s) => s.enterSleepMode);
  const exitSleepMode = useAppStore((s) => s.exitSleepMode);
  const sleepMode = useAppStore((s) => s.sleepMode);
  const realtimeStatus = useAppStore((s) => s.realtimeStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Reset timer on activity
    const resetTimer = () => {
      if (sleepMode) {
        exitSleepMode();
      }
      clearTimeout(timerRef.current);
      
      // Only enter sleep if we are idle
      if (realtimeStatus === "ready" || realtimeStatus === "idle" || realtimeStatus === "error") {
        timerRef.current = setTimeout(() => {
          enterSleepMode();
        }, timeoutMs);
      }
    };

    // Listen for mouse, keyboard, and touch events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // Initialize

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      clearTimeout(timerRef.current);
    };
  }, [enterSleepMode, exitSleepMode, sleepMode, realtimeStatus, timeoutMs]);
}
