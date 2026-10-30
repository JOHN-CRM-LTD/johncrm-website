import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

test('enterprise pricing card shows a "from" price scoped by project', () => {
  assert.match(appSource, /name: 'Enterprise',\s*priceKey: 'enterprise',/);
  assert.match(appSource, /fromBefore: 'From',/);
  assert.match(appSource, /enterpriseNote: 'Scoped by project requirements, milestone-based acceptance',/);
  assert.match(appSource, /monthly === undefined \? copy\.enterpriseNote : copy\.setupLabel/);
});

test('priced plans explain the setup and monthly fees in every language', () => {
  for (const label of ['One-off setup & deployment', '一次性设置与部署', '一次性設定與部署']) {
    assert.ok(appSource.includes(`setupLabel: '${label}'`), label);
  }
  for (const label of ['Maintenance & token allowance', '维护与 Token 额度', '維護與 Token 額度']) {
    assert.ok(appSource.includes(`monthlyLabel: '${label}'`), label);
  }
});
