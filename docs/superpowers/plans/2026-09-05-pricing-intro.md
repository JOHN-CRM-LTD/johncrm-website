# Pricing intro implementation plan

**Goal:** Stagger pricing card entrances, rename PLUS/PRO, and match contact heading wipes.
**Architecture:** Reuse Reveal and MotionLines in src/app/App.tsx; no new animation engine or dependencies.
**Tech stack:** React, TypeScript, existing scroll CSS, Vite.

- [x] Replace pricing display names and inherited-feature references across all three SITE_COPY languages with PLUS/PRO; keep starter/growth price keys.
- [x] Replace the pricing grid's outer Reveal with a stationary div; map `(p, index)` and render each card as `<Reveal key={p.name} delay={index * 240} className={...}>` using the original card classes.
- [x] Wrap contact label and h2 in `<Reveal kind="heading">`; keep remaining contact copy in its existing lift Reveal.
- [x] Use existing tests, typecheck, and Vite build to a temporary output directory. Check rendered desktop/mobile scroll positions, overlapping ordered upward travel, billing changes, contact wipe direction, reduced motion, and console errors using bundled Playwright (Browser plugin unavailable).

No commits or generated dist replacements are part of this change. Execute inline in the current checkout to preserve existing work.

- [x] Follow-up: expose a 64px default entrance distance in Reveal/getRevealState, apply 220px and index * 320 delays only to pricing, and remove the grid background. Verify larger ordered travel, transparent backing, stable paused/reversed poses, desktop/mobile, reduced motion, billing, typecheck, 16 focused tests, and the production build.
