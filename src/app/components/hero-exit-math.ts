/** Stationary element geometry is the clock, so stacked layouts and reverse scroll agree. */
export function getHeroExitProgress(top: number, height: number, viewport: number, textScroll?: number) {
  const distance = Math.max(1, Math.min(viewport * .6, Math.max(height * .8, viewport * .3)));
  // Text needs room for the reverse wipe before reaching the fixed header. Its document-space
  // origin caps that threshold so even short/mobile first viewports start intact.
  const start = textScroll === undefined ? viewport * .12 : Math.min(viewport * .28, top + textScroll - 24);
  const progress = Math.min(1, Math.max(0, (start - top) / distance));
  return progress * progress * (3 - 2 * progress);
}
