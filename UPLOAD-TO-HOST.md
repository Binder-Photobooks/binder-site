# Uploading to the Linux host (Linux SDH Silver)

binder.co.in points to a Linux shared host (103.209.144.240), not Vercel, so the site's routing
rules live in `.htaccess`. `vercel.json` is ignored there.

## Upload

1. In the hosting file manager (or FTP), **download a backup** of the current site folder,
   including the existing `.htaccess` (turn on "show hidden files" — names starting with a dot
   are hidden by default).
2. Upload everything in this folder to the same place, replacing existing files. Make sure
   `.htaccess` is uploaded too; many FTP apps skip hidden files unless told otherwise.
3. You can leave out `scripts/`, `supabase/`, `*.md`, `*.sql` and `vercel.json`; if they are
   uploaded, `.htaccess` blocks public access to the script, docs and SQL.

## Check (in a private browser window)

| Open | Expect |
|---|---|
| `http://binder.co.in/pricing` | ends up at `https://www.binder.co.in/pricing` |
| `https://www.binder.co.in/pricing` | Pricing page; View Source shows `<link rel="canonical" href="https://www.binder.co.in/pricing">` |
| `https://www.binder.co.in/pricing.html` | redirects to `/pricing` |
| a store product or journal post link | opens normally |
| `https://www.binder.co.in/sitemap.xml` | XML list of ~36 URLs |
| `https://www.binder.co.in/scripts/prerender.mjs` | 403 or 404 |

If the whole site shows "500 Internal Server Error" after uploading, the host doesn't allow one
of the directives: rename `.htaccess` to `htaccess-off` to restore the site at once, then ask the
host whether `mod_rewrite` and `mod_headers` are enabled (both are standard on Linux hosting).

## Later

- The Vercel project `kagaz` still holds binder.co.in / www.binder.co.in with an old August build.
  It isn't serving traffic (DNS points to the Linux host). Remove the domains there, or deploy this
  version to it, so nobody switches DNS to the old build by mistake.
- The Supabase `sitemap` function is no longer needed; `sitemap.xml` covers everything.
