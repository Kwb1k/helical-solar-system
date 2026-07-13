"use client";

import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PLANETS, SUN_RADIUS, DISTANCE_SCALE, GALACTIC_SPEED, TILT_DEGREES, type PlanetData } from "@/lib/solarData";

const DEG2RAD = Math.PI / 180;
const TILT = TILT_DEGREES * DEG2RAD;

// Helper: rotate a point by the global tilt (around X) + small planet incl
function applyOrbitalTilt(x: number, y: number, z: number, planetInclRad: number) {
  // First apply planet's own small inclination (around its line of nodes, simplified as X)
  const cosI = Math.cos(planetInclRad);
  const sinI = Math.sin(planetInclRad);
  const y1 = y * cosI - z * sinI;
  const z1 = y * sinI + z * cosI;

  // Then global ecliptic -> galactic tilt
  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);
  const y2 = y1 * cosT - z1 * sinT;
  const z2 = y1 * sinT + z1 * cosT;

  return { x, y: y2, z: z2 };
}

// Simple ellipse position (perihelion along +X for visual clarity)
function getOrbitalPosition(a: number, e: number, theta: number) {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta); // we'll treat this as "along track" before tilt
  return { x, z };
}

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[SUN_RADIUS]} />
      <meshBasicMaterial color="#fffbeb" />
    </mesh>
  );
}

// Cheap but effective glow for the Sun (no postprocessing needed)
function SunGlow() {
  return (
    <>
      {/* Core bright */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.1]} />
        <meshBasicMaterial color="#fff7d0" transparent opacity={0.9} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.6]} />
        <meshBasicMaterial color="#ffeb99" transparent opacity={0.35} />
      </mesh>
      {/* Outer corona */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 2.3]} />
        <meshBasicMaterial color="#ffcc66" transparent opacity={0.15} />
      </mesh>
      {/* Very outer soft halo */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 3.2]} />
        <meshBasicMaterial color="#ffaa33" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

type PlanetProps = {
  data: (typeof PLANETS)[number];
  simTime: React.MutableRefObject<number>;
  sunZRef: React.MutableRefObject<number>;
};

function Planet({ data, simTime, sunZRef }: PlanetProps) {
  const groupRef = React.useRef<THREE.Group>(null!);
  const meshRef = React.useRef<THREE.Mesh>(null!);

  const a = data.a * DISTANCE_SCALE;
  const period = data.period;
  const e = data.e;
  const inclRad = data.incl * DEG2RAD;

  // Load texture if declared (put files in public/textures/ like earth.jpg)
  const texture = data.texture 
    ? useLoader(THREE.TextureLoader, `/textures/${data.texture}.jpg`) 
    : null;

  useFrame((state, delta) => {
    const t = simTime.current;
    const theta = ((t / period) * Math.PI * 2) % (Math.PI * 2);

    const { x: xOrb, z: zOrb } = getOrbitalPosition(a, e, theta);
    const tilted = applyOrbitalTilt(xOrb, 0, zOrb, inclRad);

    const sunZ = sunZRef.current;
    const wx = tilted.x;
    const wy = tilted.y;
    const wz = tilted.z + sunZ;

    if (groupRef.current) {
      groupRef.current.position.set(wx, wy, wz);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.visualRadius]} />
        <meshStandardMaterial 
          color={data.color} 
          map={texture || undefined}
          metalness={0.1}
          roughness={0.85}
        />
      </mesh>

      {/* Saturn rings - simple flat ring */}
      {data.hasRings && (
        <mesh rotation={[Math.PI * 0.48, 0.1, 0]}>
          <ringGeometry args={[data.visualRadius * 1.6, data.visualRadius * 2.6, 64]} />
          <meshBasicMaterial
            color="#f5e8c7"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
          />
        </mesh>
      )}

      {/* Simple moons */}
      {data.moons?.map((moon, idx) => (
        <Moon
          key={idx}
          moon={moon}
          parentRadius={data.visualRadius}
          simTime={simTime}
        />
      ))}
    </group>
  );
}

