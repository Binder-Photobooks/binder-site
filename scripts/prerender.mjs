// scripts/prerender.mjs
//
// Generates one static HTML file per public page (photobooks.html, pricing.html, …) from
// index.html, so every URL in the sitemap is served with its OWN title, description,
// canonical, Open Graph tags, structured data and visible section — instead of every URL
// receiving the homepage's HTML and relying on JavaScript to fix it afterwards.
//
// Also writes:
//   app.html     — the shell the server returns for dynamic URLs (/store/<slug>, /journal/<slug>,
//                  /admin, /editor/…). It has no canonical tag, so it never tells Google that
//                  a product or post "is really the homepage"; script.js adds the right one.
//   sitemap.xml  — the fixed pages below plus every store product and journal post (from Supabase).
//
// Page titles/descriptions are read from SEO_META and START_SEO in script.js, and start-page
// copy from CONTENT_DEFAULTS — so there is still exactly one place to edit each of them.
//
// Run after ANY change to index.html, or to SEO_META / START_SEO / CONTENT_DEFAULTS in
// script.js, then deploy as usual:
//     node scripts/prerender.mjs
// No dependencies; Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.binder.co.in';
const DEFAULT_OG_IMAGE = SITE + '/images/img-hero.jpg';

// path, view id (or start-page key), sitemap changefreq, priority, og image
const PAGES = [
  { path: '/',            view: 'home',        freq: 'weekly',  pri: '1.0' },
  { path: '/photobooks',  start: 'photobook',  freq: 'monthly', pri: '0.9', label: 'Photobooks' },
  { path: '/trade-books', start: 'tradebook',  freq: 'monthly', pri: '0.9', label: 'Trade Books', img: '/images/img-3.jpg' },
  { path: '/art-prints',  start: 'artprints',  freq: 'monthly', pri: '0.9', label: 'Art Prints', img: '/images/img-5.jpg' },
  { path: '/pricing',     view: 'pricing',     freq: 'monthly', pri: '0.9', label: 'Pricing' },
  { path: '/scanning',    view: 'scanning',    freq: 'monthly', pri: '0.8', label: 'Scanning Services' },
  { path: '/photography', view: 'photography', freq: 'monthly', pri: '0.8', label: 'Photography Services' },
  { path: '/store',       view: 'store',       freq: 'weekly',  pri: '0.8', label: 'Store' },
  { path: '/journal',     view: 'journal',     freq: 'weekly',  pri: '0.7', label: 'Kagaz Journal' },
  { path: '/isbn',        view: 'isbn',        freq: 'monthly', pri: '0.7', label: 'Free ISBN', img: '/images/img-6.jpg' },
  { path: '/publish',     view: 'publish',     freq: 'monthly', pri: '0.7', label: 'Publish with us' },
  { path: '/gallery',     view: 'gallery',     freq: 'monthly', pri: '0.6', label: 'Gallery' },
  { path: '/templates',   view: 'templates',   freq: 'monthly', pri: '0.6', label: 'Templates' },
  { path: '/clients',     view: 'clients',     freq: 'monthly', pri: '0.5', label: 'Clients' },
  { path: '/contact',     view: 'contact',     freq: 'yearly',  pri: '0.5', label: 'Contact' },
  { path: '/sitemap',     view: 'sitemap',     freq: 'monthly', pri: '0.3', label: 'Sitemap' },
];

