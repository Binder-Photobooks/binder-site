// supabase/functions/sitemap/index.ts
//
// Public, unauthenticated sitemap.xml generator. The static sitemap.xml shipped with the site
// only ever lists the fixed top-level pages — it has no way to know about individual Store
// products or Kagaz Journal posts, which live in Supabase and change independently of a
// deploy. This function reads the same `cms` table the site itself reads (keys 'catalog' and
// 'posts'), so every live product and post gets its own <url> entry automatically, and the
// sitemap never goes stale just because nobody remembered to hand-edit a file after publishing
// a new post.
//
// binder.co.in/sitemap.xml is proxied to this function via a rewrite in vercel.json, so Google
// only ever sees a normal same-domain URL — it never sees the raw supabase.co address.
//
// IMPORTANT — deploy this one WITHOUT JWT verification, since Googlebot can't send a Supabase
// auth header (none of the other functions should have this flag; this is the one exception):
//   supabase functions deploy sitemap --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE = 'https://www.binder.co.in'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Mirrors the static sitemap.xml's page list exactly — if a new top-level page is ever added to
// the site, add it here too (and to the static file, as a fallback if this function is ever
// unreachable).
const STATIC_PAGES: [path: string, changefreq: string, priority: string][] = [
  ['/', 'weekly', '1.0'],
  ['/photobooks', 'monthly', '0.9'],
  ['/trade-books', 'monthly', '0.9'],
  ['/art-prints', 'monthly', '0.9'],
  ['/pricing', 'monthly', '0.9'],
  ['/scanning', 'monthly', '0.8'],
  ['/photography', 'monthly', '0.8'],
  ['/store', 'weekly', '0.8'],
  ['/journal', 'weekly', '0.7'],
  ['/isbn', 'monthly', '0.7'],
  ['/publish', 'monthly', '0.7'],
  ['/gallery', 'monthly', '0.6'],
  ['/clients', 'monthly', '0.5'],
  ['/contact', 'yearly', '0.5'],
]

function xmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function isoDate(d?: string | null): string {
  const fallback = new Date().toISOString().slice(0, 10)
  if (!d) return fallback
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? fallback : parsed.toISOString().slice(0, 10)
}
function urlTag(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url><loc>${xmlEscape(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
    })
  }

  const urls: string[] = []
  const today = new Date().toISOString().slice(0, 10)
  for (const [path, freq, pri] of STATIC_PAGES) urls.push(urlTag(SITE + path, today, freq, pri))

  // Dynamic entries are best-effort — if the DB read fails for any reason, we still return a
  // valid sitemap with just the static pages rather than a broken response, so a transient
  // Supabase hiccup can never take the whole sitemap offline for Google.
  try {
    const { data, error } = await sb.from('cms').select('key,value,updated_at').in('key', ['catalog', 'posts'])
    if (error) throw error

    const catalogRow = data?.find((r) => r.key === 'catalog')
    const postsRow = data?.find((r) => r.key === 'posts')

    const products = Array.isArray(catalogRow?.value) ? catalogRow!.value : []
    for (const p of products) {
      const slug = p?.slug || p?.id
      if (!slug) continue
      urls.push(urlTag(`${SITE}/store/${slug}`, isoDate(catalogRow?.updated_at), 'weekly', '0.7'))
    }

    const posts = Array.isArray(postsRow?.value) ? postsRow!.value : []
    for (const post of posts) {
      const slug = post?.slug || post?.id
      if (!slug) continue
      urls.push(urlTag(`${SITE}/journal/${slug}`, isoDate(post?.updated || post?.date), 'monthly', '0.6'))
    }
  } catch (e) {
    console.error('sitemap: failed to load dynamic entries, serving static pages only:', e)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
