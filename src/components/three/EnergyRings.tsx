"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import * as THREE from "three";

export default function EnergyRings() {
  const g1 = useRef<Mesh>(null);
  const g2 = useRef<Mesh>(null);
  const g3 = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (g1.current) {
      g1.current.rotation.z += delta * 0.35;
      g1.current.rotation.x += delta * 0.12;
    }
    if (g2.current) {
      g2.current.rotation.z -= delta * 0.28;
      g2.current.rotation.y += delta * 0.18;
    }
    if (g3.current) {
      g3.current.rotation.x += delta * 0.22;
      g3.current.rotation.z -= delta * 0.15;
    }
  });

  return (
    <group position={[0, 0.5, -2]}>
      <mesh ref={g1}>
        <torusGeometry args={[4.2, 0.022, 16, 128]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={g2} rotation={[Math.PI / 2.8, 0, 0]}>
        <torusGeometry args={[5.4, 0.018, 16, 128]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={g3} rotation={[Math.PI / 3.2, 0.6, 0.2]}>
        <torusGeometry args={[6.6, 0.014, 16, 128]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
