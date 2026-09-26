import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';

let server, catalog, search, ui, DocsPage, LanguageContext;
before(async () => {
  server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), cacheDir: 'node_modules/.vite-docs-test', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null } });
  catalog = await server.ssrLoadModule('/src/app/docs/content.ts');
  search = await server.ssrLoadModule('/src/app/docs/search.ts');
  ({ DOCS_UI: ui } = await server.ssrLoadModule('/src/app/docs/ui.ts'));
  ({ default: DocsPage } = await server.ssrLoadModule('/src/app/docs/DocsPage.tsx'));
  ({ LanguageContext } = await server.ssrLoadModule('/src/app/translations/language.ts'));
});
after(async () => { await server?.close(); });

function assertTranslation(value) {
  assert.equal(value.length, 3, 'every string must have EN, CN and HK copy');
  value.forEach(text => assert.ok(typeof text === 'string' && text.trim().length > 0));
  assert.match(value[1], /[\u3400-\u9fff]/, 'Simplified Chinese copy must be supplied');
  assert.match(value[2], /[\u3400-\u9fff]/, 'Traditional Chinese copy must be supplied');
}

test('six complete guides have stable unique routes, section anchors and all three languages', () => {
  assert.deepEqual(catalog.DOC_ARTICLES.map(a => a.path), ['/docs', '/docs/john-support', '/docs/conversations', '/docs/knowledge-base', '/docs/automations', '/docs/users-and-access']);
  for (const article of catalog.DOC_ARTICLES) {
    assertTranslation(article.title); assertTranslation(article.description);
    assert.ok(article.sources.length > 0, 'guides retain authoring references');
    assert.ok(article.sections.length >= 4, 'guides must contain complete workflows');
    const ids = article.sections.map(section => section.id);
    assert.equal(new Set(ids).size, ids.length, 'heading IDs are unique within each guide');
    for (const section of article.sections) {
      assert.match(section.id, /^[a-z][a-z0-9-]+$/);
      assertTranslation(section.title);
      assert.ok(section.blocks.length > 0);
      for (const block of section.blocks) {
        if (block.title) assertTranslation(block.title);
        if (block.text) assertTranslation(block.text);
        for (const text of block.items ?? block.body ?? []) assertTranslation(text);
      }
    }
  }
  Object.values(ui).forEach(assertTranslation);
});

test('search resolves translated headings and body text to real article fragments', () => {
  for (const language of ['EN', 'CN', 'HK']) {
    for (const article of catalog.DOC_ARTICLES) {
      const heading = catalog.localize(article.sections[0].title, language);
      const results = search.searchDocs(heading, language);
      assert.ok(results.some(result => result.href === `${article.path}#${article.sections[0].id}`), `missing ${language} heading result: ${heading}`);
      const block = article.sections.flatMap(section => section.blocks).find(block => block.type === 'paragraph');
      if (block) assert.ok(search.searchDocs(catalog.localize(block.text, language), language).some(result => result.href.startsWith(`${article.path}#`)));
      for (const result of results) {
        const [path, id] = result.href.split('#');
        assert.ok(catalog.DOC_ARTICLES.some(a => a.path === path && a.sections.some(s => s.id === id)));
      }
    }
  }
  assert.deepEqual(search.searchDocs('   ', 'EN'), []);
  assert.deepEqual(search.searchDocs('nonexistentquartzunicorn', 'HK'), []);
  assert.deepEqual(search.searchDocs('CREATING', 'EN'), search.searchDocs('creating', 'EN'));
});

test('every guide renders readable translated articles, stable contents and real destinations', () => {
  for (const language of ['EN', 'CN', 'HK']) {
    for (const article of catalog.DOC_ARTICLES) {
      const html = renderToStaticMarkup(createElement(LanguageContext.Provider, { value: language }, createElement(DocsPage, { path: article.path })));
      assert.ok(html.includes('id="docs-article"'));
      assert.ok(html.includes(`lang="${language === 'EN' ? 'en' : language === 'CN' ? 'zh-CN' : 'zh-HK'}"`));
      assert.equal((html.match(/class="docs-section"/g) ?? []).length, article.sections.length);
      for (const section of article.sections) {
        assert.ok(html.includes(`id="${section.id}"`));
        assert.ok(html.includes(`href="#${section.id}"`));
      }
      assert.ok(html.includes('href="/#contact"'));
      assert.doesNotMatch(html, /ORVEX|server\/services|C:\\|wc_[A-Za-z0-9]{20}/);
    }
  }
});

test('unknown docs routes have a localized recovery page and trailing slashes resolve', () => {
  const missing = renderToStaticMarkup(createElement(LanguageContext.Provider, { value: 'HK' }, createElement(DocsPage, { path: '/docs/missing-guide' })));
  assert.ok(missing.includes(ui.notFound[2]));
  assert.ok(missing.includes('href="/docs"'));
  assert.doesNotMatch(missing, /class="docs-section"/);
  const trailing = renderToStaticMarkup(createElement(DocsPage, { path: '/docs/' }));
  assert.ok(trailing.includes('class="docs-section"'));
});
