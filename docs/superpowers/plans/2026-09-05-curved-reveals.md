# Curved Reveals Implementation Plan

**Goal:** Add directional curved performance content and consistent black-bar main headings.

**Architecture:** Extend SectionMotion's existing requestAnimationFrame scroll pass, with pure curve math and stationary wrappers. CSS performs transforms and paired text/bar clipping; React owns setup only.

**Tech Stack:** React, TypeScript, CSS, Node tests, Playwright.

## Follow-up completed: fluid motion and fading dividers

The later user request replaces the stationary interval with continuous slow curve travel. Added scroll-linked drift, earlier progressive card exit fades, and divider opacity as the grid crosses the viewport top. Updated regression tests for continuous motion, on-screen fades, and reversible divider opacity. All 10 focused motion tests, TypeScript, and a temporary-output production build pass. Bundled Playwright/Chrome verified all six blocks at 1440x1000 and 390x844, divider alpha 1 → .5 → 0 → 1, reverse scroll, reduced motion, and no horizontal overflow or app errors. Evidence: `C:/Users/wyau7/AppData/Local/Temp/johncrm-fluid-qa/`.

- [x] Add behavior tests to `tests/section-motion.test.mjs`: opposite entry/exit signs, non-linear arc, exact rest across a wider scroll interval, deterministic reverse traversal, and tall-content visibility. Run `node --test tests/section-motion.test.mjs` and confirm the new helper is missing.
- [x] Implement `getCurveRevealState` in `section-motion-math.ts`: smooth entry from .98 to .70 viewport, exit when the content bottom crosses .18 to -.08 viewport; signed phase `exit - (1 - enter)`, directional x, quadratic y. Keep the original general-purpose lift behavior.
- [x] Extend `Reveal` with optional curve direction and a stationary measurement wrapper. Apply direction to the features heading and six cards. Make MotionLines wipe by default, and use it in the chat heading. Existing visible landing headings already use MotionLines.
- [x] Replace the general line lift with a scroll-controlled version of the existing black-bar/text clips. Preserve timed hero overrides; reset clips and curve transforms for reduced motion and focus. Use actual relative line spacing so tall poster lines reveal individually as they enter the viewport.
- [x] Run `node --test tests/*.test.mjs`, `npm run typecheck`, and a Vite build to a temporary output directory to preserve existing dist changes. Typecheck and build pass; 48/53 tests pass. The five source-text test failures (logo, hero weight, terms link, poster copy, pricing copy) also reproduce against HEAD in a temporary baseline.
- [x] Use available bundled Playwright against the existing johncrm-site server at 127.0.0.1:5174. Browser plugin unavailable; bundled Playwright with Chrome passed desktop 1440x1000 and mobile 390x844 checks, plus the timed hero at 390x600. Verified enter/rest/exit/reverse, heading bar/text clips, individual poster line timing, chat heading pinning, reduced motion, no horizontal overflow, meaningful page content, and no framework overlay or JavaScript errors. The only console error is the existing favicon.ico 404. Screenshots and numerical samples are outside the repo at `C:/Users/wyau7/AppData/Local/Temp/johncrm-curve-qa/`.
