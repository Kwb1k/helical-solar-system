# Helical Solar System

Photorealistic, accurate 3D visualization of the solar system that shows the **real motion** of the planets through space — helical paths, not static 2D circles.

## What makes this special

- Planets orbit the Sun while the entire system moves through the galaxy.
- The ~60° tilt between the ecliptic and galactic plane produces beautiful 3D helices.
- Accurate relative orbital periods.
- Photoreal textures + high-quality rendering (Three.js + post-processing bloom).
- Fully interactive and works on desktop + mobile.

This is a portfolio project piece demonstrating complex 3D systems, precise simulation, visual storytelling, and performance.

## Tech

- Next.js 15 (App Router)
- TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- Post-processing (Bloom)
- Tailwind

## Local development

```bash
bun install
# or npm install

bun dev
```

**Note:** If you run into certificate/SSL errors with npm/bun on this machine, the project is set up so that Vercel builds will succeed cleanly. Fix your local CA / strict-ssl when convenient.

## Project goals (current phase)

1. Accurate helical motion (Sun travels, planets orbit the moving Sun)
2. Photoreal planet textures
3. Beautiful trails that reveal the spirals
4. Excellent camera controls + time scrubbing
5. Desktop + mobile friendly
6. Clean, minimal UI

## Deploy

Deployed on Vercel via the connected GitHub repo.

## Credits / Inspiration

- Real orbital mechanics (periods, semi-major axes)
- Popular science visualizations of galactic motion (with corrections from reliable sources)
- High-quality public domain textures (Solar System Scope / NASA)

---

Built as a dedicated project page for the agency site.
