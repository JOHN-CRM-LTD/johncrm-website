# Hero intro implementation plan

**Goal:** Black-bar headline wipes and a rectangular ASCII field resolving into John.

**Architecture:** Hero-only CSS wipe; pure ASCII frame generator and an imperative temporary pre layer. Keep existing scroll and lens components.

**Tech Stack:** React, TypeScript, CSS, Node tests, Playwright.

- [x] Verify rectangular opening, changing frames, unchanged dimensions and exact final portrait with Node tests in tests/hero-intro.test.mjs.
- [x] Implement src/lib/asciiIntro.ts and src/lib/useAsciiIntro.ts; attach a decorative pre in HeroMockup with inherited font metrics.
- [x] Replace hero-only entrance keyframes in section-motion.css with matching text/bar clips. Leave other heading entrances intact.
- [x] Run Node tests and typecheck; build to a temporary output directory. Capture desktop entrance, resolved portrait and mobile; verify reduced motion and lens behavior.

