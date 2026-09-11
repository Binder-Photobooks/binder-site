# Deploying Binder to binder.co.in — full path

This is the complete route from "files on disk" to "live at binder.co.in,"
plus how to make changes safely afterward. Read once, then use the
**Quick reference** at the bottom for everyday use.

---

## Part 1 — One-time setup

You only do this once. If binder.co.in is already live, skip to **Part 2**.

### 1. Deploy the site to Vercel

The site is a static bundle — `index.html`, `styles.css`, `script.js`,
`images/` — no build step.

**Dashboard (easiest):**
1. Go to [vercel.com/new](https://vercel.com/new).
2. Drag this whole folder onto the page.
3. Vercel detects it as a static site and deploys it. You get a
   `*.vercel.app` URL — open it and confirm the site loads correctly
   before touching DNS.

**CLI (if you prefer):**
```bash
npm i -g vercel
vercel --prod
```
Run this from inside the folder. First run links/creates the project;
`--prod` promotes it live.

### 2. Add the domain in Vercel

In the Vercel dashboard: **Project → Settings → Domains → Add**, and add both:
- `binder.co.in`
- `www.binder.co.in`

Vercel will show you the exact DNS records it needs. They're normally the
ones below, but **always check the live values in Vercel's Domains panel
first** — they're the source of truth if anything differs.

### 3. Point DNS at Vercel (bagful.net)

Domain and DNS are both hosted at **bagful.net**. Log in to
`control.bagful.net`, then:

**Nameservers** (Domain → Manage → Nameservers): leave these as bagful's
own defaults —
```
ns101.bagful.net
ns102.bagful.net
ns103.bagful.net
ns104.bagful.net
```
Do **not** switch to "custom nameservers" unless you're deliberately moving
DNS hosting elsewhere (e.g., to Cloudflare). Keeping bagful's defaults is
what lets you edit records directly in the next step.

**DNS Management** (same sidebar, below Nameservers): add/confirm:

| Host | Type | Value |
|---|---|---|
| `@` | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

Then **remove anything else on `@` that conflicts** — specifically:
- Any *other* A record on `@` pointing elsewhere (there was previously a
  stray `75.2.60.5` — deleted).
- Any `URL Redirect` record on `@` (bagful's web-forwarding feature) — this
  intercepts the root domain independently of the A record and will break
  or loop the site if left in place. There should be exactly one A record
  on `@`, nothing else.

Leave MX (mail), SPF/TXT (Google verification), and unrelated subdomains
(`pms`, etc.) alone — they're unaffected.

### 4. Wait for propagation

Usually minutes; can take longer. Vercel's Domains panel flips each domain
to **"Valid Configuration"** once it sees the records, and auto-issues a
free HTTPS certificate — nothing else to do for TLS.

Check with `dig binder.co.in +short` (should return `76.76.21.21`) or
[dnschecker.org](https://dnschecker.org).

### 5. Point Supabase at the real domain

In your Supabase project: **Authentication → URL Configuration**
- **Site URL** → `https://binder.co.in`
- **Redirect URLs** → add `https://binder.co.in` and the `*.vercel.app` URL

### 6. Pre-launch checklist

- [ ] Admin login now requires a real Supabase Auth account flagged
      `is_admin = true` in `public.profiles` — see `GO-LIVE.md` Step 0.
      The old hardcoded `binder2026` password in `script.js` is gone.
- [ ] Confirm **Supabase RLS is enabled on every table**. The anon key is
      public in the page; without RLS, customer data is world-readable.
- [ ] Confirm Supabase Site URL / Redirect URLs (step 5).

---

## Part 2 — Making changes after launch

Two workflows. Pick one per your comfort level — both end with the same
result (binder.co.in updated).

### Option A — Git-connected (recommended)

Best if you'll be changing things regularly. Once set up, every change is
just *edit → commit → push* — no manual deploy step, ever again.

**One-time setup:**
1. Push this folder to a GitHub repo (`git init`, `git add .`,
   `git commit`, push to a new repo).
2. In Vercel: **Add New → Project → Import** that repo.
3. Vercel redeploys the project automatically on every push to the main
   branch, and keeps binder.co.in pointed at whatever's newest.

**Every change after that:**
```bash
git pull                      # get the latest
# ...edit index.html / styles.css / script.js...
git add .
git commit -m "describe the change"
git push
```
Vercel deploys within a minute or two. No further steps.

### Option B — Manual redeploy (no Git)

Fine for occasional changes.

1. Edit the files locally in a text editor.
2. **Preview before pushing** — open `index.html` directly in a browser,
   or run `npx serve` in the folder, and click through the change.
3. Deploy the updated folder:
   - **CLI:** `vercel --prod` from inside the folder (pushes straight to
     the existing project and domain).
   - **Dashboard:** drag the updated folder onto the project's deployments
     page.

The domain itself never needs re-touching — it always follows whichever
deployment is current.

### A third option — no file changes at all

A lot of day-to-day content lives in the **Admin panel** on the live site
(`binder` login) and saves straight to Supabase: homepage/page copy, blog
posts, product pricing, site colors, ISBN guide text. Changes there are
live immediately — no redeploy, nothing in this document applies.

You only need Option A or B for things that mean editing actual code:
layout, new features, bug fixes, or anything baked into `script.js` /
`styles.css` directly (like the admin password itself).

### Rolling back a bad deploy

Vercel keeps every past deployment. In the dashboard:
**Project → Deployments → find the last good one → ⋯ → Promote to
Production.** Instant, no file changes needed — useful if a push breaks
something and you need the site back up while you fix it properly.

---

## Quick reference

| I want to… | Do this |
|---|---|
| Edit homepage/blog/pricing text | Admin panel on the live site — no redeploy |
| Change code (layout, features, bugs) | Edit files → `git push` (Option A) or `vercel --prod` (Option B) |
| Add/remove a DNS record | `control.bagful.net` → DNS Management |
| Check if DNS is correct | Vercel → Project → Domains (should say "Valid Configuration") |
| Undo a bad deploy | Vercel → Deployments → promote a previous one |
| Rotate the admin password | Edit `script.js`, redeploy (see Part 2) |
