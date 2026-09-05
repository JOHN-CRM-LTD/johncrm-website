import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('intro starts as a filled rectangle, changes characters, and resolves exactly to the portrait', async () => {
  const moduleUrl = new URL('../src/lib/asciiIntro.ts', import.meta.url);
  const implementation = await import(moduleUrl.href).catch(() => null);
  assert.ok(implementation, 'ASCII intro frame generator must exist');
  const text = (await readFile(new URL('../src/assets/hero-ascii.txt', import.meta.url), 'utf8')).replaceAll('.', ' ');
  const { createAsciiIntroFrame } = implementation;
  const opening = createAsciiIntroFrame(text, 0);
  const rows = opening.split('\n');
  assert.ok(rows.every(row => row.length === rows[0].length));
  assert.ok(rows.every(row => !row.includes(' ')), 'opening must be a completely filled rectangle');
  assert.notEqual(createAsciiIntroFrame(text, .1), opening);
  const middle = createAsciiIntroFrame(text, .6);
  assert.equal(middle.length, opening.length, 'no layout shift while scrambling');
  assert.ok(middle.includes(' '), 'background must clear as the portrait resolves');
  assert.notEqual(middle, text);
  assert.equal(createAsciiIntroFrame(text, 1), text);
  assert.equal(createAsciiIntroFrame(text, 2), text);
});