// ---------- read shared config out of script.js ----------
const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
function extractObject(name) {
  const start = js.indexOf(name + '={');
  if (start < 0) throw new Error(`prerender: could not find "${name}={" in script.js`);
  let i = js.indexOf('{', start), depth = 0, quote = null;
  for (let j = i; j < js.length; j++) {
    const c = js[j];
    if (quote) { if (c === '\\') { j++; continue; } if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return new Function('return ' + js.slice(i, j + 1))();
  }
  throw new Error(`prerender: unbalanced braces reading ${name}`);
}
const SEO_META = extractObject('const SEO_META');
const START_SEO = extractObject('const START_SEO');
const CONTENT = extractObject('const CONTENT_DEFAULTS');
const START_H1 = { photobook: 'Custom Photobook Printing', tradebook: 'Trade Book Printing & Self-Publishing', artprints: 'Archival Art Print Printing' };
const START_KEYS = { photobook: 'Photobook', tradebook: 'Tradebook', artprints: 'Artprints' };
const START_PRICE = { photobook: '2200', tradebook: '1000', artprints: '800' };

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function setAttr(html, selectorRe, attr, value) {
  const m = html.match(selectorRe);
  if (!m) throw new Error('prerender: tag not found: ' + selectorRe);
  const tag = m[0];
  const next = tag.replace(new RegExp(attr + '="[^"]*"'), `${attr}="${esc(value)}"`);
  return html.replace(tag, next);
}
function setHead(html, { title, desc, url, image, ld }) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = setAttr(html, /<meta name="description"[^>]*>/, 'content', desc);
  html = setAttr(html, /<link rel="canonical"[^>]*>/, 'href', url);
  html = setAttr(html, /<meta property="og:title"[^>]*>/, 'content', title);
  html = setAttr(html, /<meta property="og:description"[^>]*>/, 'content', desc);
  html = setAttr(html, /<meta property="og:url"[^>]*>/, 'content', url);
  html = setAttr(html, /<meta property="og:image"[^>]*>/, 'content', image);
  html = setAttr(html, /<meta name="twitter:title"[^>]*>/, 'content', title);
  html = setAttr(html, /<meta name="twitter:description"[^>]*>/, 'content', desc);
  html = setAttr(html, /<meta name="twitter:image"[^>]*>/, 'content', image);
  const ldTag = '<script type="application/ld+json" id="ldPage"></script>';
  if (!html.includes(ldTag)) throw new Error('prerender: empty #ldPage script tag not found in index.html');
  if (ld) html = html.replace(ldTag, `<script type="application/ld+json" id="ldPage">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  return html;
}
// Homepage hero image: high priority on "/" only. On every other page it sits in a hidden section,
// so make it lazy there and the browser never downloads it.
const HERO_EAGER = 'id="heroImage" src="/images/img-hero.jpg" alt="Binder photobooks, trade books, and art prints" loading="eager" fetchpriority="high"';
const heroLazy = html => html.replace(HERO_EAGER, 'id="heroImage" src="/images/img-hero.jpg" alt="Binder photobooks, trade books, and art prints" loading="lazy" decoding="async"');
function setActiveView(html, viewId) {
  html = heroLazy(html);
  html = html.replace('<section class="view active" id="view-home">', '<section class="view" id="view-home">');
  const tag = `<section class="view" id="view-${viewId}">`;
  if (!html.includes(tag)) throw new Error('prerender: view not found: ' + viewId);
  return html.replace(tag, `<section class="view active" id="view-${viewId}">`);
}
const breadcrumb = (label, url) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: label, item: url },
  ],
});
// Static version of the start page, shown to crawlers and before script.js runs; renderStartPage()
// in script.js replaces it with the live (admin-editable) version on load.
function startPageHtml(key) {
  const k = START_KEYS[key];
  const need = (CONTENT[`start${k}Need`] || '').split('\n').map(s => s.trim()).filter(Boolean);
  const steps = (CONTENT[`start${k}Steps`] || '').split('\n').map(s => s.trim()).filter(Boolean)
    .map(l => { const i = l.indexOf('|'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });
  return `
    <span class="tag">Start creating</span>
    <h1>${esc(START_H1[key])}</h1>
    <p class="lead">${esc(CONTENT[`start${k}Intro`] || START_SEO[key].desc)}</p>
    ${need.length ? `<h2 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">What you'll need before you start</h2>
    <ul>${need.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    ${steps.length ? `<h2 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">How it works</h2>
    <ol>${steps.map(([t, d]) => `<li><strong>${esc(t)}</strong> — ${esc(d)}</li>`).join('')}</ol>` : ''}
    <p><a href="/pricing">See full pricing →</a></p>`;
}

// ---------- build ----------
const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!template.includes('<section class="view active" id="view-home">')) throw new Error('prerender: index.html must have view-home active');
if (!template.includes(HERO_EAGER)) console.warn('prerender: WARNING — homepage hero <img> markup changed; update HERO_EAGER in this script.');
const written = [];

for (const page of PAGES) {
  if (page.path === '/') continue; // index.html is itself the homepage
  const url = SITE + page.path;
  const image = page.img ? SITE + page.img : DEFAULT_OG_IMAGE;
  let html = template, meta, ld;
  if (page.start) {
    meta = START_SEO[page.start];
    const service = {
      '@context': 'https://schema.org', '@type': 'Service', serviceType: START_H1[page.start],
      provider: { '@id': SITE + '/#business' }, areaServed: ['Delhi', 'India'], description: meta.desc,
      offers: { '@type': 'Offer', priceCurrency: 'INR', price: START_PRICE[page.start], url },
    };
    ld = [service, breadcrumb(page.label, url)];
    html = setActiveView(html, 'start');
    html = html.replace('<div class="page-wrap" id="startPageContent"></div>', `<div class="page-wrap" id="startPageContent">${startPageHtml(page.start)}</div>`);
  } else {
    meta = SEO_META[page.view];
    if (!meta) throw new Error('prerender: no SEO_META entry for ' + page.view);
    ld = breadcrumb(page.label, url);
    html = setActiveView(html, page.view);
  }
  html = setHead(html, { title: meta.title, desc: meta.desc, url, image, ld });
  const file = page.path.slice(1) + '.html';
  fs.writeFileSync(path.join(ROOT, file), html);
  written.push(file);
}

// App shell for dynamic routes (/store/<slug>, /journal/<slug>, /admin, /editor/…) — served by
// .htaccess rule 5. No canonical, no og:url; script.js sets both per page.
let app = heroLazy(template).replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '');
fs.writeFileSync(path.join(ROOT, 'app.html'), app);
written.push('app.html');

