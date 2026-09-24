import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDirectory = resolve(projectRoot, 'dist');

await copyFile(
  resolve(distDirectory, 'index.html'),
  resolve(distDirectory, '404.html'),
);

// Serve product deep links as real pages on static hosts, including refreshes.
const productTemplate = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
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
  const { PrivacyPolicyPage, TermsOfServicePage } = await server.ssrLoadModule('/src/app/App.tsx');
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
} finally {
  await server.close();
}
