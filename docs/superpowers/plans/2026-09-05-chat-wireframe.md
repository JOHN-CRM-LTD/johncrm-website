# Chat Wireframe Implementation Plan

**Goal:** Add faint industry wireframes that follow a curved right-to-left scroll path behind the existing demo.

**Architecture:** Pure geometry and projection helpers feed a decorative React canvas component. The component derives the same chapter position as the chat scroll timeline and uses a bounded requestAnimationFrame callback, passive listeners, and visibility/resize observers.

**Tech Stack:** Existing React, TypeScript, Canvas 2D, node:test. Execute inline in this workspace as requested.

- [x] Add focused tests in `tests/chat-wireframe.test.mjs` for finite 3D geometry, monotonic right-to-left travel, perspective depth, and clamped chapter selection.
- [x] Create `src/app/components/chat-wireframe-geometry.ts` with umbrella, bag, city, jet meshes, curved poses, and perspective projection.
- [x] Create `src/app/components/ChatWireframeBackdrop.tsx` with decorative canvas rendering, scroll/resize/visibility lifecycle, and static reduced-motion handling.
- [x] Insert the backdrop into the pinned stage and each mobile article in `ChatDemo.tsx`; scope its clipping and stacking in `chat-demo.css`.
- [x] Run focused tests and typecheck, build into an external temporary directory, and inspect all industries in the existing browser at desktop/mobile sizes. Save review screenshots outside the repository and verify them with view_image.
