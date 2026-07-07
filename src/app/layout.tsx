import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import WakeWordProvider from "@/components/layout/WakeWordProvider";
import VoiceManager from "@/components/voice/VoiceManager";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import "./globals.css";

const fontInter = localFont({
  src: "../fonts/vendor/Inter/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});

const fontOrbitron = localFont({
  src: "../fonts/vendor/Orbitron/Orbitron-VariableFont_wght.ttf",
  variable: "--font-orbitron",
  display: "swap",
});

const fontSpaceGrotesk = localFont({
  src: "../fonts/vendor/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlterEGO — cinematic intelligence",
  description:
    "Motion-first AI interface — depth, glass layers, voice orb, and simulated realtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${fontInter.variable} ${fontOrbitron.variable} ${fontSpaceGrotesk.variable} ${geistMono.variable} h-full bg-[#050a0e] antialiased`}
    >
      <body className="flex min-h-full flex-col bg-transparent font-[family-name:var(--font-inter)] text-white">
        <ErrorBoundary
          onError={(error, info) => {
            // Send to monitoring service
            console.error('Layout error:', error);
            if (typeof window !== 'undefined' && window.Sentry) {
              window.Sentry.captureException(error, { contexts: { react: { info } } });
            }
          }}
        >
          <WakeWordProvider>{children}</WakeWordProvider>
          <VoiceManager />
          <Toaster theme="dark" position="bottom-right" closeButton richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}
