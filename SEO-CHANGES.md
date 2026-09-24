# SEO changes (September 2026)

## What changed

- **One HTML file per public page.** `photobooks.html`, `pricing.html`, `isbn.html` and the other
  pages are generated from `index.html` by `scripts/prerender.mjs`. Each has its own title,
  description, canonical URL, Open Graph/Twitter tags, breadcrumb (and Service) structured data,
  and the right section visible. Before, every URL served the homepage's HTML with a canonical
  pointing at the homepage, so Google folded every page into `/`.
- **`app.html`** is served for dynamic URLs (`/store/<slug>`, `/journal/<slug>`, `/admin`,
  `/editor/…`). It has no canonical tag; `script.js` adds the correct one for each product/post.
- **Private UI removed from public pages.** Dashboard, admin, checkout, sign-in, the editors and
  their modals now live inside `<template id="tpl-private">` in `index.html`. `script.js`
  (`mountPrivate()`) inserts it the first time anything needs it, so everything works as before,
  but search engines no longer index admin/checkout text on every page.
  This is about indexing, not security: the markup is still in the page source and `script.js`.
  Real protection remains Supabase row-level security.
- **`vercel.json`**: dynamic URLs fall back to `app.html`; `X-Robots-Tag: noindex` on `/admin`,
  `/dashboard`, `/editor/*`; `/sitemap-content.xml` proxies the Supabase `sitemap` function so store
  products and journal posts are listed.
- **`robots.txt`** lists both sitemaps.
- Unknown URLs are marked `noindex` instead of passing as a copy of the homepage.
- Clearer H1s on the three start pages; removed the empty `product:price` and `keywords` meta tags
  (product price tags are now added only on product pages); removed empty `src=""` attributes and
  the "upload via Admin" placeholder text; `rel="nofollow"` on the Admin nav link.

## Your workflow from now on

After editing `index.html`, or `SEO_META` / `START_SEO` / `CONTENT_DEFAULTS` in `script.js`:

```bash
node scripts/prerender.mjs     # regenerates the page files, app.html and sitemap.xml
vercel --prod
```

Forgetting this step means the per-page files keep serving the previous version of the markup.
Add new public pages to `PAGES` in `scripts/prerender.mjs` (and `VIEW_LABELS` in `script.js`).

## After deploying

1. Vercel → Project → Settings → Domains: make sure `binder.co.in` redirects to
   `www.binder.co.in` (the live root was not redirecting when checked).
2. Check `https://www.binder.co.in/sitemap-content.xml` returns XML.
3. Google Search Console: submit `sitemap.xml` and `sitemap-content.xml`; use URL Inspection on
   `/photobooks`, `/pricing` and `/isbn`, confirm "Google-selected canonical" matches each page,
   and request indexing.
