import assert from 'node:assert/strict';
import test from 'node:test';
import { WIRE_MODELS, getWirePose, getWireLayers, projectWirePoint } from '../src/app/components/chat-wireframe-geometry.ts';

test('all industry models contain finite geometry with genuine depth', () => {
  assert.equal(WIRE_MODELS.length, 4);
  for (const model of WIRE_MODELS) {
    assert.ok(model.paths.length > 25);
    const points = model.paths.flat();
    assert.ok(points.every(point => point.length === 3 && point.every(Number.isFinite)));
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.max(...points.map(p => p[axis])) - Math.min(...points.map(p => p[axis])) > 0.5);
    }
  }
});

test('scroll moves wireframes right to left on a curved path with depth and rotation', () => {
  const poses = [0, .25, .5, .75, 1].map(getWirePose);
  for (let i = 1; i < poses.length; i++) assert.ok(poses[i].x < poses[i - 1].x);
  assert.ok(poses[0].depth > poses[2].depth);
  assert.ok(poses[4].depth > poses[2].depth);
  assert.notEqual(poses[0].yaw, poses[4].yaw);
  assert.ok(poses[0].x > 1 && poses[4].x < 0);
});

test('chapter layers overlap continuously and fast scrolling selects the matching model', () => {
  assert.deepEqual(getWireLayers(2.5).map(layer => layer.index), [2]);
  assert.deepEqual(getWireLayers(.95).map(layer => layer.index), [0, 1]);
  assert.deepEqual(getWireLayers(-1).map(layer => layer.index), [0]);
  assert.deepEqual(getWireLayers(5), []);
});

test('the final aircraft continues left beyond the old stopping point and fully exits', () => {
  const before = getWireLayers(3.86).find(layer => layer.index === 3);
  const after = getWireLayers(3.95).find(layer => layer.index === 3);
  assert.ok(before && after);
  assert.ok(after.phase > before.phase);
  assert.ok(getWirePose(after.phase).x < getWirePose(before.phase).x);
  assert.ok(after.opacity < before.opacity);
  for (const position of [4, 4.1, 5]) assert.deepEqual(getWireLayers(position), []);
  assert.deepEqual(getWireLayers(3.5).map(layer => layer.index), [3]);
});

test('projection remains finite at every chapter and viewport size', () => {
  for (const width of [320, 1280]) {
    for (const phase of [0, .5, 1]) {
      for (const model of WIRE_MODELS) {
        const point = projectWirePoint(model.paths[0][0], getWirePose(phase), model, width, 800);
        assert.ok(point.every(Number.isFinite));
      }
    }
  }
});
