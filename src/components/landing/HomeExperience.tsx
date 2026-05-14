"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import LandingPage from "@/components/landing/LandingPage";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground"),
  { ssr: false }
);

export default function HomeExperience() {
  return (
    <>
      <SceneBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <LandingPage />
      </motion.div>
    </>
  );
}
