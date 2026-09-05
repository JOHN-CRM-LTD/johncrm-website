import assert from 'node:assert/strict';
import test from 'node:test';

const implementation = await import('../src/app/components/hero-exit-math.ts').catch(() => null);

test('hero exit keeps visible content at rest and departs continuously near the upper viewport', () => {
  assert.ok(implementation, 'hero exit geometry must exist');
  const { getHeroExitProgress } = implementation;
  assert.equal(getHeroExitProgress(200, 700, 840), 0);
  const partial = getHeroExitProgress(-100, 700, 840);
  assert.ok(partial > 0 && partial < 1);
  assert.equal(getHeroExitProgress(-700, 700, 840), 1);
  assert.equal(getHeroExitProgress(-100, 700, 840), partial, 'reverse scrolling returns the same pose');
  assert.equal(getHeroExitProgress(200, 700, 840), 0, 'returning to the hero restores it');
});

test('stacked mobile portrait stays intact before reaching its own exit region', () => {
  assert.ok(implementation, 'hero exit geometry must exist');
  const { getHeroExitProgress } = implementation;
  assert.equal(getHeroExitProgress(850, 520, 844), 0);
  assert.equal(getHeroExitProgress(280, 520, 844), 0);
  assert.ok(getHeroExitProgress(0, 520, 844) > 0);
  for (const top of [-1000, 0, 1000]) {
    const result = getHeroExitProgress(top, 0, 0);
    assert.ok(Number.isFinite(result) && result >= 0 && result <= 1);
  }
});

test('text starts its reverse wipe below the header but never alters the initial composition', () => {
  assert.ok(implementation, 'hero exit geometry must exist');
  const { getHeroExitProgress } = implementation;
  assert.equal(getHeroExitProgress(60, 60, 844, 0), 0);
  assert.ok(getHeroExitProgress(170, 100, 900, 100) > 0);
  assert.ok(getHeroExitProgress(70, 60, 844, 50) > 0);
  assert.equal(getHeroExitProgress(420, 60, 844, 50), 0, 'later lines wait their turn');
});
