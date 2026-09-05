export type PageTone = 'paper' | 'light' | 'dark';
export type ToneStop = { top: number; tone: PageTone; grid: number };

const COLORS: Record<PageTone, readonly number[]> = {
  paper: [248, 248, 246], light: [255, 255, 255], dark: [0, 0, 0],
};
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const rgb = (color: readonly number[]) => `rgb(${color.map(Math.round).join(', ')})`;

/** A single solid backdrop changes with scroll position, never with a spatial gradient. */
export function getPageTone(stops: readonly ToneStop[], viewport: number) {
  let color = [...COLORS[stops[0]?.tone ?? 'paper']];
  let grid = stops[0]?.grid ?? 1;
  for (const stop of stops.slice(1)) {
    const amount = smooth((viewport * .9 - stop.top) / Math.max(1, viewport * .68));
    if (amount === 0) break;
    color = color.map((channel, index) => channel + (COLORS[stop.tone][index] - channel) * amount);
    grid += (stop.grid - grid) * amount;
  }
  color = color.map(Math.round);
  const linear = color.map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  // Choose contrasting ink throughout the fade; retain the brand's soft black at rest.
  const ink = luminance > .179 ? (luminance > .25 ? 12 : 0) : 255;
  return { background: rgb(color), foreground: rgb([ink, ink, ink]), grid };
}

/** Keep a generous reading interval; only enter/exit near the viewport edges. */
export function getRevealState(top: number, height: number, viewport: number, delay = 0, distance = 64) {
  const enter = smooth((viewport * .96 - top - delay * .22) / Math.max(1, viewport * .42));
  const exit = smooth((viewport * .12 - (top + height)) / Math.max(1, viewport * .14));
  return { enter, exit, opacity: enter * (1 - exit), y: (1 - enter) * distance - exit * 28 };
}

export type CurveDirection = 'left' | 'right';

/** Settle at identity until Seamless Delivery starts revealing. Both rows use
 * that same exit clock, independent of their vertical positions in the grid. */
export function getFeatureRevealState(top: number, viewport: number, width: number, from: CurveDirection,
  deliveryTop: number, anchorDelta?: number) {
  const enter = smooth(anchorDelta === undefined
    ? (viewport * .98 - top) / Math.max(1, viewport * .28)
    : 1 + anchorDelta / Math.max(1, viewport * .28));
  const exit = smooth((viewport * .98 - deliveryTop) / Math.max(1, viewport * .5));
  const phase = exit - (1 - enter);
  const x = phase === 0 ? 0 : (from === 'left' ? 1 : -1) * phase * width * .8;
  const radius = width * 1.35;
  const angle = Math.atan(x / Math.max(1, radius));
  return {
    enter, exit, opacity: 1, x, y: 0,
    z: (1 - Math.cos(angle)) * radius,
    rotateY: angle === 0 ? 0 : -angle * 180 / Math.PI,
  };
}

/** Slow drift connects the entrance and exit so scrolling never hits a frozen pose. */
export function getCurveRevealState(top: number, height: number, viewport: number, from: CurveDirection, delay = 0,
  screen: { viewportWidth: number; center: number } = { viewportWidth: 1440, center: 720 }) {
  const enter = smooth((viewport * .98 - top - delay * .12) / Math.max(1, viewport * .28));
  const exit = smooth((viewport * .32 - (top + height)) / Math.max(1, viewport * .4));
  const drift = (clamp((viewport - top) / Math.max(1, viewport + height)) - .5) * .65;
  const phase = exit - (1 - enter) + drift;
  // All blocks share the monitor's inward-curving surface. Its edges come
  // toward the viewer, and travel scales with the viewport rather than a card.
  const radius = screen.viewportWidth * 1.35;
  const offset = screen.center - screen.viewportWidth / 2;
  const lateral = offset + (from === 'left' ? 1 : -1) * phase * screen.viewportWidth * .8;
  const angle = Math.max(-1.1, Math.min(1.1, lateral / radius));
  return {
    enter, exit, opacity: 1,
    x: Math.sin(angle) * radius - offset,
    y: 0,
    z: (1 - Math.cos(angle)) * radius,
    rotateY: -angle * 180 / Math.PI,
  };
}

/** Let the grid dissolve as its top moves through the upper fifth of the viewport. */
export function getFeatureDividerOpacity(top: number, viewport: number) {
  return 1 - smooth((viewport * .2 - top) / Math.max(1, viewport * .4));
}
