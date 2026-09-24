import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

test('location detection drives the pricing currency', () => {
  assert.match(source, /const \[currency\] = useState<CurrencyCode>\(detectInitialCurrency\);/);
  assert.doesNotMatch(source, /onCurrencyChange|handleCurrencyChange|setCurrency/);
  assert.match(source, /<Pricing currency=\{currency\} language=\{language\} \/>/);
  assert.match(
    source,
    /function Pricing\(\{ currency, language \}: \{ currency: CurrencyCode; language: LanguageCode \}\)/,
  );
});

test('currency follows location without saved manual overrides', () => {
  assert.doesNotMatch(source, /CURRENCY_PREFERENCE_STORAGE_KEY|johncrm:currency:v1/);
  assert.match(source, /'Asia\/Hong_Kong': 'HKD'/);
  assert.match(source, /timeZone\.startsWith\('Australia\/'\)[\s\S]*?'AUD'/);
  assert.match(source, /HK: 'HKD'/);
  assert.match(source, /AU: 'AUD'/);
  assert.match(
    source,
    /function detectInitialCurrency\(\)[\s\S]*?currencyForTimeZone[\s\S]*?currencyForRegion/,
  );
});

test('pricing has explicit symbols and a rounded AUD price book', () => {
  assert.match(source, /const CURRENCY_PRICING[\s\S]*?USD: \{[\s\S]*?symbol: '\$'/);
  assert.match(source, /AUD: \{[\s\S]*?symbol: 'A\$'/);
  assert.match(
    source,
    /AUD: \{[\s\S]*?starter: \{ monthly: 529, annual: 449 \}[\s\S]*?growth: \{ monthly: 729, annual: 599 \}/,
  );
  assert.match(source, /const formattedPrice = formatCurrencyPrice\(currency, price\);/);
  assert.match(source, /\{formattedPrice\}/);
});
