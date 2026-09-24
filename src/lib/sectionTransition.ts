/** Fade the content around a direct section jump, keeping the header in place. */
export function createSectionTransition(landing: HTMLElement) {
  const surfaces = Array.from(landing.querySelectorAll<HTMLElement>(':scope > main, :scope > footer'));
  let animations: Animation[] = [];
  let frame = 0;
  let revision = 0;

  const cancel = () => {
    revision += 1;
    cancelAnimationFrame(frame);
    animations.forEach((animation) => animation.cancel());
    animations = [];
  };

  const run = (navigate: () => void) => {
    // A second click takes over from the current opacity; stale jumps never run.
    const opacity = surfaces.map((surface) => getComputedStyle(surface).opacity);
    cancel();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !surfaces.length) {
      navigate();
      return;
    }

    const current = revision;
    animations = surfaces.map((surface, index) => surface.animate(
      [{ opacity: opacity[index] }, { opacity: 0 }],
      { duration: 90, easing: 'ease-out', fill: 'forwards' },
    ));
    void Promise.all(animations.map((animation) => animation.finished)).then(() => {
      if (current !== revision) return;
      navigate();
      // Let scroll-driven artwork and the header settle before revealing the destination.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (current !== revision) return;
          animations.forEach((animation) => animation.cancel());
          animations = surfaces.map((surface) => surface.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 180, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' },
          ));
          void Promise.all(animations.map((animation) => animation.finished))
            .then(() => { if (current === revision) cancel(); })
            .catch(() => { /* A newer navigation or unmount cancelled the fade. */ });
        });
      });
    }).catch(() => { /* A newer navigation or unmount cancelled the fade. */ });
  };

  return { run, destroy: cancel };
}
