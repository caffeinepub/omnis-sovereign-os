import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface StarfieldProps {
  warpActive?: boolean;
}

function Stars({ warpActive }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const starCount = 2000;

  const [_positions, geometry] = useMemo(() => {
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;
    }
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(arr, 3);
    geo.setAttribute("position", attr);
    return [arr, geo] as const;
  }, []);

  const speedRef = useRef(0.05);

  useFrame(() => {
    if (!pointsRef.current) return;

    const target = warpActive ? 3.5 : 0.05;
    speedRef.current += (target - speedRef.current) * 0.06;

    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < starCount; i++) {
      arr[i * 3 + 2] += speedRef.current;
      if (arr[i * 3 + 2] > 50) {
        arr[i * 3 + 2] = -100;
        arr[i * 3] = (Math.random() - 0.5) * 200;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={warpActive ? 0.5 : 0.25}
        color="#f59e0b"
        sizeAttenuation
        transparent
        opacity={0.85}
      />
    </points>
  );
}

export function StarfieldWarp({ warpActive = false }: StarfieldProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75, near: 0.1, far: 1000 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ antialias: false }}
    >
      <Stars warpActive={warpActive} />
    </Canvas>
  );
}
