# ASCII circular hover

Replace the portrait's magnifying bulge with changing ASCII glyphs in a circular area centered on the pointer. A repeating radial wave and rotating character phase make the circle animate even with a stationary pointer. Keep glyph positions, size, color, whitespace, portrait asset, and entrance animation intact. Restore original characters as the circle moves away or hover ends. Keyboard focus activates the same effect at the center; reduced motion and touch remain static.

Use the existing per-glyph DOM grid and bounded animation loop. No canvas, overlay circle, dependencies, or React render per frame. Verify actual text changes within the circle, animation over time, unchanged geometry, restoration, keyboard focus, reduced motion, mobile layout, typecheck, existing tests, and production compilation.
