# Hack Tank

Premium, Shark Tank–inspired hackathon website for **JCI Sousse**. Teams build for 48 hours, then pitch their venture live to a panel of investors and mentors — the *Sharks*.

Built with React, TypeScript, Vite and React Router.

## Run

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (default `http://localhost:5173/`).

> If your npm registry is behind Nexus, install with:
> ```bash
> npm install --registry=https://nexus-solutions.rmm.scom/repository/npm/ --strict-ssl=false
> ```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run generate:presentation` | Generate the project scoping deck (`.pptx`) |
| `npm run generate:interface-brief` | Generate the interface & content proposal deck (`.pptx`) |

## Pages

- `/` — landing page: hero, concept, stats, format, tracks, live countdown, sharks, prizes, timeline, idea wall, FAQ, CTA
- `/tracks` — the six tracks and prize deals
- `/sharks` — the full jury/investor panel
- `/ideas` — idea wall with track filtering
- `/faq` — FAQ and contact
- `/register` — five-step registration flow with validation and a success screen

## Architecture

```
src/
  components/   Reusable UI (Navbar, Footer, Layout, Reveal, cards, countdown…)
  pages/        Route-level screens (Home, Tracks, Sharks, Ideas, Faq, Register)
  hooks/        useCountdown, useReveal, useScrollToTop
  data.ts       Event content (tracks, sharks, prizes, timeline, ideas, FAQ)
  types.ts      Shared TypeScript domain types
  styles.css    Responsive design system, motion and theme tokens
  App.tsx       Router and route definitions
  main.tsx      Vite entry point with BrowserRouter
```

## Key features

- Multi-page navigation with React Router
- Fully functional multi-step registration: real validation, `localStorage` draft persistence and submission storage, and a confirmation screen
- Live event countdown, scroll progress bar, scroll-reveal animations, back-to-top button
- Mobile-first, responsive layout with an accessible mobile menu

## Brand

- JCI Blue `#0057B8`, Deep Navy `#0C2340`, Gold accent `#F4B400`
- Typography: Syne (display) + DM Mono (labels)

## Related documents

- `Hack_Tank_Cadrage_JCI_Sousse.pptx` — product / UX / communication scoping deck
- `Hack_Tank_Proposition_Interfaces_Contenus.pptx` — interface & content proposal deck
- `GUIDE_CADRAGE_SITE_HACKATHON.md` — French scoping guide for the organizing team
