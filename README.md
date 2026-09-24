# Binder — static site

Plain static site, split into separate files for easier maintenance:

- `index.html` — markup only
- `styles.css` — all site styling
- `script.js` — all app logic (editors, cart, admin, checkout, etc.)
- `images/` — the photos used on the homepage (hero + product cards)

No build step, but after editing `index.html` run `node scripts/prerender.mjs` to regenerate
the per-page HTML files (see **[SEO-CHANGES.md](./SEO-CHANGES.md)**). External libraries (Supabase JS, jsPDF, html2canvas, heic2any,
mammoth, Razorpay) load from CDN at runtime, same as before.

## Deploy & maintain

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full path: first deploy,
DNS at bagful.net, and how to make changes safely afterward.

Quick version for a first deploy:
```bash
npm i -g vercel
vercel --prod
```
Then add `binder.co.in` under the project's Domains settings in Vercel.
