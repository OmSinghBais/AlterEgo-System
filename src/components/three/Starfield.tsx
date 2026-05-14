"use client";

import { Stars } from "@react-three/drei";

export default function Starfield() {
  return (
    <Stars
      radius={140}
      depth={80}
      count={6000}
      factor={3.8}
      saturation={0.1}
      fade
      speed={0.18}
    />
  );
}
