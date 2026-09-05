# Hero opening animation

The hero headline starts as one black rectangle per line. Each rectangle wipes left to right, revealing stationary text underneath, staggered by 95ms. Existing copy, typography, layout and subsequent scroll behavior stay intact.

The supplied blue ASCII portrait starts as a regular rectangular character field. Characters change at 20fps while a staggered top-to-bottom resolve restores the exact portrait and clears background cells. This takes about 2 seconds, starts after the loader and on first viewport entry, and runs once. A temporary text layer keeps the original per-glyph cursor lens intact without React updates per frame.

Reduced motion shows the final hero immediately. Cleanup cancels frames and observers; changing the preference during playback finishes the portrait. No new dependencies or asset changes.

Validation: frame generation geometry and exact final text, typecheck, existing tests, production build outside tracked dist, desktop/mobile browser captures, reduced motion and cursor lens.
