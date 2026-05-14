"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Suspense } from "react";
import EnergyRings from "./EnergyRings";
import FloatingParticles from "./FloatingParticles";
import HolographicGrid from "./HolographicGrid";
import NeuralNetwork from "./NeuralNetwork";
import RotatingSpheres from "./RotatingSpheres";
import Starfield from "./Starfield";

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[12, 14, 10]} intensity={1.1} color="#0ea5e9" />
      <pointLight position={[-14, -6, 6]} intensity={0.45} color="#0e7490" />
      <Starfield />
      <FloatingParticles count={420} />
      <Sparkles
        count={52}
        scale={[28, 16, 24]}
        size={2.2}
        speed={0.25}
        opacity={0.45}
        color="#38bdf8"
      />
      <HolographicGrid />
      <RotatingSpheres />
      <NeuralNetwork />
      <EnergyRings />
    </>
  );
}

export default function SceneBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 1.2, 14], fov: 42 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
