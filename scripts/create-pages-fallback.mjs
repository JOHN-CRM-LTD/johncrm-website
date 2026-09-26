import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDirectory = resolve(projectRoot, 'dist');

// Keep generated HTML identical across Windows development and Linux deploys.
const productTemplate = (await readFile(resolve(distDirectory, 'index.html'), 'utf8')).replace(/\r\n?/g, '\n');
await writeFile(resolve(distDirectory, 'index.html'), productTemplate);
await writeFile(resolve(distDirectory, '404.html'), productTemplate);

// Serve product deep links as real pages on static hosts, including refreshes.
for (const [slug, name] of [['john-ai', 'JOHN AI'], ['automations', 'Automations'], ['integrations', 'Integrations']]) {
  const directory = resolve(distDirectory, 'product', slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), productTemplate.replace(/<title>.*?<\/title>/, `<title>${name} · JOHN CRM</title>`));
}

// GitHub Pages serves the SPA fallback with HTTP 404. Meta's privacy-policy
// validator also needs the policy text without running JavaScript, so emit
// both documents as real directory indexes. Keep the client script to enhance
// the readable HTML with smooth document switching and section navigation.
const server = await createServer({
  root: projectRoot,
  // The postbuild SSR server must not invalidate a running dev server's deps.
  cacheDir: resolve(projectRoot, 'node_modules/.vite-pages-ssr'),
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
});

try {
  const { INDUSTRIES } = await server.ssrLoadModule('/src/app/industries/catalog.ts');
  const { INDUSTRY_CONTENT } = await server.ssrLoadModule('/src/app/industries/content.ts');
  // Emit real industry routes so shared links and refreshes return HTTP 200.
  for (const { slug, name } of INDUSTRIES) {
    const directory = resolve(distDirectory, 'industries', slug);
    const description = INDUSTRY_CONTENT[slug].description.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    const html = productTemplate
      .replace(/<title>.*?<\/title>/, `<title>${name} · JOHN CRM</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), html);
  }
  const { PrivacyPolicyPage, TermsOfServicePage, DocumentationShell } = await server.ssrLoadModule('/src/app/App.tsx');
  const { default: logoUrl } = await server.ssrLoadModule('/src/assets/johncrm.svg');
  const template = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
  for (const [path, title, Component] of [
    ['privacy-policy', 'Privacy Policy', PrivacyPolicyPage],
    ['terms-of-service', 'Terms of Service', TermsOfServicePage],
  ]) {
    const markup = renderToStaticMarkup(createElement(Component))
      .replaceAll(logoUrl, `/${path}/johncrm.svg`);
    const html = template
      .replace(/<title>.*?<\/title>/, `<title>${title} · JOHN CRM</title>`)
      .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
    const pageDirectory = resolve(distDirectory, path);
    await mkdir(pageDirectory, { recursive: true });
    await copyFile(
      resolve(projectRoot, 'src/assets/johncrm.svg'),
      resolve(pageDirectory, 'johncrm.svg'),
    );
    await writeFile(resolve(pageDirectory, 'index.html'), html);
  }

  // Documentation needs its real article text and lazy-loaded CSS before JS runs.
  const { DOC_ARTICLES } = await server.ssrLoadModule('/src/app/docs/content.ts');
  const { default: DocsPage } = await server.ssrLoadModule('/src/app/docs/DocsPage.tsx');
  const manifest = JSON.parse(await readFile(resolve(distDirectory, '.vite/manifest.json'), 'utf8'));
  const docsEntry = Object.keys(manifest).find(key => key === 'src/app/docs/DocsPage.tsx' || manifest[key].src === 'src/app/docs/DocsPage.tsx');
  if (!docsEntry) throw new Error('The production manifest is missing the documentation bundle.');
  const docsStyles = new Set();
  const visited = new Set();
  function collectStyles(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    for (const dependency of entry.imports ?? []) collectStyles(dependency);
    for (const stylesheet of entry.css ?? []) docsStyles.add(`/${stylesheet}`);
  }
  collectStyles(docsEntry);
  const styleLinks = [...docsStyles].filter(href => !template.includes(`href="${href}"`))
    .map(href => `<link rel="stylesheet" href="${href}" />`).join('\n    ');
  const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const docsDirectory = resolve(distDirectory, 'docs');
  await mkdir(docsDirectory, { recursive: true });
  await copyFile(resolve(projectRoot, 'src/assets/johncrm.svg'), resolve(docsDirectory, 'johncrm.svg'));
  for (const article of DOC_ARTICLES) {
    const markup = renderToStaticMarkup(createElement(DocumentationShell, null, createElement(DocsPage, { path: article.path })))
      .replaceAll(logoUrl, '/docs/johncrm.svg');
    const html = template
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(article.title[0])} · JOHN CRM Documentation</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(article.description[0])}" />`)
      .replace('</head>', `    ${styleLinks}\n  </head>`)
      .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
    const directory = resolve(distDirectory, article.path.replace(/^\//, ''));
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), html);
  }
} finally {
  await server.close();
}
