import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

test('production build emits a GitHub Pages fallback for deep links', async () => {
  await execAsync('npm run build', {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    windowsHide: true,
  });

  const indexHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const fallbackHtml = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');

  assert.equal(fallbackHtml.match(/<script type="module"[^>]*>/)?.[0], indexHtml.match(/<script type="module"[^>]*>/)?.[0],
    '404.html should bootstrap the same SPA while keeping error pages out of search');
  assert.match(fallbackHtml, /<meta name="robots" content="noindex, follow"/);
  assert.doesNotMatch(fallbackHtml, /rel="canonical"/);
  const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  const robots = await readFile(new URL('../dist/robots.txt', import.meta.url), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.equal(new Set(urls).size, urls.length, 'canonical pages should appear once');
  assert.ok(urls.length >= 16, 'include the public product, industry, docs and legal pages');
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://www.johncrm.com');
    assert.ok(parsed.pathname.endsWith('/'));
    const html = await readFile(new URL(`../dist${parsed.pathname}index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<link rel="canonical" href="${url}"`));
    assert.ok(html.includes(`<meta property="og:url" content="${url}"`));
    assert.match(html, /<meta property="og:image" content="https:\/\/www\.johncrm\.com\/brand\/johncrm-social\.png"/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(html, /<link rel="icon"/);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.doesNotMatch(html, /name="robots" content="noindex/);
  }
  assert.doesNotMatch(sitemap, /404|app\.johncrm|dev\.johncrm|ford\.johncrm/);
  assert.match(robots, /Sitemap: https:\/\/www\.johncrm\.com\/sitemap.xml/);
  const schema = JSON.parse(indexHtml.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)?.[1] ?? 'null');
  assert.equal(schema['@type'], 'Organization');
  assert.equal(schema.name, '2x4 Technology Limited');
  assert.equal(schema.brand.name, 'JOHN CRM');
  assert.equal(schema.email, 'info@hkboss.com.hk');
  assert.equal(schema.telephone, '+85224852033');

  const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'));
  const docsEntry = Object.values(manifest).find(entry => entry.src === 'src/app/docs/DocsPage.tsx');
  assert.ok(docsEntry?.css?.length, 'the lazy documentation entry must include its production styles');
  for (const [path, title] of [
    ['docs', 'Getting started'],
    ['docs/john-support', 'John Support'],
    ['docs/conversations', 'Conversations & webchat'],
    ['docs/knowledge-base', 'Knowledge Base'],
    ['docs/automations', 'Automations'],
    ['docs/users-and-access', 'Users & access'],
  ]) {
    const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
    const escapedTitle = title.replaceAll('&', '&amp;');
    assert.ok(html.includes(`<title>${escapedTitle} · JOHN CRM Documentation</title>`), `${path} must have an article title`);
    assert.match(html, /<h1\b[^>]*>[\s\S]+?<\/h1>/, 'article headings must exist without JavaScript');
    assert.ok((html.match(/<section\b/g) ?? []).length >= 3, `${path} must contain the complete article`);
    assert.match(html, /<meta name="description" content="[^"\n]{30,}"/);
    assert.match(html, /<script\b[^>]*type="module"[^>]*src="\/assets\//);
    for (const stylesheet of docsEntry.css) assert.ok(html.includes(`href="/${stylesheet}"`), 'docs CSS must be present before JavaScript');
    assert.match(html, /src="\/docs\/johncrm\.svg"/);
    assert.doesNotMatch(html, /(?:src|href)="\/src\//, 'SSR must not leak development asset URLs');
    assert.match(html, /href="\/#contact"/);
    assert.match(html, /href="\/#pricing"/);
  }

  for (const [slug, title, topic] of [
    ['retail', 'Retail', 'clothing reservations'],
    ['healthcare', 'Healthcare', 'existing database'],
    ['insurance', 'Insurance', 'WhatsApp'],
    ['education', 'Education', 'payment updates'],
  ]) {
    const html = await readFile(new URL(`../dist/industries/${slug}/index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<title>${title} · JOHN CRM</title>`), `${slug} must have a dedicated page title`);
    assert.ok(html.includes(topic), `${slug} must have its own search description`);
    assert.match(html, /<script\b[^>]*type="module"[^>]*src="\/assets\//,
      'industry deep links must load the production app from the site root');
  }

  for (const [path, title, sections] of [
    ['privacy-policy', 'Privacy Policy', 14],
    ['terms-of-service', 'Terms of Service', 16],
  ]) {
    const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<title>${title} · JOHN CRM</title>`));
    assert.equal((html.match(/class="legal-section"/g) ?? []).length, sections,
      'the complete document must be readable without JavaScript');
    assert.match(html, /<script\b[^>]*type="module"[^>]*src="[^\"]+"/,
      'static documents must retain the script that enables smooth navigation');
    assert.match(html, /2x4 Technology Limited/);
    assert.match(html, /Unit 2, 3\/F, Block B, Hoi Luen Industrial Centre, 55 Hoi Yuen Road, Kwun Tong, Kowloon, Hong Kong/);
    assert.match(html, /href="tel:\+85224852033"/);
    assert.match(html, /\(852\) 2485 2033/);
    assert.match(html, /href="mailto:info@hkboss\.com\.hk"/);
    assert.doesNotMatch(html, /KITT DESIGNS LTD|Ka Ming Court|biz\.johncrm@gmail\.com/);
  }
});
