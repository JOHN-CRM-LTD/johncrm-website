# Pricing and contact entrances

Animate each pricing card upward with the existing scroll-driven Reveal component. PLUS leads, PRO follows while PLUS is moving, and Custom follows last. Use delays of 0, 240, and 480 in the existing scroll clock. Retain card geometry, prices, billing controls, links, and the popular badge. Stacked mobile cards enter individually as they reach the viewport. Existing reduced-motion and keyboard-focus fallbacks remain active.

Rename the first two display names to PLUS and PRO in English, Simplified Chinese, and Traditional Chinese, including inherited-feature references. Preserve internal pricing keys.

Give the contact heading its own heading Reveal so its existing MotionLines use the same left-to-right black bar wipe as Transparent Pricing. Keep the contact details in a separate lift Reveal.

Implement inline as requested. Verify scroll poses and overlap, billing controls, heading wipe progression, mobile layout, reduced motion, typecheck, build, and existing tests.

Follow-up: increase pricing-only entrance travel from 64px to 220px (existing mobile scaling applies) and delays to 0/320/640 for more drama. Remove the grid background so no stationary rectangle shows behind the moving cards. Preserve individual card surfaces and borders, settled geometry, and the shared exit motion.
