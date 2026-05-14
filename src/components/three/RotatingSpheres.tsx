"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export default function RotatingSpheres() {
  const group = useRef<Group>(null);

  const spheres = useMemo(
    () =>
      [
        { position: [-5, 1.5, -4] as const, scale: 0.45, color: "#0ea5e9" },
        { position: [6, -0.5, -6] as const, scale: 0.65, color: "#38bdf8" },
        { position: [2, 3.2, -8] as const, scale: 0.38, color: "#0e7490" },
        { position: [-3.5, -2, -5] as const, scale: 0.52, color: "#bae6fd" },
      ] as const,
    []
  );

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={group}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.position} scale={s.scale}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.35}
            metalness={0.85}
            roughness={0.18}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}
