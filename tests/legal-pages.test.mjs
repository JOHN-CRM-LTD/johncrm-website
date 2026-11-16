import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const termsNavSource = source.slice(
  source.indexOf('const TERMS_NAV'),
  source.indexOf('function TermsOfServiceContent'),
);
const termsPageSource = source.slice(
  source.indexOf('function TermsOfServiceContent'),
  source.indexOf('function LegalDocumentsPage'),
);

test('the router serves a dedicated terms of service page', () => {
  assert.match(source, /function TermsOfServicePage\(\)/);
  assert.match(source, /path === '\/terms-of-service'/);
  assert.match(source, /<TermsOfServicePage \/>/);
  assert.match(source, /\{ label: 'Terms', ariaLabel: 'Terms of Service' \}/);
  assert.match(source, /const FOOTER_LINK_HREFS = \['\/privacy-policy', '\/terms-of-service', '\/docs'\]/);
  assert.match(source, /<LegalDocumentsPage initialPage="terms" \/>/);
  assert.match(source, /document\.title = `\$\{title\} · JOHN CRM`/);
});

test('every terms table-of-contents entry anchors a rendered section', () => {
  const navIds = [...termsNavSource.matchAll(/\['([a-z0-9-]+)',/g)].map(([, id]) => id);
  const sectionIds = [...termsPageSource.matchAll(/<LegalSection id="([a-z0-9-]+)"/g)].map(([, id]) => id);

  assert.equal(navIds.length, 16, 'expected all sixteen terms sections in the table of contents');
  assert.deepEqual(sectionIds, navIds, 'section ids must match the table of contents, in order');
});

test('terms cross-references resolve to real anchors and to the privacy policy', () => {
  ['#fees', '#acceptable-use', '#customer-content'].forEach((anchor) => {
    assert.ok(termsPageSource.includes(`href="${anchor}"`), `expected an in-page link to ${anchor}`);
  });
  assert.match(termsPageSource, /href="\/privacy-policy"/);
});

test('the terms page ships finished copy, not the draft template', () => {
  ['[Company Legal Name]', '[Registered address]', '[Date]', 'yourdomain', 'Status: DRAFT'].forEach(
    (placeholder) => {
      assert.ok(
        !termsPageSource.includes(placeholder),
        `unfilled placeholder left in page: ${placeholder}`,
      );
    },
  );
  assert.doesNotMatch(
    termsPageSource,
    /[Ââ]/,
    'mojibake from the source markdown must be repaired',
  );
  assert.match(termsPageSource, /operated by["')}\s]+\{' '\}\{LEGAL_COMPANY\}/);
  assert.match(source, /const LEGAL_COMPANY = '2x4 Technology Limited'/);
  assert.match(source, /Last updated: 16 November 2026/);
});

test('the subprocessor list names Resend, which sends every application email', () => {
  const privacySource = source.slice(source.indexOf('function PrivacyPolicyContent'), source.indexOf('const TERMS_NAV'));
  assert.match(privacySource, /\['Resend', 'Email delivery for account, sign in and notification messages, including verification codes for website chat visitors', 'Japan \/ United States'\]/);
});

test('the privacy policy states where the Service is hosted', () => {
  const privacySource = source.slice(source.indexOf('function PrivacyPolicyContent'), source.indexOf('const TERMS_NAV'));
  assert.match(privacySource, /We run the Service, its databases and private file storage on our own servers in Hong Kong\./);
  assert.match(privacySource, /Our primary infrastructure is in Hong Kong, on servers we operate ourselves\./);
  assert.doesNotMatch(privacySource, /DigitalOcean|Singapore/);
});

test('the privacy policy discloses Automations and their 90 day run history', () => {
  const privacySource = source.slice(source.indexOf('function PrivacyPolicyContent'), source.indexOf('const TERMS_NAV'));
  assert.match(privacySource, /Automations \(scheduled and triggered AI runs\):/);
  assert.match(privacySource, /is retained for 90 days \(see section 9\)/);
  assert.match(privacySource, /t\("Automation run history:"\)[\s\S]*?t\("rolling 90 day retention\."\)/);
});

test('both legal pages share one section primitive and one contact block', () => {
  assert.match(source, /function LegalSection\(\{/);
  assert.match(source, /const LEGAL_CONTACT_EMAIL = 'info@hkboss\.com\.hk';/);
  assert.equal((source.match(/<LegalContactBlock \/>/g) ?? []).length, 2);
  assert.doesNotMatch(source, /PrivacySection/, 'the section primitive is shared, not privacy-scoped');
  assert.doesNotMatch(source, /PRIVACY_CONTACT_EMAIL|PRIVACY_ADDRESS/);
  assert.equal(
    (source.match(/<LegalSection id="/g) ?? []).length,
    30,
    'expected 14 privacy sections and 16 terms sections',
  );
});

test('the landing page is a component so the router stays hook-free', () => {
  const router = source.slice(source.indexOf('export default function App()'));

  assert.match(source, /function LandingPage\(/);
  assert.match(router, /<LandingPage \/>/);
  assert.doesNotMatch(router, /useState|useEffect|useCallback/, 'hooks must live in LandingPage');
});
