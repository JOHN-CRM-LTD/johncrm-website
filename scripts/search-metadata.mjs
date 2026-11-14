import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const origin = 'https://www.johncrm.com';
const image = `${origin}/brand/johncrm-social.png`;
const descriptions = {
  '/product/john-ai/': 'Answer customer enquiries through WhatsApp and web chat with JOHN CRM. Connect your business knowledge, support multiple languages and keep your team in control.',
  '/product/automations/': 'Build customer follow-up and business workflows in JOHN CRM. Connect conversations to practical next steps with automations configured for your team.',
  '/product/integrations/': 'Connect JOHN CRM to your knowledge base, business data and existing API endpoints. Give customer conversations the information they need.',
  '/privacy-policy/': 'How 2x4 Technology Limited handles personal information when you use JOHN CRM. Read our privacy policy and find our Hong Kong contact details.',
  '/terms-of-service/': 'Read the terms for using JOHN CRM, operated by 2x4 Technology Limited in Hong Kong, including account responsibilities and service conditions.',
};
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${origin}/#organization`,
  name: '2x4 Technology Limited',
  legalName: '2x4 Technology Limited',
  url: `${origin}/`,
  logo: `${origin}/brand/johncrm-logo-square.png`,
  description: 'The Hong Kong company behind JOHN CRM, an AI customer-conversation platform for WhatsApp, web chat and business automation.',
  brand: { '@type': 'Brand', name: 'JOHN CRM', url: `${origin}/`, logo: `${origin}/brand/johncrm-logo-square.png` },
  email: 'info@hkboss.com.hk',
  telephone: '+85224852033',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Unit 2, 3/F, Block B, Hoi Luen Industrial Centre, 55 Hoi Yuen Road',
    addressLocality: 'Kwun Tong',
    addressRegion: 'Kowloon',
    addressCountry: 'HK',
  },
};
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const decode = value => value.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

// Use the actual static build inventory, keeping routing and the sitemap in sync.
async function indexFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'assets' || entry.name === 'brand') continue;
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await indexFiles(filename));
    else if (entry.isFile() && entry.name === 'index.html') files.push(filename);
  }
  return files.sort();
}

export async function writeSearchMetadata(directory) {
  const urls = [];
  for (const filename of await indexFiles(directory)) {
    const route = relative(directory, filename).split(sep).join('/').replace(/index\.html$/, '');
    const pathname = `/${route}`;
    const url = `${origin}${pathname}`;
    let html = await readFile(filename, 'utf8');
    const title = decode(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? 'JOHN CRM');
    const description = descriptions[pathname] ?? decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? 'JOHN CRM by 2x4 Technology Limited.');
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(description)}" />`);
    const tags = [
      `<link rel="canonical" href="${url}" />`,
      '<meta property="og:type" content="website" />',
      '<meta property="og:site_name" content="JOHN CRM" />',
      '<meta property="og:locale" content="en_HK" />',
      `<meta property="og:title" content="${escape(title)}" />`,
      `<meta property="og:description" content="${escape(description)}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${image}" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="627" />',
      '<meta property="og:image:alt" content="JOHN CRM — Revenue beyond business hours. AI customer conversations through WhatsApp and web chat." />',
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escape(title)}" />`,
      `<meta name="twitter:description" content="${escape(description)}" />`,
      `<meta name="twitter:image" content="${image}" />`,
    ];
    if (pathname === '/') tags.push(`<script type="application/ld+json">${JSON.stringify(organization).replaceAll('<', '\\u003c')}</script>`);
    html = html.replace(/\s*<!-- search-metadata -->[\s\S]*?<!-- \/search-metadata -->/, '');
    html = html.replace('</head>', `    <!-- search-metadata -->\n    ${tags.join('\n    ')}\n    <!-- /search-metadata -->\n  </head>`);
    await writeFile(filename, html);
    urls.push(url);
  }
  const fallback = join(directory, '404.html');
  const fallbackHtml = (await readFile(fallback, 'utf8'))
    .replace(/\s*<!-- search-metadata -->[\s\S]*?<!-- \/search-metadata -->/, '')
    .replace(/\s*<meta name="robots"[^>]*>/g, '')
    .replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>');
  await writeFile(fallback, fallbackHtml);
  await writeFile(join(directory, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(join(directory, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
}
