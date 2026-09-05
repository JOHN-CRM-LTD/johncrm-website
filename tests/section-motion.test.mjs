import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageTone, getRevealState } from '../src/app/components/section-motion-math.ts';
import * as motion from '../src/app/components/section-motion-math.ts';

test('feature rows enter, hold exactly centered, and exit only when delivery reveals', () => {
  assert.equal(typeof motion.getFeatureRevealState, 'function');
  for (const direction of ['left', 'right']) {
    const at = (top, deliveryTop, anchorDelta) => motion.getFeatureRevealState(top, 1000, 1440, direction, deliveryTop, anchorDelta);
    const centered = { enter: 1, exit: 0, opacity: 1, x: 0, y: 0, z: 0, rotateY: 0 };
    const entering = at(850, 1800);
    assert.ok(direction === 'left' ? entering.x < 0 : entering.x > 0);
    for (const [top, deliveryTop] of [[700, 1500], [500, 1300], [180, 980]]) {
      assert.deepEqual(at(top, deliveryTop), centered);
    }
    assert.deepEqual(at(850, 1300, 0), centered, 'Features navigation lands aligned');
    assert.deepEqual(at(750, 1200, 100), centered, 'navigation keeps the reading hold');
    const exiting = at(100, 900);
    assert.ok(direction === 'left' ? exiting.x > 0 : exiting.x < 0);
    assert.deepEqual(at(-150, 900), exiting, 'both rows share the delivery exit clock');
    assert.ok(Math.abs(at(180, 979.99).x) < .001, 'exit starts without a jump');
    assert.ok(Math.abs(at(700.01, 1500).x) < .001, 'entry settles without a jump');
    at(-500, 200);
    assert.deepEqual(at(500, 1300), centered, 'reverse scrolling restores the hold');
    assert.deepEqual(at(850, 1800), entering, 'reverse scrolling retraces entry');
  }
});

test('curved content wraps in depth without rising or falling', () => {
  assert.equal(typeof motion.getCurveRevealState, 'function');
  const left = motion.getCurveRevealState(850, 200, 1000, 'left');
  const right = motion.getCurveRevealState(850, 200, 1000, 'right');
  assert.ok(left.x < 0 && right.x > 0);
  assert.equal(left.x, -right.x);
  assert.equal(left.y, 0);
  assert.ok(right.z > 0 && right.rotateY < 0);
  assert.equal(left.z, right.z);
  assert.equal(left.rotateY, -right.rotateY);
  const exitLeft = motion.getCurveRevealState(-150, 200, 1000, 'left');
  const exitRight = motion.getCurveRevealState(-150, 200, 1000, 'right');
  assert.ok(exitLeft.x > 0 && exitRight.x < 0);
  assert.equal(exitLeft.opacity, 1);
  const earlier = motion.getCurveRevealState(940, 200, 1000, 'left');
  assert.ok(earlier.z > left.z, 'the display edges curve toward the viewer');
  assert.ok(exitRight.rotateY > 0 && exitRight.z > 0);
});

test('right-entry content travels monotonically left at a fixed vertical position', () => {
  let previousX = Infinity;
  for (let top = 1000; top >= -400; top -= 10) {
    const pose = motion.getCurveRevealState(top, 200, 1000, 'right');
    assert.ok(pose.x <= previousX);
    assert.equal(pose.y, 0);
    assert.ok(pose.z >= 0);
    previousX = pose.x;
  }
});

test('curves keep drifting through the reading interval and retrace exactly', () => {
  assert.equal(typeof motion.getCurveRevealState, 'function');
  let previousX = -Infinity;
  for (const top of [680, 500, 200]) {
    const pose = motion.getCurveRevealState(top, 200, 1000, 'left');
    assert.ok(pose.x > previousX, 'every scroll step must continue along the curve');
    previousX = pose.x;
    assert.equal(pose.opacity, 1);
  }
  const before = motion.getCurveRevealState(850, 200, 1000, 'right');
  motion.getCurveRevealState(-400, 200, 1000, 'right');
  assert.deepEqual(motion.getCurveRevealState(850, 200, 1000, 'right'), before);
  assert.equal(motion.getCurveRevealState(-700, 2100, 1000, 'left').opacity, 1);
  assert.equal(motion.getCurveRevealState(1000, 200, 1000, 'left').opacity, 1);
  assert.equal(motion.getCurveRevealState(-400, 200, 1000, 'left').opacity, 1);
});

