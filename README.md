# Hack Tank

Premium hackathon landing page and registration experience for JCI Sousse.

## Architecture

- `src/main.tsx` — Vite entry point
- `src/App.tsx` — page routing state, landing sections, registration flow
- `src/styles.css` — responsive visual system, motion, layout, and theme tokens
- `src/data.ts` — event content collections
- `src/types.ts` — shared TypeScript domain types

The first screen is the landing page. `Join the tank` opens the five-step registration experience; submission ends in a confirmation state. The experience is intentionally dependency-light in source, with React as the UI runtime and Vite as the build tool.

## Run

```bash
npm install
npm run dev
```

The current environment could not reach the npm registry, so dependencies still need to be installed before running the build.
