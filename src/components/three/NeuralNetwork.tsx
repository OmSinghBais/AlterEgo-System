"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 14;

export default function NeuralNetwork() {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = (i / NODE_COUNT) * Math.PI * 2;
      const r = 3.2 + Math.sin(i * 1.7) * 0.8;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(a * 2) * 0.9,
          Math.sin(a) * r - 5
        )
      );
    }
    return pts;
  }, []);

  const lineGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      const b = nodes[(i + 1) % nodes.length]!;
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const jump = nodes[(i + 4) % nodes.length]!;
      positions.push(a.x, a.y, a.z, jump.x, jump.y, jump.z);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(positions), 3)
    );
    return geo;
  }, [nodes]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.09;
    }
  });

  return (
    <group ref={group} position={[0, 0.8, 0]}>
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}
