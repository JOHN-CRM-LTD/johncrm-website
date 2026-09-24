import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('header exposes accessible language dropdowns without currency controls', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /function HeaderSelector(?:<[^>]+>)?\(/);
  assert.match(source, /aria-label=\{ariaLabel\}/);
  assert.match(source, /ariaLabel=\{copy\.selectors\.language\}/);
  assert.doesNotMatch(source, /id="(?:mobile-)?currency"|onCurrencyChange|CURRENCY_OPTIONS/);
  assert.match(source, /code: 'EN', label: 'English'/);
  assert.match(source, /code: 'CN', label: '简体中文'/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitemradio"/);
});

test('header centers native-language menus and supplies Chinese page copy', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /left-1\/2 -translate-x-1\/2/);
  assert.match(source, /永不休眠的/);
  assert.match(source, /document\.documentElement\.lang/);
});
