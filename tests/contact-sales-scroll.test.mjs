import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const navSource = appSource.slice(
  appSource.indexOf('function Nav('),
  appSource.indexOf('/* ----------------------------- hero + dashboard'),
);

test('desktop and mobile Contact Sales actions target the contact section', () => {
  assert.equal(
    (navSource.match(/href="#contact"/g) ?? []).length,
    2,
    'expected both Contact Sales actions to link to #contact',
  );
});

test('contact section offsets anchor scrolling for the fixed header', () => {
  assert.match(appSource, /<section id="contact" className="scroll-mt-16 bg-white py-32">/);
});
