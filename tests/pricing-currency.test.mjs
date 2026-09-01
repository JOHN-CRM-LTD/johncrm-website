import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

test('the header currency selection drives the pricing currency', () => {
  assert.match(source, /code: 'AUD', label: 'AUD'/);
  assert.match(source, /const \[currency, setCurrency\] = useState<CurrencyCode>\(detectInitialCurrency\);/);
  assert.match(
    source,
    /<Nav[\s\S]*?currency=\{currency\}[\s\S]*?onCurrencyChange=\{handleCurrencyChange\}/,
  );
  assert.match(source, /<Pricing currency=\{currency\} language=\{language\} \/>/);
  assert.match(
    source,
    /function Pricing\(\{ currency, language \}: \{ currency: CurrencyCode; language: LanguageCode \}\)/,
  );
});

test('location defaults the currency while a saved manual selection wins', () => {
  assert.match(source, /const CURRENCY_PREFERENCE_STORAGE_KEY = 'johncrm:currency:v1';/);
  assert.match(source, /'Asia\/Hong_Kong': 'HKD'/);
  assert.match(source, /timeZone\.startsWith\('Australia\/'\)[\s\S]*?'AUD'/);
  assert.match(source, /HK: 'HKD'/);
  assert.match(source, /AU: 'AUD'/);
  assert.match(
    source,
    /function detectInitialCurrency\(\)[\s\S]*?localStorage\.getItem\(CURRENCY_PREFERENCE_STORAGE_KEY\)[\s\S]*?currencyForTimeZone[\s\S]*?currencyForRegion/,
  );
  assert.match(
    source,
    /const handleCurrencyChange = useCallback[\s\S]*?localStorage\.setItem\(CURRENCY_PREFERENCE_STORAGE_KEY, nextCurrency\)[\s\S]*?setCurrency\(nextCurrency\)/,
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