test('the six feature blocks stay opaque throughout their travel', () => {
  const entering = motion.getCurveRevealState(850, 200, 1000, 'right');
  const reading = motion.getCurveRevealState(400, 200, 1000, 'right');
  const leaving = motion.getCurveRevealState(0, 200, 1000, 'right');
  assert.equal(entering.opacity, 1);
  assert.equal(reading.opacity, 1);
  assert.equal(leaving.opacity, 1);
});

test('feature dividers fade as the grid crosses the upper viewport and restore on reverse scroll', () => {
  assert.equal(typeof motion.getFeatureDividerOpacity, 'function');
  assert.equal(motion.getFeatureDividerOpacity(500, 1000), 1);
  const crossing = motion.getFeatureDividerOpacity(0, 1000);
  assert.ok(crossing > 0 && crossing < 1);
  assert.equal(motion.getFeatureDividerOpacity(-250, 1000), 0);
  assert.equal(motion.getFeatureDividerOpacity(500, 1000), 1);
});

test('the full page fades through intermediate colors as the dark section approaches', () => {
  const sections = top => [{ top: -2000, tone: 'paper', grid: 1 }, { top, tone: 'dark', grid: 1 }];
  assert.equal(getPageTone(sections(950), 1000).background, 'rgb(248, 248, 246)');
  assert.equal(getPageTone(sections(200), 1000).background, 'rgb(0, 0, 0)');
  const middle = getPageTone(sections(550), 1000);
  assert.notEqual(middle.background, 'rgb(248, 248, 246)');
  assert.notEqual(middle.background, 'rgb(0, 0, 0)');
});

test('scrolling back reproduces exactly the same background and reveal state', () => {
  const at = top => getPageTone([{ top: -2000, tone: 'paper', grid: 1 }, { top, tone: 'dark', grid: 1 }], 1000);
  const before = at(650);
  at(200);
  assert.deepEqual(at(650), before);
  const entering = getRevealState(850, 200, 1000);
  getRevealState(300, 200, 1000);
  assert.deepEqual(getRevealState(850, 200, 1000), entering);
  assert.ok(entering.opacity > 0 && entering.opacity < 1);
});

test('the page returns from black to the exact paper and white theme colors', () => {
  assert.equal(getPageTone([{ top: -1500, tone: 'dark', grid: 1 }, { top: 100, tone: 'paper', grid: 0 }], 1000).background, 'rgb(248, 248, 246)');
  assert.equal(getPageTone([{ top: -1500, tone: 'paper', grid: 0 }, { top: 100, tone: 'light', grid: 0 }], 1000).background, 'rgb(255, 255, 255)');
});

test('foreground stays readable at every step of the light-to-dark fade', () => {
  const luminance = rgb => {
    const values = rgb.match(/\d+/g).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  for (let top = 0; top <= 1000; top += 10) {
    const state = getPageTone([{ top: -2000, tone: 'light', grid: 0 }, { top, tone: 'dark', grid: 1 }], 1000);
    const a = luminance(state.background), b = luminance(state.foreground);
    assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5);
  }
});

test('long content stays fully visible while its beginning is above the viewport', () => {
  assert.equal(getRevealState(-700, 2100, 1000).opacity, 1);
  assert.equal(getRevealState(-700, 2100, 1000).y, 0);
});

test('content visibly rises in, rests for reading, and fades as it leaves', () => {
  assert.equal(getRevealState(1000, 200, 1000).opacity, 0);
  assert.ok(getRevealState(850, 200, 1000).y > 0);
  assert.deepEqual(getRevealState(400, 200, 1000), { enter: 1, exit: 0, opacity: 1, y: 0 });
  assert.ok(getRevealState(-140, 200, 1000).exit > 0);
  assert.equal(getRevealState(-300, 200, 1000).opacity, 0);
});


test('curve travel scales to the monitor width and shares one inward display surface', () => {
  const at = (viewportWidth, center) => motion.getCurveRevealState(850, 200, 1000, 'right', 0, { viewportWidth, center });
  const standard = at(1440, 720), wide = at(2880, 1440);
  assert.equal(wide.x, standard.x * 2);
  assert.equal(wide.z, standard.z * 2);
  assert.ok(standard.x > 1440 * .4, 'travel must span the monitor, not a fixed card-sized distance');
  const left = motion.getCurveRevealState(400, 200, 1000, 'right', 0, { viewportWidth: 1440, center: 240 });
  const right = motion.getCurveRevealState(400, 200, 1000, 'right', 0, { viewportWidth: 1440, center: 1200 });
  assert.ok(left.rotateY > 0 && right.rotateY < 0, 'both outer columns bend inward toward the center');
});
