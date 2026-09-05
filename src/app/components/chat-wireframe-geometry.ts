export type WirePoint = [number, number, number];
type WirePath = WirePoint[];
export type WireModel = { name: string; color: string; paths: WirePath[]; pitch: number; yaw: number; size: number; lift?: number };
const TAU = Math.PI * 2;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a: WirePoint, b: WirePoint, t: number): WirePoint => a.map((v, i) => v + (b[i] - v) * t) as WirePoint;
const curve = (sample: (t: number) => WirePoint, steps = 32): WirePath => Array.from({ length: steps + 1 }, (_, i) => sample(i / steps));

function patch(paths: WirePath[], a: WirePoint, b: WirePoint, c: WirePoint, d: WirePoint, columns = 8, rows = 10) {
  for (let i = 0; i <= columns; i++) paths.push([mix(a, b, i / columns), mix(d, c, i / columns)]);
  for (let i = 0; i <= rows; i++) paths.push([mix(a, d, i / rows), mix(b, c, i / rows)]);
}

function umbrella(): WirePath[] {
  const paths: WirePath[] = [];
  const canopy = (radius: number, angle: number): WirePoint => [
    1.65 * Math.sin(radius * Math.PI / 2) * Math.cos(angle),
    .25 + 1.02 * Math.cos(radius * Math.PI / 2) - .11 * radius ** 5 * Math.abs(Math.sin(angle * 4)),
    1.65 * Math.sin(radius * Math.PI / 2) * Math.sin(angle),
  ];
  for (let rib = 0; rib < 32; rib++) paths.push(curve(t => canopy(t, rib / 32 * TAU), 24));
  for (let ring = 1; ring <= 13; ring++) paths.push(curve(t => canopy(ring / 13, t * TAU), 96));
  for (let rib = 0; rib < 8; rib++) paths.push([[0, -.18, 0], canopy(.7, rib / 8 * TAU)]);
  paths.push([[0, 1.45, 0], [0, -1.36, 0]]);
  for (const offset of [-.025, .025]) {
    paths.push([[offset, 1.27, 0], [offset, -1.36, 0]]);
    paths.push(curve(t => [.21 + (.21 - offset) * Math.cos(Math.PI + t * Math.PI), -1.36 + (.21 - offset) * Math.sin(Math.PI + t * Math.PI), 0], 24));
  }
  return paths;
}

function shoppingBag(): WirePath[] {
  const paths: WirePath[] = [];
  const base: WirePoint[] = [[-.82, -1.3, -.4], [.82, -1.3, -.4], [.82, -1.3, .4], [-.82, -1.3, .4]];
  const rim: WirePoint[] = [[-1.05, .78, -.52], [1.05, .78, -.52], [1.05, .78, .52], [-1.05, .78, .52]];
  for (let side = 0; side < 4; side++) {
    const next = (side + 1) % 4;
    patch(paths, rim[side], rim[next], base[next], base[side], side % 2 ? 5 : 12, 13);
  }
  paths.push([...rim, rim[0]], [...base, base[0]]);
  for (const z of [-.52, .52]) {
    for (const thickness of [-.028, .028]) {
      paths.push(curve(t => [(.5 + thickness) * Math.cos(t * Math.PI), .78 + (.77 + thickness) * Math.sin(t * Math.PI), z], 32));
    }
  }
  for (const side of [-1, 1]) paths.push([[side * 1.05, .78, 0], [side * .71, -.95, 0], [side * .82, -1.3, .4]]);
  return paths;
}

function city(): WirePath[] {
  const paths: WirePath[] = [];
  patch(paths, [-2.1, -1.25, -1.6], [2.1, -1.25, -1.6], [2.1, -1.25, 1.6], [-2.1, -1.25, 1.6], 14, 12);
  const buildings = [
    [-1.48, -.94, .64, .63, 1.3], [-.55, -.95, .66, .64, 2.35], [.42, -.9, .63, .62, 1.65], [1.35, -.85, .57, .75, 1.02],
    [-1.52, .02, .64, .62, .88], [-.48, .04, .75, .68, 3.05], [.61, .08, .64, .6, 1.9], [1.4, .35, .47, .66, 1.38],
    [-1.38, 1.01, .75, .5, .63], [-.35, 1.01, .72, .5, 1.18], [.64, 1.02, .69, .51, .77],
  ];
  for (const [x, z, w, d, h] of buildings) {
    const base: WirePoint[] = [[x - w / 2, -1.25, z - d / 2], [x + w / 2, -1.25, z - d / 2], [x + w / 2, -1.25, z + d / 2], [x - w / 2, -1.25, z + d / 2]];
    const roof = base.map(([px, py, pz]): WirePoint => [px, py + h, pz]);
    for (let side = 0; side < 4; side++) patch(paths, base[side], base[(side + 1) % 4], roof[(side + 1) % 4], roof[side], 3, Math.ceil(h * 6));
    paths.push([...roof, roof[0]]);
    if (h > 2) paths.push([[x, h - 1.25, z], [x, h - .8, z]]);
  }
  return paths;
}

