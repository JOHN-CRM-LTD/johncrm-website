import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

test('Support shares localized destinations and accordion semantics across desktop and mobile', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    cacheDir: 'node_modules/.vite-support-test',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  try {
    const { default: SupportMenu } = await server.ssrLoadModule('/src/app/components/SupportMenu.tsx');
    for (const [language, label, docs, contact] of [
      ['EN', 'Support', 'Developer Documentation', 'Contact us'],
      ['CN', '支持', '开发者文档', '联系我们'],
      ['HK', '支援', '開發者文件', '聯絡我們'],
    ]) {
      for (const mobile of [true, false]) {
        for (const home of [true, false]) {
          const html = renderToStaticMarkup(createElement(SupportMenu, { language, mobile, home }));
          assert.ok(html.includes(`>${label}<`));
          assert.ok(html.includes(`<strong>${docs}</strong>`));
          assert.ok(html.includes(`<strong>${contact}</strong>`));
          assert.match(html, /href="\/docs"/);
          assert.ok(html.includes(`href="${home ? '#contact' : '/#contact'}"`));
          assert.match(html, /aria-expanded="false"/);
          const panelId = html.match(/aria-controls="([^"]+)"/)[1];
          assert.ok(html.includes(`id="${panelId}" class="industries-menu__panel" hidden=""`));
          assert.equal(html.includes('industries-menu--mobile'), mobile);
        }
      }
    }
  } finally {
    await server.close();
  }
});

test('both navigation layouts place Support between Industries and Pricing and docs use the shared shell', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const nav = source.slice(source.indexOf('function Nav('), source.indexOf('/* ----------------------------- hero + dashboard'));
  const desktop = nav.slice(nav.indexOf('<nav className="hidden'), nav.indexOf('</nav>'));
  const mobile = nav.slice(nav.indexOf('<div className="flex flex-col px-6 py-6">'));
  for (const layout of [desktop, mobile]) {
    assert.match(layout, /<ProductMenu[\s\S]+<IndustriesMenu[\s\S]+<SupportMenu[\s\S]+NAV_LINKS\.filter/);
  }
  assert.match(mobile, /<SupportMenu[^>]+mobile onNavigate=\{closeMenu\}/);
  assert.doesNotMatch(source.slice(source.indexOf('const NAV_LINKS'), source.indexOf('const LANGUAGE_OPTIONS')), /key: 'contact'/);
  assert.match(source, /const FOOTER_LINK_HREFS = \['\/privacy-policy', '\/terms-of-service', '\/docs'\]/);
  assert.match(source, /export function DocumentationShell[\s\S]+<Nav[^>]+productPage[\s\S]+<Footer/);
  assert.match(source, /path === '\/docs' \|\| path\.startsWith\('\/docs\/'\)/);
  assert.match(source, /lazy\(\(\) => import\('\.\/docs\/DocsPage'\)\)/);
});
