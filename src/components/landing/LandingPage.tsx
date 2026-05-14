"use client";

import HeroSection from "./HeroSection";
import LandingStorySections from "./LandingStorySections";
import IntroSection from "./IntroSection";
import FeaturesSection from "./FeaturesSection";
import OrbDemoSection from "./OrbDemoSection";
import VisionSection from "./VisionSection";
import LandingCTASection from "./LandingCTASection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="relative z-10 text-white">
      <HeroSection />
      <IntroSection />
      <LandingStorySections />
      <FeaturesSection />
      <OrbDemoSection />
      <VisionSection />
      <LandingCTASection />
      <Footer />
    </div>
  );
}
