"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import BootSequence from "@/components/animations/BootSequence";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground"),
  { ssr: false }
);

export default function WorkspaceExperience({
  children,
}: {
  children: React.ReactNode;
}) {
  const [booted, setBooted] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!booted && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>
      <SceneBackground />
      <AppShell>{children}</AppShell>
    </>
  );
}
