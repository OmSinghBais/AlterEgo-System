import HomeExperience from "@/components/landing/HomeExperience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlterEGO AI — Cinematic Intelligence",
  description:
    "A motion-first neural interface where voice, vision, and intelligence converge. Experience realtime conscious systems.",
};

/** Marketing homepage — the AI shell lives under `/dashboard`. */
export default function Home() {
  return <HomeExperience />;
}
