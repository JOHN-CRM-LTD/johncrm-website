# ASCII circular hover implementation

Goal: replace the lens with a circular animation of the existing ASCII text.

1. Rename the portrait hook to `useAsciiTextRipple`; retain the grid, geometry measurement, pointer tracking, and cleanup. Replace transform writes with original-character-aware text writes using a radial wave and rotating phase. Clear characters on exit and when hidden; gate live reduced-motion changes.
2. Wire the hook in `src/app/App.tsx`, remove lens strength markup, and update its accessible description. Update the existing portrait test's obsolete lens contract.
3. Run `npm run typecheck`, `node --test`, and compile with Vite to a temporary directory so existing dist edits remain intact. Use bundled Playwright against the existing site at `http://127.0.0.1:5174`: hover the portrait, compare successive text frames, verify the changed glyphs stay within the circular radius without transforms, leave and verify exact restoration, focus and blur, and exercise reduced motion and mobile. Save evidence outside the repository.

Execution: inline per the user's instructions; preserve existing dirty work and leave changes uncommitted.
