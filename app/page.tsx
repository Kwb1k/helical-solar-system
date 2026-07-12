import { SolarSystem } from "./components/SolarSystem";

export default function HelicalSolarSystemPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070a]">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Helical Solar System</h1>
          <p className="text-xs text-white/60">Real motion through space • Three.js</p>
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
            onClick={() => window.location.reload()} 
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Reset View
          </button>
        </div>
      </header>

      {/* The 3D Canvas */}
      <div className="canvas-container">
        <SolarSystem />
      </div>

      {/* Bottom info / controls placeholder */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
        <div className="ui-overlay max-w-md">
          <div className="controls rounded-2xl p-4 text-sm text-white/80 pointer-events-auto">
            <p className="mb-2">
              The planets orbit the moving Sun. Their paths through space form beautiful helices because the entire solar system is traveling through the galaxy at high speed.
            </p>
            <div className="text-xs text-white/50">
              Drag to orbit • Scroll to zoom • Time controls coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Legend / accuracy note */}
      <div className="absolute bottom-6 right-6 z-20 text-right text-[10px] text-white/40 max-w-[220px]">
        Photoreal scale cheats applied for visibility.<br />
        Orbital periods and relative motion kept accurate.
      </div>
    </main>
  );
}
