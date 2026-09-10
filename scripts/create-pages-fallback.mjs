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

// GitHub Pages serves the SPA fallback with HTTP 404. Meta's privacy-policy
// validator also needs the policy text without running JavaScript, so emit a
// real directory index from the same component used in the app.
const server = await createServer({
  root: projectRoot,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
});

try {
  const { PrivacyPolicyPage } = await server.ssrLoadModule('/src/app/App.tsx');
  const { default: logoUrl } = await server.ssrLoadModule('/src/assets/johncrm.svg');
  const markup = renderToStaticMarkup(createElement(PrivacyPolicyPage))
    .replaceAll(logoUrl, '/privacy-policy/johncrm.svg');
  const template = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
  const html = template
    .replace(/<title>.*?<\/title>/, '<title>Privacy Policy — JOHN CRM</title>')
    .replace(/\s*<script\b[^>]*type="module"[^>]*><\/script>/g, '')
    .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
  const policyDirectory = resolve(distDirectory, 'privacy-policy');
  await mkdir(policyDirectory, { recursive: true });
  await copyFile(
    resolve(projectRoot, 'src/assets/johncrm.svg'),
    resolve(policyDirectory, 'johncrm.svg'),
  );
  await writeFile(resolve(policyDirectory, 'index.html'), html);
} finally {
  await server.close();
}
