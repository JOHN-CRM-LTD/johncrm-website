# Integrated product story

Adapted from `C:/Users/wyau7/Documents/johncrm/docs/product-demo/john-crm-brochure.html`, including the red sweatshirt conversation and supplied photograph.

`ProductStory.tsx` mounts the supplied markup and styles in an open shadow root. The story uses the website's native page scroll, so it flows directly into Pricing and Contact. There is no iframe or second scrollbar. React owns the shared header, language preference, currency, pricing, and contact form.

- `story.html`: illustration markup, readable alternative, and embedded brand assets. The product photo placeholder resolves to the Vite-managed JPEG asset.
- `story.css`: the original brochure styling, scoped to the story, plus the small integration overrides at the end.
- `runtime.js`: conversation content, translations, responsive geometry, guided tour, and scroll animation. `runtime.d.ts` defines its React integration contract.
- `../../styles/product-landing.css`: the visual continuation into the website header, pricing, and contact form.

The standalone brochure header is hidden because the site supplies one shared header. Its logo assets remain available to the mock CRM. Demo links open the site's Contact section; Explore plans opens Pricing. Explicit chapter links retain their deep links, while normal story scrolling does not overwrite website anchors. Legacy `#features` and `#chat-demo` links still resolve to the corresponding story chapters.

Every event listener and animation frame belongs to the mounted controller and is released on cleanup. Preserve that lifecycle when editing: React StrictMode mounts the controller twice during development.

The source brochure is an independent deliverable. Later edits to that file are not automatically synchronized into this website; apply content and timing changes to the files above as well.