function Moon({ moon, parentRadius, simTime }: { 
  moon: NonNullable<PlanetData['moons']>[number]; 
  parentRadius: number; 
  simTime: React.MutableRefObject<number>;
}) {
  const moonRef = React.useRef<THREE.Group>(null!);

  useFrame(() => {
    const t = simTime.current;
    const angle = (t / moon.period) * Math.PI * 2;
    const dist = parentRadius * 1.8 + moon.distance;
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(angle) * dist;
      moonRef.current.position.z = Math.sin(angle) * dist * 0.6; // slight tilt
    }
  });

  return (
    <group ref={moonRef}>
      <mesh>
        <sphereGeometry args={[moon.size]} />
        <meshPhongMaterial color="#cccccc" shininess={10} />
      </mesh>
    </group>
  );
}

// Lightweight line trail that clearly shows the helical path (with simple fade on older segments)
function SimpleHelixTrail({
  simTime,
  getWorldPos,
  maxPoints = 420,
  color = "#a5b4fc",
}: {
  simTime: React.MutableRefObject<number>;
  getWorldPos: (t: number) => THREE.Vector3;
  maxPoints?: number;
  color?: string;
}) {
  const lineRef = React.useRef<THREE.Line>(null!);
  const positions = React.useRef<Float32Array>(new Float32Array(maxPoints * 3));
  const colors = React.useRef<Float32Array>(new Float32Array(maxPoints * 3));
  const countRef = React.useRef(0);

  // Parse base color once
  const baseColor = React.useMemo(() => new THREE.Color(color), [color]);

  useFrame(() => {
    const t = simTime.current;
    const pos = getWorldPos(t);

    const pArr = positions.current;
    const cArr = colors.current;
    const idx = (countRef.current % maxPoints) * 3;

    pArr[idx + 0] = pos.x;
    pArr[idx + 1] = pos.y;
    pArr[idx + 2] = pos.z;

    // Fade older points (newest = full color, oldest = darker)
    const age = countRef.current % maxPoints;
    const fade = 0.35 + (age / maxPoints) * 0.65;

    cArr[idx + 0] = baseColor.r * fade;
    cArr[idx + 1] = baseColor.g * fade;
    cArr[idx + 2] = baseColor.b * fade;

    countRef.current += 1;

    if (lineRef.current) {
      const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = lineRef.current.geometry.attributes.color as THREE.BufferAttribute;

      posAttr.array = pArr;
      posAttr.needsUpdate = true;

      if (colAttr) {
        colAttr.array = cArr;
        colAttr.needsUpdate = true;
      }

      lineRef.current.geometry.setDrawRange(0, Math.min(countRef.current, maxPoints));
    }
  });

  const lineObject = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.current, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors.current, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 });
    const l = new THREE.Line(g, mat);
    return l;
  }, []);

  return <primitive object={lineObject} ref={lineRef} />;
}

