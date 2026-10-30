import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

test('enterprise pricing card shows a "from" price scoped by project', () => {
  assert.match(appSource, /name: 'Enterprise',\s*priceKey: 'enterprise',/);
  assert.match(appSource, /fromBefore: 'From',/);
  assert.match(appSource, /enterpriseNote: 'Scoped by project requirements, milestone-based acceptance',/);
  assert.match(appSource, /monthly === undefined \? copy\.enterpriseNote : copy\.monthlyLabel/);
});

test('priced plans lead with the monthly fee, then the one-off setup fee', () => {
  assert.match(appSource, /formatCurrencyPrice\(currency, monthly \?\? setup\)/);
  assert.match(appSource, /pricing-setup[\s\S]*?\+ \{formatCurrencyPrice\(currency, setup\)\}/);
});

test('every plan states its token limits in every language', () => {
  const notes = [
    'Token usage is capped on this plan. Custom limits are available on Enterprise.',
    '本方案的 Token 用量设有上限。如需自定义额度，请选择企业版。',
    '本方案的 Token 用量設有上限。如需自訂額度，請選用企業版。',
  ];
  for (const note of notes) {
    assert.equal(appSource.split(`tokenNote: '${note}'`).length - 1, 2, note);
  }
  for (const note of ['Custom token limits, set to your project.', '按项目需求自定义 Token 额度。', '按項目需求自訂 Token 額度。']) {
    assert.ok(appSource.includes(`tokenNote: '${note}'`), note);
  }
});

test('plan features carry the current wording in every language', () => {
  const current = [
    'AI replies in any language', 'AI 可用任何语言回复', 'AI 可用任何語言回覆',
    'Connect your existing API Endpoints', '连接您现有的 API 端点', '連接您現有的 API 端點',
    'Internal staff AI assistant', '内部员工 AI 助手', '內部員工 AI 助手',
  ];
  for (const feature of current) {
    assert.ok(appSource.includes(`'${feature}'`), feature);
  }
  const removed = [
    'Adds Telegram', '增加 Telegram',
    'Bulk campaigns and templates', '批量营销与模板', '批量行銷與模板',
    'Price sheets and contract templates', '价格表与合同模板', '價格表與合約範本',
    'Staff calendar and appointments', '员工日历与预约管理', '員工日曆與預約管理',
  ];
  for (const feature of removed) {
    assert.ok(!appSource.includes(feature), feature);
  }
});

test('priced plans explain the setup and monthly fees in every language', () => {
  for (const label of ['One-off setup & deployment', '一次性设置与部署', '一次性設定與部署']) {
    assert.ok(appSource.includes(`setupLabel: '${label}'`), label);
  }
  for (const label of ['Maintenance & token allowance', '维护与 Token 额度', '維護與 Token 額度']) {
    assert.ok(appSource.includes(`monthlyLabel: '${label}'`), label);
  }
});