// Broad swept wings, four nacelles, and a full-length upper fuselage give the
// passenger jet its distinctive Airbus A380-style silhouette.
function passengerJet(): WirePath[] {
  const paths: WirePath[] = [];
  const stations = [[-2.55, .025], [-2.42, .17], [-2.14, .29], [-1.75, .34], [-1.2, .35], [-.6, .35], [0, .35], [.6, .35], [1.2, .31], [1.7, .24], [2.14, .12], [2.43, .015]];
  const fuselage = (x: number, r: number, angle: number): WirePoint => [x, r * Math.cos(angle) * 1.1, r * Math.sin(angle)];
  for (const [x, r] of stations) paths.push(curve(t => fuselage(x, r, t * TAU), 28));
  for (let i = 0; i < 24; i++) paths.push(stations.map(([x, r]) => fuselage(x, r, i / 24 * TAU)));
  for (const side of [-1, 1]) {
    const a: WirePoint = [-.85, -.12, side * .22];
    const b: WirePoint = [.85, .1, side * 2.45];
    const c: WirePoint = [1.16, .14, side * 2.49];
    const d: WirePoint = [.87, -.13, side * .22];
    patch(paths, a, b, c, d, 14, 7);
    paths.push([b, [.9, .39, side * 2.54], c]);
    patch(paths, [1.6, .06, side * .16], [2.02, .28, side * .98], [2.34, .3, side * 1.02], [2.3, .06, side * .12], 7, 4);
    for (const span of [1.0, 1.73]) {
      const x = -.52 + (span - 1) * .5;
      const z = span * side;
      for (const along of [0, .09, .25, .49, .58]) {
        const r = along < .49 ? .19 : .14;
        paths.push(curve(t => [x + along, -.37 + r * Math.cos(t * TAU), z + r * Math.sin(t * TAU)], 24));
      }
      for (let i = 0; i < 12; i++) paths.push([[x, -.37 + .19 * Math.cos(i / 12 * TAU), z + .19 * Math.sin(i / 12 * TAU)], [x + .58, -.37 + .14 * Math.cos(i / 12 * TAU), z + .14 * Math.sin(i / 12 * TAU)]]);
      paths.push([[x + .18, -.2, z], [x + .36, -.03, z]]);
    }
    // Two restrained rows of cabin windows, modeled on the curved shell.
    for (const y of [.09, .23]) {
      for (let i = 0; i < 19; i++) {
        const x = -1.7 + i * .17;
        paths.push([[x, y, side * .31], [x + .065, y, side * .31]]);
      }
    }
  }
  patch(paths, [1.32, .18, 0], [1.86, 1.15, 0], [2.22, 1.17, 0], [2.35, .07, 0], 9, 6);
  return paths;
}

export const WIRE_MODELS: WireModel[] = [
  { name: 'umbrella', color: '#b40e3a', paths: umbrella(), pitch: -.18, yaw: .3, size: 1.1 },
  { name: 'shopping-bag', color: '#0253e3', paths: shoppingBag(), pitch: -.16, yaw: -.35, size: 1.05 },
  { name: 'city', color: '#176b50', paths: city(), pitch: .36, yaw: -.48, size: .9, lift: .06 },
  { name: 'airbus', color: '#75458c', paths: passengerJet(), pitch: .48, yaw: -.38, size: .87, lift: -.24 },
];

export function getWirePose(phase: number) {
  const angle = (clamp(phase, -.15, 1.15) - .5) * 1.75;
  return {
    x: .5 - Math.sin(angle) * .8,
    y: .46 + Math.sin(angle) * .035,
    depth: (1 - Math.cos(angle)) * 3.1,
    yaw: -angle * .8,
    bank: Math.sin(angle) * .11,
  };
}

export function getWireLayers(position: number) {
  const value = Math.max(0, position);
  return WIRE_MODELS.flatMap((_, index) => {
    const local = value - index;
    // The last object must complete its exit before the pinned section releases.
    const phase = local + (index === WIRE_MODELS.length - 1 ? .14 * clamp((local - .75) / .25) : 0);
    if (phase < -.14 || phase > 1.1) return [];
    const opacity = clamp((phase + .14) / .2) * clamp((1.1 - phase) / .22);
    return [{ index, phase, opacity }];
  });
}

export function projectWirePoint(point: WirePoint, pose: ReturnType<typeof getWirePose>, model: WireModel, width: number, height: number): WirePoint {
  const yaw = pose.yaw + model.yaw;
  const x = point[0] * Math.cos(yaw) + point[2] * Math.sin(yaw);
  const z = -point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
  const y = point[1] * Math.cos(model.pitch) - z * Math.sin(model.pitch);
  const depth = point[1] * Math.sin(model.pitch) + z * Math.cos(model.pitch);
  const perspective = 7 / (7 + depth + pose.depth);
  const scale = Math.min(height * .31, Math.max(width, 680) * .24) * model.size * perspective;
  return [
    width * pose.x + (x * Math.cos(pose.bank) - y * Math.sin(pose.bank)) * scale,
    height * (pose.y + (model.lift ?? 0)) - (x * Math.sin(pose.bank) + y * Math.cos(pose.bank)) * scale,
    depth,
  ];
}
