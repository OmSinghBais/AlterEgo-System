"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import GridBackground from "@/components/layout/GridBackground";
import ParticlesBackground from "@/components/layout/ParticlesBackground";
import { useOrbAudioReactive } from "@/hooks/useOrbAudioReactive";
import MobileChatOverlay from "@/components/chat/MobileChatOverlay";
import HistorySidebar from "@/components/chat/HistorySidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useOrbAudioReactive();

  return (
    <main className="flex h-screen overflow-hidden bg-[#050a0e] text-white">
      <Sidebar />
      <div className="hidden h-full w-64 lg:block">
        <HistorySidebar />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
        <GridBackground />
        <ParticlesBackground />
        <Header />
        <div className="relative z-10 flex h-full w-full flex-1 items-center justify-center px-4 pt-16 pb-6">
          {children}
        </div>
      </div>

      {/* Desktop chat panel */}
      <ChatPanel />

      {/* Mobile chat overlay */}
      <MobileChatOverlay />
    </main>
  );
}
