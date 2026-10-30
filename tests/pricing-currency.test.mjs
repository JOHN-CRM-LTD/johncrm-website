import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const { currencyForRegion, currencyFromBrowserSignals, parseTraceCountry } = await import(
  '../src/lib/currency.ts'
);

test('location detection drives the pricing currency', () => {
  assert.match(source, /const \[currency, setCurrency\] = useState<CurrencyCode>\(detectInitialCurrency\);/);
  assert.match(source, /lookupVisitorCurrency\(\)\.then/);
  assert.doesNotMatch(source, /onCurrencyChange|handleCurrencyChange/);
  assert.match(source, /<Pricing currency=\{currency\} language=\{language\} \/>/);
});

test('currency follows location without saved manual overrides', () => {
  assert.doesNotMatch(source, /CURRENCY_PREFERENCE_STORAGE_KEY|johncrm:currency:v1/);
});

test('countries map to the supported currencies, with USD left to the caller', () => {
  assert.equal(currencyForRegion('HK'), 'HKD');
  assert.equal(currencyForRegion('CN'), 'CNY');
  assert.equal(currencyForRegion('CA'), 'CAD');
  assert.equal(currencyForRegion('AU'), 'AUD');
  assert.equal(currencyForRegion('de'), 'EUR');
  assert.equal(currencyForRegion('GB'), null);
  assert.equal(currencyForRegion('MO'), null);
});

test('clear timezones decide the currency directly', () => {
  assert.equal(currencyFromBrowserSignals('Asia/Hong_Kong', ['en-US']), 'HKD');
  assert.equal(currencyFromBrowserSignals('Australia/Sydney', ['en-US']), 'AUD');
  assert.equal(currencyFromBrowserSignals('America/Toronto', ['en-US']), 'CAD');
  assert.equal(currencyFromBrowserSignals('America/Vancouver', ['fr-FR']), 'CAD');
  assert.equal(currencyFromBrowserSignals('Europe/Berlin', ['en-US']), 'EUR');
  assert.equal(currencyFromBrowserSignals('America/New_York', ['en-US']), 'USD');
  assert.equal(currencyFromBrowserSignals('Europe/London', ['en-GB']), 'USD');
});

test('Asia/Shanghai alone never means RMB, because Windows also reports it in Hong Kong', () => {
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['en-US']), 'HKD');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['en-HK']), 'HKD');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['zh-HK']), 'HKD');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['en-AU']), 'AUD');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['zh-CN']), 'CNY');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['zh-Hans']), 'CNY');
  assert.equal(currencyFromBrowserSignals('Asia/Shanghai', ['zh']), 'CNY');
});

test('malformed locales and missing signals fall back to USD', () => {
  assert.equal(currencyFromBrowserSignals(undefined, ['not a locale']), 'USD');
  assert.equal(currencyFromBrowserSignals(undefined, []), 'USD');
});

test('reads the country from the lookup response', () => {
  assert.equal(parseTraceCountry('fl=1\nip=203.0.113.9\nloc=HK\ntls=TLSv1.3\n'), 'HK');
  assert.equal(parseTraceCountry('fl=1\r\nloc=CA\r\ntls=TLSv1.3\r\n'), 'CA');
  assert.equal(parseTraceCountry('loc=XX\n'), null);
  assert.equal(parseTraceCountry('loc=T1\n'), null);
  assert.equal(parseTraceCountry('<html>blocked</html>'), null);
});
