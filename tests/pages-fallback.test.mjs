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

  assert.equal(fallbackHtml, indexHtml, '404.html should bootstrap the same SPA as index.html');

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
    assert.match(html, /BOSS SOFTWARE LTD/);
    assert.match(html, /Unit 2, 3\/F, Block B, Hoi Luen Industrial Centre, 55 Hoi Yuen Road, Kwun Tong, Kowloon, Hong Kong/);
    assert.match(html, /href="tel:\+85224852033"/);
    assert.match(html, /\(852\) 2485 2033/);
    assert.match(html, /href="mailto:info@hkboss\.com\.hk"/);
    assert.doesNotMatch(html, /KITT DESIGNS LTD|Ka Ming Court|biz\.johncrm@gmail\.com/);
  }
});
