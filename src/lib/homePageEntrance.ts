/** Reveal the home page in browsers without cross-document view transitions. */
export function createHomePageEntrance(main: HTMLElement) {
  if (Reflect.has(window, 'onpagereveal')) return () => {};

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;
  const cancel = () => animation?.cancel();
  const reveal = () => {
    cancel();
    if (motion.matches) return;
    animation = main.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 420,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
    });
  };
  const restore = (event: PageTransitionEvent) => {
    if (event.persisted) reveal();
  };

  reveal();
  window.addEventListener('pageshow', restore);
  motion.addEventListener('change', cancel);
  return () => {
    cancel();
    window.removeEventListener('pageshow', restore);
    motion.removeEventListener('change', cancel);
  };
}
