"use client";

import React from "react";
import { SolarSystem, type SolarSystemHandle } from "./components/SolarSystem";

export default function HelicalSolarSystemPage() {
  const systemRef = React.useRef<SolarSystemHandle>(null);
  const [speed, setSpeed] = React.useState(12);

  const updateSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (systemRef.current) {
      systemRef.current.timeScaleRef.current = newSpeed;
    }
  };

  const reset = () => {
    if (systemRef.current) {
      systemRef.current.reset();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070a]">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Helical Solar System</h1>
          <p className="text-xs text-white/60">Real galactic motion • Three.js</p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <a 
            href="https://github.com/Kwb1k/helical-solar-system" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/5 transition"
          >
            GitHub
          </a>
          <button 
            onClick={reset}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Reset Time
          </button>
        </div>
      </header>

      {/* The 3D Canvas */}
      <div className="canvas-container">
        <SolarSystem ref={systemRef} />
      </div>

      {/* Time + View controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="controls rounded-2xl px-5 py-3 text-sm pointer-events-auto flex flex-col gap-2 bg-black/70 backdrop-blur">
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-xs tracking-widest">SPEED</span>
            <input
              type="range"
              min="0.5"
              max="120"
              step="0.5"
              value={speed}
              onChange={(e) => updateSpeed(parseFloat(e.target.value))}
              className="w-48 accent-white/80"
            />
            <span className="tabular-nums w-14 text-right font-mono text-xs">{speed.toFixed(1)}×</span>
            <button onClick={() => updateSpeed(12)} className="text-xs px-2 py-0.5 border border-white/20 rounded hover:bg-white/5">12×</button>
            <button onClick={() => updateSpeed(60)} className="text-xs px-2 py-0.5 border border-white/20 rounded hover:bg-white/5">60×</button>
            <button onClick={reset} className="text-xs px-2 py-0.5 border border-white/20 rounded hover:bg-white/5 ml-2">RESET</button>
          </div>

          <div className="flex gap-2 text-xs">
            <button onClick={() => { /* TODO: implement camera presets via controls ref */ }} className="px-2 py-0.5 border border-white/20 rounded hover:bg-white/5">Helix View</button>
            <button onClick={() => {}} className="px-2 py-0.5 border border-white/20 rounded hover:bg-white/5">Top</button>
            <button onClick={() => {}} className="px-2 py-0.5 border border-white/20 rounded hover:bg-white/5">Inner</button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="absolute bottom-20 left-6 z-20 max-w-sm pointer-events-none">
        <div className="ui-overlay">
          <div className="controls rounded-2xl p-4 text-sm text-white/80 pointer-events-auto">
            The Sun moves through the galaxy. Planets orbit it, tracing beautiful helices (colored trails). Sun glow, rings, moons &amp; asteroid belt added for visual depth.
            <div className="mt-2 text-[10px] text-white/50">
              Drag to look around • Scroll to zoom • Change speed above • Watch the 3D spirals form
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy note */}
      <div className="absolute bottom-6 right-6 z-20 text-right text-[10px] text-white/40 max-w-[220px]">
        Accurate periods + tilt. Artistic scale.
      </div>
    </main>
  );
}
