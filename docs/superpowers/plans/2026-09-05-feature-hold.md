# Performance card hold implementation plan

**Goal:** Enter, hold centered, then exit as Seamless Delivery reveals.

**Architecture:** A feature-specific pose function replaces continuous drift only for the six cards. SectionMotion measures the chat heading's stationary Reveal wrapper once per frame and passes it as their shared exit clock. Anchor navigation keeps its aligned entrance. React owns setup; CSS variables own animation.

**Tech stack:** React, TypeScript, existing scroll scheduler and Node tests.

- [x] Replace the obsolete continuous anchor-departure test with entry direction, exact hold, shared exit threshold, continuity, and reverse-scroll assertions in tests/section-motion.test.mjs. Run node --test tests/section-motion.test.mjs to observe the missing behavior.
- [x] Add getFeatureRevealState in src/app/components/section-motion-math.ts, using smooth entrance over .28 viewport and exit over .5 viewport; derive a curved pose from signed phase with exact identity at zero.
- [x] In src/app/components/SectionMotion.tsx measure #chat-demo-heading's closest reveal wrapper before style writes. Apply the feature pose to all six cards, retaining anchor entrance alignment and focus overrides. Mark a settled curve shown to release will-change.
- [x] Run Node tests, npm run typecheck, and an isolated Vite build outside tracked dist. Verify desktop entry, multiple held scroll positions, shared exit, reverse scroll, Features navigation, mobile and reduced motion in the rendered app. Keep QA artifacts outside the repository.

Validation: 13 focused tests and typecheck passed; Vite production build passed. Playwright at 1440x1000 and 390x844 confirmed opposite entry directions, exact centered holds across 167px/155px of scroll, shared opposite exits, reverse scrolling, reduced motion, and no console/page errors. Desktop Features navigation remained aligned. The full suite additionally reported six failures in unchanged logo, hero weight, legal route, poster copy, pricing copy, and wide-layout assertions. Its pages-fallback test rebuilt dist with this change. Browser plugin unavailable; used the existing Playwright installation.
