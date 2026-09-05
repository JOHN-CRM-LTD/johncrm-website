import assert from 'node:assert/strict';
import test from 'node:test';
import { getChatScrollState, getMessageReveal, getChatExitState } from '../src/app/components/chat-demo-motion.ts';

test('chat exit preserves reading time and fades only near the end', () => {
  assert.deepEqual(getChatExitState(1600, 1000), { travel: 0, opacity: 1 });
  const middle = getChatExitState(1175, 1000);
  assert.ok(middle.travel > 0 && middle.travel < 1);
  assert.equal(middle.opacity, 1);
  const late = getChatExitState(950, 1000);
  assert.ok(late.travel > middle.travel);
  assert.ok(late.opacity > 0 && late.opacity < 1);
  assert.deepEqual(getChatExitState(850, 1000), { travel: 1, opacity: 0 });
  assert.deepEqual(getChatExitState(-100, 1000), { travel: 1, opacity: 0 });
  assert.deepEqual(getChatExitState(1500, 1000), { travel: 0, opacity: 1 });
});

test('flow layouts wait for the final card to enter before exiting', () => {
  assert.deepEqual(getChatExitState(1000, 1000, false), { travel: 0, opacity: 1 });
  assert.deepEqual(getChatExitState(900, 1000, false), { travel: 0, opacity: 1 });
  assert.ok(getChatExitState(600, 1000, false).travel > 0);
  assert.deepEqual(getChatExitState(240, 1000, false), { travel: 1, opacity: 0 });
});

test('messages reflect a fast scroll landing immediately, without playback time', () => {
  const state = getChatScrollState(2.55 / 4, 4);
  assert.equal(state.chapter, 2);
  assert.equal(state.active, 2);
  assert.equal(getMessageReveal(state.local, 3), 1);
});

test('a conversation fills during the first part of its scroll chapter', () => {
  assert.equal(getMessageReveal(0, 0), 1);
  assert.equal(getMessageReveal(0, 1), 0);
  assert.ok(getMessageReveal(0.12, 1) > 0);
  assert.equal(getMessageReveal(0.4, 3), 1);
});

test('switching industries moves the message track upward continuously', () => {
  const before = getChatScrollState(0.8 / 4, 4);
  const during = getChatScrollState(0.93 / 4, 4);
  const after = getChatScrollState(1 / 4, 4);
  assert.equal(before.track, 0);
  assert.ok(during.track > 0 && during.track < 1);
  assert.equal(during.active, 1);
  assert.equal(after.track, 1);
});

test('scrolling back restores the corresponding messages and industry', () => {
  const later = getChatScrollState(0.64, 4);
  const earlier = getChatScrollState(0.13, 4);
  assert.equal(later.chapter, 2);
  assert.equal(earlier.chapter, 0);
  assert.equal(getMessageReveal(earlier.local, 3), 1);
});

test('the final conversation stays complete at and beyond the section end', () => {
  for (const progress of [1, 1.2]) {
    const state = getChatScrollState(progress, 4);
    assert.deepEqual(state, { chapter: 3, local: 1, active: 3, track: 3 });
    assert.equal(getMessageReveal(state.local, 3), 1);
  }
  assert.deepEqual(getChatScrollState(-1, 4), { chapter: 0, local: 0, active: 0, track: 0 });
});
