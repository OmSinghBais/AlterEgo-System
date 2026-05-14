"use client";

import { useWakeWord } from "@/hooks/useWakeWord";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import WakeWordOverlay from "@/components/layout/WakeWordOverlay";

/**
 * Global provider that activates the wake word listener on every page.
 * Mount this in the root layout.
 */
export default function WakeWordProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activated } = useWakeWord();
  useIdleTimer();

  return (
    <>
      <WakeWordOverlay active={activated} />
      {children}
    </>
  );
}
