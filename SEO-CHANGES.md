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
- **`.htaccess`** (for the Linux host the domain actually points to): HTTPS + www redirect,
  `/pricing` served from `pricing.html`, `/pricing.html` and `/pricing/` redirected to `/pricing`,
  dynamic URLs served from `app.html`, `X-Robots-Tag: noindex` on `/admin`, `/dashboard`,
  `/editor/*`, and the build script, docs and SQL files blocked from public access.
  `vercel.json` has the same rules in case the site ever moves to Vercel; the live host ignores it.
- **`sitemap.xml`** now lists the fixed pages *and* every store product and journal post
  (`scripts/prerender.mjs` reads them from Supabase), so it works on any host.
- Unknown URLs are marked `noindex` instead of passing as a copy of the homepage.
- Clearer H1s on the three start pages; removed the empty `product:price` and `keywords` meta tags
  (product price tags are now added only on product pages); removed empty `src=""` attributes and
  the "upload via Admin" placeholder text; `rel="nofollow"` on the Admin nav link.

## Your workflow from now on

After editing `index.html`, or `SEO_META` / `START_SEO` / `CONTENT_DEFAULTS` in `script.js`:

```bash
node scripts/prerender.mjs     # regenerates the page files, app.html and sitemap.xml
```

then upload the changed files to the host. Also re-run it after publishing a new journal post or
store product, so `sitemap.xml` includes it.

Forgetting this step means the per-page files keep serving the previous version of the markup.
Add new public pages to `PAGES` in `scripts/prerender.mjs` (and `VIEW_LABELS` in `script.js`).

## After deploying

See **UPLOAD-TO-HOST.md** for the upload steps and the checks to run afterwards.

Google Search Console: submit `sitemap.xml` (remove `sitemap-content.xml` if it was submitted); use URL Inspection on
   `/photobooks`, `/pricing` and `/isbn`, confirm "Google-selected canonical" matches each page,
   and request indexing.

## Page speed (v8)

- The Scanning page's 1.5 MB hero video was downloading on **every** page (it sits in a hidden
  section with `preload="auto"`). It now loads only when the Scanning page is shown.
- Every image outside the visible section is `loading="lazy"`, so hidden sections cost nothing; the
  homepage hero image loads with high priority on `/` only.
- Images recompressed (hero 436 KB → 187 KB, 1600 px wide; others 10–40% smaller).
- Supabase library pinned to 2.117.1 and loaded with `defer` (it was render-blocking in `<head>`);
  the Google Font loads without blocking first paint.
- `.htaccess` turns on gzip/Brotli: HTML ~133 KB → ~25 KB, script.js ~475 KB → ~145 KB,
  styles.css ~56 KB → ~13 KB over the wire. (Vercel compresses automatically.)

Result: homepage goes from about 3.2 MB to about 0.6 MB transferred; other pages to about 0.25 MB.

## Homepage headline (v9)

"It's your moment, save it." stays on one line on every screen size: the font scales with the
screen width (20–65 px, `styles.css`), and `fitHeroHeading()` in `script.js` shrinks it further if
a longer headline is ever set in Admin → Content Manager. The built-in default headline now matches
the live one ("save it.").

## Photobooks page (v10)

The three "Choose a size" options on /photobooks (8.5″×8.5″, 12″×12″, 12″×18″) no longer have
border frames; they now sit flush with the rest of the page. The Art Prints size cards are unchanged.

## Ready-to-go Templates page (v11)

Template cards on /templates no longer have border frames or shadows: the thumbnail keeps its
rounded corners, and the title, description and button line up with its left edge. (Styled only
for the public page, `#tplGridV2`; the admin template list is unchanged.)

## Editors dark by default (v12)

All seven editors — Photobook 8.5″, 12″×12″, 12″×18″, Trade Book, Art Prints (set of 4),
Art Print 12×18 and 16×20 — now open in dark mode. The sun/moon button still switches to light
mode, and a customer's choice is remembered on their device.