// Sitemap: the fixed pages above, plus every Store product and Kagaz Journal post, read live
// from Supabase (the same public `cms` rows the site itself reads). If Supabase can't be reached,
// the fixed pages are still written and a warning is printed — re-run when you're online.
const today = new Date().toISOString().slice(0, 10);
const day = v => { const d = new Date(v || ''); return isNaN(d) ? today : d.toISOString().slice(0, 10); };
const urls = PAGES.map(p => [SITE + p.path, today, p.freq, p.pri]);
try {
  const sUrl = js.match(/const SUPABASE_URL='([^']+)'/)?.[1];
  const sKey = js.match(/const SUPABASE_KEY='([^']+)'/)?.[1];
  if (!sUrl || !sKey) throw new Error('SUPABASE_URL / SUPABASE_KEY not found in script.js');
  const res = await fetch(`${sUrl}/rest/v1/cms?select=key,value,updated_at&key=in.(catalog,posts)`, { headers: { apikey: sKey } });
  if (!res.ok) throw new Error('Supabase responded ' + res.status);
  const rows = await res.json();
  const row = k => rows.find(r => r.key === k) || {};
  const catalog = row('catalog'), posts = row('posts');
  for (const p of Array.isArray(catalog.value) ? catalog.value : []) {
    const slug = p?.slug || p?.id; if (slug) urls.push([`${SITE}/store/${encodeURIComponent(slug)}`, day(catalog.updated_at), 'weekly', '0.7']);
  }
  for (const p of Array.isArray(posts.value) ? posts.value : []) {
    const slug = p?.slug || p?.id; if (slug) urls.push([`${SITE}/journal/${encodeURIComponent(slug)}`, day(p.updatedISO || p.updated || p.dateISO || p.date), 'monthly', '0.6']);
  }
  console.log(`prerender: sitemap includes ${urls.length - PAGES.length} store products / journal posts`);
} catch (e) {
  console.warn('prerender: WARNING — could not load products/posts from Supabase (' + e.message + '). sitemap.xml lists the fixed pages only.');
}
const xmlEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, mod, f, pr]) => `  <url><loc>${xmlEsc(loc)}</loc><lastmod>${mod}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
written.push('sitemap.xml');

console.log('prerender: wrote ' + written.join(', '));
