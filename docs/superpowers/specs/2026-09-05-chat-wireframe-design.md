# Curved wireframe backdrop

Add a decorative 3D wireframe layer behind the existing Seamless Delivery heading and chat cards. Use an open umbrella for insurance, a shopping bag for retail, a small city for real estate, and an Airbus-style passenger jet for hospitality. Objects are oversized and cropped naturally at the section edges, with thin, faint strokes in the existing industry colours.

Scroll carries each object from right to left along a cylindrical arc. Its horizontal position, depth, scale, yaw, and slight bank change together, giving the impression of moving around a curved monitor. The outgoing object fades at the left edge while the next enters at the right, synchronized to the conversation chapters. Reverse scrolling retraces the motion immediately. Preserve all current text, chat colours, card geometry, and the removed controls/dividers.

The plane sits about 30px lower at a typical desktop viewport. Its final quarter of travel completes the exit before the pinned section releases, with no frozen tail at the end. The timeline remains reversible after the aircraft has left.

Use procedural 3D line geometry projected to a transparent canvas, with no new packages or remote assets. Draw only on scroll, resize, or entry into view. On mobile, place a separate backdrop behind each industry comparison in normal flow. Reduced motion keeps a static illustration; all canvases are decorative, hidden from accessibility APIs, and cannot intercept pointer events.

Verify all four silhouettes, curved right-to-left motion, fast/reverse scroll, desktop/mobile clipping, reduced motion, text readability, and type/build checks. Preserve other work and generated files already present in the checkout.

## Verification

- Checked umbrella canopy, shopping-bag handles, skyline facades, and passenger-jet fuselage/wings in the existing in-app browser at 1280 × 800. Raised the plane and adjusted bag/city scale after inspecting their framing behind the cards.
- Confirmed industry colours, faint depth-weighted lines, unchanged chat copy and geometry, square inner chat corners, and absence of the removed navigation and glow.
- Checked right-to-left chapter progression, overlapping outgoing/incoming objects, immediate fast-scroll state, and reverse scrolling. No new console errors after a clean reload.
- Checked 390 × 844 phone layout: four local decorative canvases, no extra horizontal overflow in the section, and readable conversations. Verified reduced-motion static rendering in EN/CN/HK.
- Typecheck, external-directory production build, and all nine focused chat/wireframe tests passed. The broader suite had 46 passing tests and five previously existing failures outside this change.
- The backdrop is intentional procedural 3D line geometry, with no new text, controls, image assets, network requests, or animation dependency. Screenshots are saved outside the repository in the task visualization directory.
- Plane-exit follow-up: reproduced the old timeline cap at 3.86, added a regression test, and verified an empty background at 3.99 while the hospitality cards remained pinned. All ten focused tests and typecheck passed.
