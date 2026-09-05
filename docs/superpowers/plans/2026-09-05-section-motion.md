# Section motion implementation plan

**Goal:** Replace static gradient bands and one-shot entrances with actual scroll-driven background fades and visible, reversible section motion.

**Architecture:** MotionPage measures native section positions and reusable Reveal wrappers, then writes CSS variables for a shared solid backdrop and content poses. Pure math functions define tone interpolation and reading intervals. MotionLines retains semantic heading text. The chat demo retains its own scroll behavior.

**Tech stack:** Existing React, TypeScript, CSS, ResizeObserver, requestAnimationFrame. Execute inline in this checkout, preserving concurrent work.

- [x] Add `section-motion-math.ts` with continuous theme interpolation, contrasting ink, and reversible entry/exit poses. Cover intermediate colors, reversal, reading intervals, and contrast with focused tests.
- [x] Update `SectionMotion.tsx` to measure scroll-driven state without transform feedback, batch reads before writes, and handle loading, resize, font readiness, focus, live reduced motion, language changes, and cleanup.
- [x] Replace gradient bands in `section-motion.css` with transparent sections and one interpolated background. Add masked lines, content rise/fade, chat panel convergence, desktop parallax, responsive travel, and static reduced-motion styles.
- [x] Integrate the motion primitives into `src/app/App.tsx` and add entrance markers to `src/app/components/ChatDemo.tsx`. Preserve section sizing, language copy, the current chat state machine, and all links.
- [x] Run `npm run typecheck`, `npm run build`, and `node --test tests/*.test.mjs`. Typecheck/build pass; all six motion tests pass. The full suite has 46 passes and five existing source-pattern failures (logo placement, hero weight, terms route, poster copy, and pricing copy).
- [x] Inspect the rendered page through the in-app browser and focused Playwright checks at desktop and mobile sizes. Uniform intermediate colors, reverse scrolling, stable paused poses, chat scrolling, anchors, languages, focus, reduced motion, screenshots, and overflow checks pass. The only console warning is the existing missing favicon. QA artifacts remain in the system temporary directory.
