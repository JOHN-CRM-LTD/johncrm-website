import { useLayoutEffect, useRef, type RefObject } from 'react';
import { createAsciiIntroFrame } from './asciiIntro';

/** One temporary text node animates; the accessible portrait and hover ripple stay untouched. */
export function useAsciiIntro(text: string, containerRef: RefObject<HTMLDivElement>) {
  const introRef = useRef<HTMLPreElement>(null);
  useLayoutEffect(() => {
    const container = containerRef.current;
    const overlay = introRef.current;
    const page = container?.closest('.motion-page');
    if (!container || !overlay || !page) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let started = false;
    let visible = false;
    let start = 0;
    let lastStep = -1;
    const finish = () => {
      cancelAnimationFrame(frame);
      container.dataset.asciiIntro = 'done';
      overlay.textContent = '';
    };
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      if (elapsed >= 2100) { finish(); return; }
      const step = Math.floor(elapsed / 50);
      if (step !== lastStep) {
        overlay.textContent = createAsciiIntroFrame(text, elapsed / 2100);
        lastStep = step;
      }
      frame = requestAnimationFrame(tick);
    };
    const begin = () => {
      if (started || preference.matches || !visible || !page.hasAttribute('data-motion-ready')) return;
      started = true;
      container.dataset.asciiIntro = 'running';
      frame = requestAnimationFrame(tick);
    };
    const prepare = () => {
      if (preference.matches) { started = true; finish(); return; }
      overlay.textContent = createAsciiIntroFrame(text, 0);
      container.dataset.asciiIntro = 'pending';
    };
    prepare();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      begin();
    }, { threshold: .15 });
    observer.observe(container);
    const readyObserver = new MutationObserver(begin);
    readyObserver.observe(page, { attributes: true, attributeFilter: ['data-motion-ready'] });
    const onPreference = () => { if (preference.matches) { started = true; finish(); } };
    preference.addEventListener('change', onPreference);
    return () => {
      finish();
      observer.disconnect();
      readyObserver.disconnect();
      preference.removeEventListener('change', onPreference);
      delete container.dataset.asciiIntro;
    };
  }, [text, containerRef]);
  return introRef;
}
