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
    'Website AI chatbot', '网站 AI 聊天机器人', '網站 AI 聊天機械人',
    'Basic automations, such as birthday reminders', '基础自动化，例如生日提醒', '基礎自動化，例如生日提醒',
    'Advanced automations in plain language, simulated before going live', '高级自动化：用日常语言编写，上线前可模拟运行', '進階自動化：用日常語言編寫，上線前可模擬運行',
    'Coupon campaigns: our team helps you set up and send coupons to your customers', '优惠券活动：我们的团队协助您设置并向客户发送优惠券', '優惠券活動：我們的團隊協助您設定並向客戶發送優惠券',
    'Custom modules built around your business', '为您的业务量身定制模块', '為您的業務度身訂造模組',
  ];
  for (const feature of current) {
    assert.ok(appSource.includes(`'${feature}'`), feature);
  }
  const removed = [
    'Adds Telegram', '增加 Telegram',
    'Bulk campaigns and templates', '批量营销与模板', '批量行銷與模板',
    'Price sheets and contract templates', '价格表与合同模板', '價格表與合約範本',
    'Staff calendar and appointments', '员工日历与预约管理', '員工日曆與預約管理',
    'Website chat leads saved to client profiles', '网页聊天线索自动存入客户档案', '網頁聊天潛在客戶自動存入客戶檔案',
  ];
  for (const feature of removed) {
    assert.ok(!appSource.includes(feature), feature);
  }
});

test('WeChat stays out of the marketing copy', () => {
  const marketing = appSource.slice(0, appSource.indexOf('function PrivacyPolicyContent'));
  assert.ok(marketing.length > 0);
  assert.doesNotMatch(marketing, /wechat|微信/i);
});

// The product can still connect these channels, and its login and profile pages link to these pages.
test('the legal pages disclose every channel the product can connect', async () => {
  const legalSource = await readFile(new URL('../src/app/translations/legal.ts', import.meta.url), 'utf8');
  const legalPages = appSource.slice(appSource.indexOf('function PrivacyPolicyContent'));
  for (const source of [legalPages, legalSource]) {
    assert.ok(source.includes('if you connect Telegram, Discord, WeChat, WhatsApp, Facebook Messenger, Instagram, or an AI provider key'));
    assert.ok(source.includes('(including WhatsApp and WeChat personal accounts)'));
    assert.ok(!source.includes('(WhatsApp, Telegram, Discord'));
  }
});

test('Instagram and Discord are on request in every language', () => {
  for (const note of [
    'Instagram and Discord can be added on request.',
    'Instagram 和 Discord 可按需开通。',
    'Instagram 和 Discord 可按需開通。',
  ]) {
    assert.ok(appSource.includes(`channelNote: '${note}'`), note);
  }
  assert.ok(appSource.includes('with Instagram and Discord on request'));
  assert.match(appSource, /\{copy\.channelNote\}/);
});

test('Enterprise describes private network access, separate from the PRO API line', () => {
  for (const feature of [
    'Read-only access to systems on your private network',
    '只读访问您私有网络内的系统',
    '唯讀存取您私有網絡內的系統',
  ]) {
    assert.ok(appSource.includes(`'${feature}'`), feature);
  }
  assert.doesNotMatch(appSource, /Read access to internal systems/);
});

test('priced plans explain the setup and monthly fees in every language', () => {
  for (const label of ['One-off setup & deployment', '一次性设置与部署', '一次性設定與部署']) {
    assert.ok(appSource.includes(`setupLabel: '${label}'`), label);
  }
  for (const label of ['Maintenance & token allowance', '维护与 Token 额度', '維護與 Token 額度']) {
    assert.ok(appSource.includes(`monthlyLabel: '${label}'`), label);
  }
});
