import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const posterSource = appSource.slice(
  appSource.indexOf('function Poster('),
  appSource.indexOf('/* --------------------------------- showcase', appSource.indexOf('function Poster(')),
);
const copySource = appSource.slice(appSource.indexOf('const SITE_COPY'));
const sections = (start, end) => copySource
  .split(`    ${start}: {`)
  .slice(1)
  .map(section => section.slice(0, section.indexOf(`    ${end}: {`)));

test('poster supporting copy positions automation as human-feeling customer service', () => {
  assert.match(copySource, /Smarter Service\. More Human\./);
  assert.match(
    copySource,
    /Automated customer service that still feels human\. AI handles routine conversations while your team stays close to every customer\./,
  );
  assert.match(posterSource.replace(/\s+/g, ' '), /text-\[15px\].*text-white\/50/);
});

test('poster and hero send visitors to contact sales instead of a free trial', () => {
  assert.match(posterSource, /href="#contact"/);
  assert.doesNotMatch(appSource, /tryForFree/);
  for (const section of [...sections('hero', 'features'), ...sections('poster', 'pricing')]) {
    assert.doesNotMatch(section, /trial|credit card|試用|试用|信用卡/i);
  }
});

test('feature copy only claims capabilities the product has', () => {
  const features = sections('features', 'poster');
  assert.equal(features.length, 3);
  for (const section of features) {
    assert.doesNotMatch(section, /email|电子邮件|電子郵件|SSO|forecast|预测|預測|pipeline|管道|disclaimer|免责|免責/i);
  }
});
