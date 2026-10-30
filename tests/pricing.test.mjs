import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles/product-landing.css', import.meta.url), 'utf8');

test('price book uses a one-off setup fee plus a monthly fee', () => {
  assert.match(
    source,
    /HKD: \{[\s\S]*?starter: \{ setup: 9800, monthly: 1800 \}[\s\S]*?growth: \{ setup: 28000, monthly: 4800 \}[\s\S]*?enterprise: \{ setup: 68000 \}/,
  );
  assert.match(
    source,
    /USD: \{[\s\S]*?starter: \{ setup: 1250, monthly: 230 \}[\s\S]*?growth: \{ setup: 3580, monthly: 610 \}[\s\S]*?enterprise: \{ setup: 8700 \}/,
  );
});

test('every supported currency prices all three plans', () => {
  for (const currency of ['USD', 'CNY', 'HKD', 'EUR', 'AUD', 'CAD']) {
    assert.match(
      source,
      new RegExp(
        `  ${currency}: \\{\\s*symbol: '[^']+',\\s*prices: \\{\\s*starter: \\{ setup: \\d+, monthly: \\d+ \\},\\s*growth: \\{ setup: \\d+, monthly: \\d+ \\},\\s*enterprise: \\{ setup: \\d+ \\},`,
      ),
      `${currency} should price all three plans`,
    );
  }
});

test('pricing cards have no buttons or billing toggle', () => {
  const pricing = source.slice(source.indexOf('function Pricing('), source.indexOf('type ContactStatus'));
  assert.doesNotMatch(pricing, /<a\b|<button\b|pricing-cta|billing-toggle/);
  assert.doesNotMatch(source, /ctaHref|annual/);
  assert.doesNotMatch(styles, /pricing-cta|billing-toggle/);
});

test('plans do not claim features the product does not have', () => {
  const copy = source.slice(source.indexOf('const SITE_COPY'), source.indexOf('function Pricing('));
  const plans = [...copy.matchAll(/    pricing: \{[\s\S]*?\n    contact: \{/g)].map((match) => match[0]).join('\n');
  assert.equal(plans.length > 0, true);
  assert.doesNotMatch(plans, /SAML|Salesforce|Google Sheets|Outlook|Google Calendar|quotation|unlimited|pipeline board/i);
  assert.doesNotMatch(plans, /Start Free Trial|Contact Sales|免费试用|免費試用/);
});
