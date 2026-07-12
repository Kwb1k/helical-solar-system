"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[1.2]} />
      <meshBasicMaterial color="#fff7d6" />
    </mesh>
  );
}

function Planet({ 
  radius = 0.4, 
  distance = 5, 
  speed = 0.5, 
  color = "#a5b4fc",
  offset = 0 
}: { 
  radius?: number; 
  distance?: number; 
  speed?: number; 
  color?: string;
  offset?: number;
}) {
  // Very simple circular orbit for placeholder (will become proper helical simulation)
  const ref = useRef<THREE.Group>(null!);

  useEffect(() => {
    let raf: number;
    const animate = (t: number) => {
      if (ref.current) {
        const angle = (t * 0.001 * speed) + offset;
        ref.current.position.x = Math.cos(angle) * distance;
        ref.current.position.z = Math.sin(angle) * distance;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [distance, speed, offset]);

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius]} />
        <meshPhongMaterial color={color} shininess={30} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#fff7d6" />

      {/* The Sun */}
      <Sun />

      {/* Placeholder planets with different distances/speeds (will be replaced with accurate helical model) */}
      <Planet radius={0.25} distance={4} speed={1.8} color="#9ca3af" offset={0} />
      <Planet radius={0.4} distance={6.5} speed={0.9} color="#e2c99a" offset={1.2} />
      <Planet radius={0.42} distance={9} speed={0.6} color="#6b9ac4" offset={2.8} />
      <Planet radius={0.3} distance={12} speed={0.35} color="#c17a5e" offset={0.7} />
      <Planet radius={1.1} distance={18} speed={0.12} color="#d8b47e" offset={3.5} />

      {/* Nice star background */}
      <Stars 
        radius={300} 
        depth={50} 
        count={8000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.5} 
      />

      {/* Post-processing bloom for the Sun */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          height={300} 
          intensity={1.2}
        />
      </EffectComposer>

      {/* User controls */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={2}
        maxDistance={80}
      />
    </>
  );
}

export function SolarSystem() {
  return (
    <Canvas
      camera={{ position: [0, 18, 32], fov: 50 }}
      style={{ background: "#000000" }}
      gl={{ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true 
      }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
