// Accurate-ish solar system data for helical visualization
// Values are standard (semi-major axis in AU, period in Earth years, etc.)
// Visual scales are artistic and will be applied in the component.

export type PlanetData = {
  name: string;
  a: number;           // semi-major axis (AU)
  period: number;      // sidereal orbital period (Earth years)
  e: number;           // eccentricity
  incl: number;        // inclination to ecliptic (degrees)
  visualRadius: number;// exaggerated for visibility (scene units)
  color: string;       // fallback color
  texture?: string;    // base name in /public/textures/ (e.g. "earth")
  hasRings?: boolean;
  moons?: { name: string; distance: number; size: number; period: number }[];
};

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    a: 0.387,
    period: 0.241,
    e: 0.2056,
    incl: 7.0,
    visualRadius: 1.2,
    color: "#9ca3af",
    texture: "mercury",
  },
  {
    name: "Venus",
    a: 0.723,
    period: 0.615,
    e: 0.0068,
    incl: 3.39,
    visualRadius: 1.5,
    color: "#e2c99a",
    texture: "venus",
  },
  {
    name: "Earth",
    a: 1.0,
    period: 1.0,
    e: 0.0167,
    incl: 0.0,
    visualRadius: 1.6,
    color: "#6b9ac4",
    texture: "earth",
    moons: [{ name: "Moon", distance: 2.2, size: 0.27, period: 0.0748 }],
  },
  {
    name: "Mars",
    a: 1.524,
    period: 1.881,
    e: 0.0934,
    incl: 1.85,
    visualRadius: 1.3,
    color: "#c17a5e",
    texture: "mars",
  },
  {
    name: "Jupiter",
    a: 5.203,
    period: 11.862,
    e: 0.0484,
    incl: 1.304,
    visualRadius: 3.5,
    color: "#d8b47e",
    texture: "jupiter",
    moons: [
      { name: "Io", distance: 4.2, size: 0.35, period: 0.0048 },
      { name: "Europa", distance: 5.0, size: 0.3, period: 0.0096 },
    ],
  },
  {
    name: "Saturn",
    a: 9.58,
    period: 29.457,
    e: 0.0542,
    incl: 2.485,
    visualRadius: 3.2,
    color: "#e8d5a3",
    texture: "saturn",
    hasRings: true,
  },
  {
    name: "Uranus",
    a: 19.2,
    period: 84.02,
    e: 0.0472,
    incl: 0.77,
    visualRadius: 2.5,
    color: "#b3d4e8",
    texture: "uranus",
  },
  {
    name: "Neptune",
    a: 30.05,
    period: 164.79,
    e: 0.0086,
    incl: 1.77,
    visualRadius: 2.5,
    color: "#5b7c9e",
    texture: "neptune",
  },
];

export const SUN_RADIUS = 1.8;

// Visual tuning constants (tweak for beauty while keeping relative accuracy)
export const DISTANCE_SCALE = 7.5;   // scene units per AU
export const GALACTIC_SPEED = 0.85;  // how fast the Sun advances (visual)
export const TILT_DEGREES = 60;      // ecliptic vs galactic motion plane
export const MAX_TRAIL_POINTS = 520;