function AsteroidBelt({ simTime, sunZRef }: { 
  simTime: React.MutableRefObject<number>; 
  sunZRef: React.MutableRefObject<number>; 
}) {
  const pointsRef = React.useRef<THREE.Points>(null!);
  const count = 280;
  const inner = 3.8 * DISTANCE_SCALE;
  const outer = 4.8 * DISTANCE_SCALE;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const r = inner + Math.random() * (outer - inner);
      const y = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.7;
    }
    return pos;
  }, []);

  useFrame(() => {
    const sunZ = sunZRef.current;
    if (pointsRef.current) {
      pointsRef.current.position.z = sunZ;
      // Very slow rotation of the whole belt
      pointsRef.current.rotation.y = simTime.current * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#aaaaaa"
        sizeAttenuation
        transparent
        opacity={0.55}
      />
    </points>
  );
}

function Scene({ simTime }: { simTime: React.MutableRefObject<number> }) {
  const sunZRef = React.useRef(0);
  const controlsRef = React.useRef<any>(null);
  const sunLightRef = React.useRef<THREE.PointLight>(null!);
  const { camera } = useThree();

  // Follow the Sun using controls.target for smooth interaction with OrbitControls
  useFrame(() => {
    const sunZ = simTime.current * GALACTIC_SPEED;
    sunZRef.current = sunZ;

    const targetZ = sunZ;

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 3.5, targetZ - 5);
      controlsRef.current.update();
    }

    // Dynamic sun light position (so planets are properly lit)
    if (sunLightRef.current) {
      sunLightRef.current.position.set(0, 0, sunZ);
    }

    // Keep camera at a nice offset
    camera.position.z = targetZ + 32;
  });

  // Example trails for Earth and Jupiter to immediately show helices
  const earthData = PLANETS[2];
  const jupiterData = PLANETS[4];

  const earthTrailPos = (t: number) => {
    const theta = ((t / earthData.period) * Math.PI * 2) % (Math.PI * 2);
    const a = earthData.a * DISTANCE_SCALE;
    const { x: xOrb, z: zOrb } = getOrbitalPosition(a, earthData.e, theta);
    const tilted = applyOrbitalTilt(xOrb, 0, zOrb, earthData.incl * DEG2RAD);
    const sz = t * GALACTIC_SPEED;
    return new THREE.Vector3(tilted.x, tilted.y, tilted.z + sz);
  };

  const jupiterTrailPos = (t: number) => {
    const theta = ((t / jupiterData.period) * Math.PI * 2) % (Math.PI * 2);
    const a = jupiterData.a * DISTANCE_SCALE;
    const { x: xOrb, z: zOrb } = getOrbitalPosition(a, jupiterData.e, theta);
    const tilted = applyOrbitalTilt(xOrb, 0, zOrb, jupiterData.incl * DEG2RAD);
    const sz = t * GALACTIC_SPEED;
    return new THREE.Vector3(tilted.x, tilted.y, tilted.z + sz);
  };

  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Sun light that follows the moving sun for proper planet illumination */}
      <pointLight
        ref={sunLightRef}
        position={[0, 0, 0]}
        intensity={2.2}
        color="#fffbeb"
      />

      {/* Sun + glow at current galactic position */}
      <group position={[0, 0, 0]}>
        <Sun />
        <SunGlow />
      </group>

      {/* Planets */}
      {PLANETS.map((p) => (
        <Planet key={p.name} data={p} simTime={simTime} sunZRef={sunZRef} />
      ))}

      {/* Helix trails — visible spirals proving the motion is helical */}
      <SimpleHelixTrail simTime={simTime} getWorldPos={earthTrailPos} color="#6b9ac4" maxPoints={420} />
      <SimpleHelixTrail simTime={simTime} getWorldPos={jupiterTrailPos} color="#d8b47e" maxPoints={280} />

      {/* Mercury for extra coil visibility */}
      <SimpleHelixTrail simTime={simTime} getWorldPos={(t) => {
        const p = PLANETS[0]; const theta = ((t / p.period) * Math.PI * 2) % (Math.PI * 2);
        const orb = getOrbitalPosition(p.a * DISTANCE_SCALE, p.e, theta);
        const til = applyOrbitalTilt(orb.x, 0, orb.z, p.incl * DEG2RAD);
        return new THREE.Vector3(til.x, til.y, til.z + t * GALACTIC_SPEED);
      }} color="#9ca3af" maxPoints={260} />

      {/* Asteroid belt for extra visual density between Mars and Jupiter */}
      <AsteroidBelt simTime={simTime} sunZRef={sunZRef} />

      {/* Star field */}
      <Stars radius={380} depth={60} count={6500} factor={2.8} saturation={0} fade speed={0.4} />

      {/* Sun glow - Bloom temporarily disabled for build compatibility with fiber v9.
         Will restore with a compatible setup or custom effect. */}
      {/* <EffectComposer>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          height={256}
          intensity={1.35}
        />
      </EffectComposer> */}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={95}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export type SolarSystemHandle = {
  simTime: React.MutableRefObject<number>;
  timeScaleRef: React.MutableRefObject<number>;
  reset: () => void;
};

export const SolarSystem = React.forwardRef<SolarSystemHandle>((_, ref) => {
  // Single source of truth for simulation time (years)
  const simTime = React.useRef(0);
  const timeScaleRef = React.useRef(12); // start at a nice dramatic speed

  React.useImperativeHandle(ref, () => ({
    simTime,
    timeScaleRef,
    reset: () => {
      simTime.current = 0;
    },
  }));

  React.useEffect(() => {
    let raf: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.12);
      last = now;
      simTime.current += dt * timeScaleRef.current;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 18, 32], fov: 48 }}
      style={{ background: "#000000" }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.6]}
    >
      <Suspense fallback={null}>
        <Scene simTime={simTime} />
      </Suspense>
    </Canvas>
  );
});

SolarSystem.displayName = "SolarSystem";
