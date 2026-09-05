import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { getFeatureRevealState, getCurveRevealState, getFeatureDividerOpacity, getPageTone, getRevealState, type CurveDirection, type PageTone } from './section-motion-math';
import '../../styles/section-motion.css';
import { getHeroExitProgress } from './hero-exit-math';
import '../../styles/hero-exit.css';

function setStyle(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
}

/** Scroll is the clock for the backdrop, type, and content. React only owns setup. */
export function MotionPage({ children, ready, language }: {
  children: ReactNode;
  ready: boolean;
  language: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const page = ref.current;
    if (!page) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    let dispose = () => {};

    const configure = () => {
      dispose();
      delete page.dataset.motionReady;
      if (!ready || preference.matches) return;

      const sections = Array.from(page.querySelectorAll<HTMLElement>(':scope > section')).map(element => ({
        element,
        tone: (element.dataset.motionSection === 'dark' ? 'dark' :
          ['features', 'contact', 'clients'].includes(element.id) ? 'light' : 'paper') as PageTone,
        grid: element.id === 'top' || element.id === 'chat-demo' || element.dataset.motionSection === 'dark' ? 1 : 0,
      }));
      // Actions skip the generic reveal; the hero action travels with its content group.
      const targets = Array.from(page.querySelectorAll<HTMLElement>('[data-motion-reveal]:not([data-motion-reveal="action"])')).map(element => ({
        element,
        kind: element.dataset.motionReveal,
        delay: Number(element.dataset.motionDelay || 0),
        distance: Number(element.dataset.motionDistance || 64),
        curve: element.dataset.motionCurve as CurveDirection | undefined,
        feature: element.closest('.feature-grid') !== null,
        hero: element.closest('#top') !== null,
        lines: Array.from(element.querySelectorAll<HTMLElement>('.motion-line-inner')),
        y: 0,
      }));
      const heroExits = Array.from(page.querySelectorAll<HTMLElement>('[data-hero-exit]')).map(element => ({
        element,
        anchor: element.parentElement!,
        entrance: targets.find(target => target.element === element.parentElement),
      }));
      const featureGrid = page.querySelector<HTMLElement>('[data-motion-dividers]');
      const featureSection = featureGrid?.closest('section');
      const deliveryHeading = page.querySelector('#chat-demo-heading')?.closest<HTMLElement>('[data-motion-reveal]');
      let featureAnchorActive = window.location.hash === '#features';
      let frame = 0;
      let disposed = false;

      const measure = () => {
        frame = 0;
        if (disposed) return;
        const viewport = window.innerHeight;
        const scroll = window.scrollY;
        const travel = desktop.matches ? 1 : .55;
        // Read all geometry before changing styles. Subtract our last translation so
        // the animation never feeds its own transformed position back into its clock.
        const stops = sections.map(({ element, tone, grid }) => ({ top: element.getBoundingClientRect().top, tone, grid }));
        const positions = targets.map(target => {
          const rect = target.element.getBoundingClientRect();
          const focused = target.element.matches(':focus-within');
          // Relative line spacing cancels the shared curve transform. Large poster
          // lines must each reach the viewport before their own wipe starts.
          const lineTops = target.kind === 'heading' ? target.lines.map(line => line.getBoundingClientRect().top) : [];
          const lineOffsets = lineTops.map(lineTop => lineTop - lineTops[0]);
          return { target, top: rect.top - (focused ? 0 : target.y), center: rect.left + rect.width / 2, height: target.element.offsetHeight, focused, lineOffsets };
        });
        const exitPositions = heroExits.map(({ element, anchor, entrance }) => ({
          element,
          // The artwork's reveal wrapper may still carry its previous entrance lift
          // after a large scroll jump. Remove it from the exit's stationary clock.
          top: anchor.getBoundingClientRect().top - (anchor.matches(':focus-within') ? 0 : entrance?.y ?? 0),
          height: anchor.offsetHeight,
          focused: anchor.matches(':focus-within'),
        }));
        const gridTop = featureGrid?.getBoundingClientRect().top;
        // Read the stationary heading wrapper, matching its text reveal threshold.
        const deliveryTop = deliveryHeading?.getBoundingClientRect().top ?? Infinity;
        const anchorDelta = featureAnchorActive && featureSection
          ? parseFloat(getComputedStyle(featureSection).scrollMarginTop) - featureSection.getBoundingClientRect().top
          : null;
        const tone = getPageTone(stops, viewport);
        setStyle(page, '--curve-perspective', `${window.innerWidth * 2.5}px`);
        setStyle(page, '--page-background', tone.background);
        setStyle(page, '--page-ink', tone.foreground);
        setStyle(page, '--page-grid', tone.grid.toFixed(3));
        if (featureGrid && gridTop !== undefined) {
          setStyle(featureGrid, '--feature-lines-opacity', getFeatureDividerOpacity(gridTop, viewport).toFixed(4));
        }

        for (const { target, top, center, height, focused, lineOffsets } of positions) {
          let state = focused ? { enter: 1, exit: 0, opacity: 1, x: 0, y: 0, z: 0, rotateY: 0 } : target.curve ?
            getCurveRevealState(top, height, viewport, target.curve, target.delay, { viewportWidth: window.innerWidth, center }) :
            { ...getRevealState(top, height, viewport, target.delay, target.distance), x: 0, z: 0, rotateY: 0 };
          // The hero retains its entrance; its dedicated inner layers own departure.
          if (target.hero) state = { ...state, exit: 0, opacity: state.enter, y: (1 - state.enter) * target.distance };
          if (!focused && target.feature && target.curve) {
            state = getFeatureRevealState(top, viewport, window.innerWidth, target.curve, deliveryTop,
              anchorDelta === null ? undefined : Math.abs(anchorDelta) < .5 ? 0 : anchorDelta);
          }
          const distanceScale = target.curve ? 1 : travel;
          const translated = !target.curve && (target.kind === 'lift' || target.kind === 'artwork');
          target.y = translated ? state.y * travel : 0;
          setStyle(target.element, '--reveal-x', `${(state.x * distanceScale).toFixed(2)}px`);
          if (target.curve) {
            setStyle(target.element, '--reveal-z', `${state.z.toFixed(2)}px`);
            setStyle(target.element, '--reveal-rotate-y', `${state.rotateY.toFixed(2)}deg`);
          }
          setStyle(target.element, '--reveal-opacity', state.opacity.toFixed(4));
          setStyle(target.element, '--reveal-y', `${(state.y * travel).toFixed(2)}px`);
          setStyle(target.element, '--reveal-enter', state.enter.toFixed(4));
          setStyle(target.element, '--reveal-exit', state.exit.toFixed(4));
          const settled = state.opacity === 1 && (!target.curve || (state.x === 0 && state.z === 0 && state.rotateY === 0));
          const status = state.opacity === 0 ? 'hidden' : settled ? 'shown' : 'moving';
          if (target.element.dataset.motionState !== status) target.element.dataset.motionState = status;
          if (target.kind === 'heading') {
            target.lines.forEach((line, index) => {
              const pose = focused ? state : getCurveRevealState(top + lineOffsets[index], height, viewport, 'left', target.delay);
              setStyle(line, '--line-opacity', target.curve ? '1' : (1 - state.exit).toFixed(4));
              setStyle(line, '--line-wipe', target.curve ? '100%' : `${(pose.enter * 100).toFixed(3)}%`);
            });
          }
        }

        for (const { element, top, height, focused } of exitPositions) {
          const progress = focused ? 0 : getHeroExitProgress(top, height, viewport,
            element.dataset.heroExit === 'portrait' ? undefined : scroll);
          setStyle(element, '--hero-exit', progress.toFixed(4));
        }
      };
      const schedule = () => {
        if (!frame && !disposed) frame = requestAnimationFrame(measure);
      };
      const navigateFeatures = (event: MouseEvent) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest('a[href="#features"]') : null;
        if (!link) return;
        featureAnchorActive = true;
        schedule();
      };
      const navigateHash = () => {
        featureAnchorActive = window.location.hash === '#features';
        schedule();
      };
      const resize = new ResizeObserver(schedule);
      resize.observe(page);
      sections.forEach(({ element }) => resize.observe(element));
      measure();
      page.dataset.motionReady = 'true';
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('hashchange', navigateHash);
      document.addEventListener('click', navigateFeatures);
      window.addEventListener('resize', schedule);
      page.addEventListener('focusin', schedule);
      page.addEventListener('focusout', schedule);
      desktop.addEventListener('change', schedule);
      document.fonts.ready.then(schedule);

      dispose = () => {
        disposed = true;
        resize.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('hashchange', navigateHash);
        document.removeEventListener('click', navigateFeatures);
        window.removeEventListener('resize', schedule);
        page.removeEventListener('focusin', schedule);
        page.removeEventListener('focusout', schedule);
        desktop.removeEventListener('change', schedule);
        cancelAnimationFrame(frame);
        heroExits.forEach(({ element }) => {
          element.style.removeProperty('--hero-exit');
        });
      };
    };

    configure();
    preference.addEventListener('change', configure);
    return () => {
      dispose();
      preference.removeEventListener('change', configure);
      delete page.dataset.motionReady;
    };
  }, [ready, language]);

  return <main ref={ref} className="motion-page"><div className="motion-backdrop" aria-hidden="true" />{children}</main>;
}

export function Reveal({ children, delay = 0, distance = 64, className = '', kind = 'lift', curve }: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  kind?: 'lift' | 'heading' | 'artwork' | 'action';
  curve?: CurveDirection;
}) {
  return (
    <div
      data-motion-reveal={kind}
      data-motion-delay={delay}
      data-motion-distance={distance}
      data-motion-curve={curve}
      className={className}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {curve ? <div className="motion-curve-content">{children}</div> : children}
    </div>
  );
}

export function MotionLines({ lines, wipe = true }: { lines: readonly string[]; wipe?: boolean }) {
  return <>{lines.map((line, index) => (
    <span className="motion-line" key={line}>
      <span className="motion-line-inner" style={{ '--line-index': index } as CSSProperties}>
        {wipe ? <span className="motion-wipe-text">{line}</span> : line}
      </span>
      {index < lines.length - 1 && <br />}
    </span>
  ))}</>;
}
