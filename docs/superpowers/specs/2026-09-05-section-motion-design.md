# Section transition motion

Keep the current JOHN CRM layout, copy, language support, colors, ASCII artwork, and interactive chat sequence. Add a coordinated motion layer to the existing page, implemented inline without a design companion.

The background is one solid surface shared by transparent sections. As the next section enters the viewport, scroll position continuously interpolates this surface between white, paper (#f8f8f6), and black. There are no spatial color gradients, transition bands, or scanning divider lines. The existing faint grid also fades with the section tone. Exposed headings use contrasting ink during the transition; product windows keep their local colors.

Heading lines rise through masks with staggered movement. Content moves up and fades in, holds steady through a generous reading interval, then fades near the top edge. These effects track scrolling in both directions and hold their pose when scrolling stops. Features animate individually within the unchanged grid. The poster uses staggered lines; pricing and contact share the same motion vocabulary.

The hero also has a timed opening after the loader completes and a small desktop artwork parallax. Seamless Delivery introduces its heading and panels with inward movement while preserving the existing sticky stage, scroll-only industry sequence, and message choreography. Native scrolling remains in control: no additional pinning, scroll snapping, animation dependency, routes, content, or decorative labels.

Use a passive, requestAnimationFrame-coalesced scroll listener. Read geometry before writing CSS variables, subtract the controller's own translation from measurements, and avoid React renders on scroll. Observe resizing and font readiness; clean up listeners on unmount, language changes, and motion preference changes. Small viewports use shorter travel and no parallax. Reduced motion keeps the original static section colors and immediately visible content. Keyboard focus immediately reveals controls.

Verify intermediate and reversed background colors, no gradient at section boundaries, reversible heading/content movement, stable paused poses, desktop/mobile scrolling, sticky chat chapters, anchor navigation, all languages, keyboard focus, reduced motion, overflow, and runtime errors. Run typecheck, build, and tests, distinguishing unrelated existing failures.
