"use client";

import { Grid } from "@react-three/drei";

export default function HolographicGrid() {
  return (
    <Grid
      args={[24, 24]}
      position={[0, -3.2, -4]}
      cellSize={0.35}
      cellThickness={0.65}
      cellColor="#0e7490"
      sectionSize={4.2}
      sectionThickness={1.1}
      sectionColor="#164e63"
      fadeDistance={42}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
