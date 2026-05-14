"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Deterministic 0–1 — stable across re-renders (no Math.random in render). */
function rnd01(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Props = { count?: number };

export default function FloatingParticles({ count = 380 }: Props) {
  const points = useRef<THREE.Points>(null);

  const { positions, phases, baseY } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const by = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd01(i, 1) - 0.5) * 38;
      const y = (rnd01(i, 2) - 0.5) * 22;
      pos[i * 3 + 1] = y;
      by[i] = y;
      pos[i * 3 + 2] = (rnd01(i, 3) - 0.5) * 28 - 6;
      ph[i] = rnd01(i, 4) * Math.PI * 2;
    }
    return { positions: pos, phases: ph, baseY: by };
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.elapsedTime;
    const geo = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = geo.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const ph = phases[i]!;
      arr[i * 3 + 1] = baseY[i]! + Math.sin(t * 0.55 + ph) * 0.35;
    }
    geo.needsUpdate = true;
    points.current.rotation.y = t * 0.018;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#0ea5e9"
        size={0.045}
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
