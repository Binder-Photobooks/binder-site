# Setting up server-side PDF rendering

This guide sets up the `render-pdf` Supabase Edge Function — the server
that automatically generates print-ready PDFs when an order is placed,
then emails the files to you and a confirmation to the customer.

---

## Step 1 — Run the SQL (Supabase dashboard)

1. Go to supabase.com/dashboard → your project → **SQL Editor**.
2. Open `supabase-setup.sql` (in this folder) and paste it all in.
3. Click **Run**. You should see "Success."

## Step 2 — Create the PDF storage bucket

1. Supabase dashboard → **Storage** → **New bucket**.
2. Name: `pdfs` (exactly that, lowercase).
3. Toggle **Public bucket** ON.
4. Create.

## Step 3 — Get a free Resend account (for emails)

1. Go to [resend.com](https://resend.com) and sign up (free tier sends
   3,000 emails/month — plenty for print orders).
2. Add and verify `binder.co.in` as a sending domain (follow their guide —
   it adds a few DNS records at bagful.net, same way you added Vercel records).
3. Create an **API key** and copy it.

## Step 4 — Install the Supabase CLI and deploy

On your Mac, open **Terminal** (Applications → Utilities → Terminal):

```bash
# Install Supabase CLI (one-time)
brew install supabase/tap/supabase

# Log in
supabase login

# From inside the binder-deploy folder:
cd ~/Downloads/binder-deploy

# Link to your Supabase project
supabase link --project-ref sooqtzedurtjiisjdmbz

# Set the secrets the function needs
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set ADMIN_EMAIL=hello@binder.co.in
supabase secrets set SITE_URL=https://binder.co.in

# Deploy the function
supabase functions deploy render-pdf --no-verify-jwt=false
```

SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically —
you don't need to set those.

## Step 5 — Test it

1. Place a test order on binder.co.in (you can use the admin panel to
   mark a test order as Received, or actually go through checkout).
2. In Supabase dashboard → **Edge Functions** → **render-pdf** → **Logs**,
   you should see the function fire within a few seconds.
3. In Supabase dashboard → **Storage** → **pdfs**, you should see a PDF
   appear inside a folder named after the order ID.
4. You and the customer should each receive an email.

## Step 6 — Verify Admin PDF Manager

In the site's Admin panel → **PDF Manager**, orders now show:
- ⏳ pending — order placed, render queued
- ⚙️ Rendering… — function is running
- ✅ done — PDF is ready, Download button appears (links to permanent URL)
- ❌ failed — something went wrong (error message shown, Re-render button
  to retry)

PDFs are now permanent URLs in Supabase Storage — they survive browser
refreshes, machine restarts, and any number of admin sessions.

---

## How it works end-to-end

```
Customer places order
  → order saved to Supabase orders table
  → site calls render-pdf Edge Function (once for cover, once for interior)
      → function builds a full HTML page from the design snapshot
      → Puppeteer renders it to PDF at 300 DPI
      → PDF uploaded to Supabase Storage (pdfs bucket)
      → orders table updated with PDF URL + render_status = 'done'
      → customer receives confirmation email with order details
      → admin receives email with order details + direct PDF download links
  → Admin PDF Manager shows live status + Download buttons
```

## Troubleshooting

**Function not firing:** Check Supabase → Edge Functions → render-pdf → Logs.
The most common issue is a missing secret (RESEND_API_KEY or ADMIN_EMAIL).

**PDF renders blank:** The snapshot's photoMap needs permanent Supabase Storage
URLs. Photos uploaded from the editor go to the `photos` bucket automatically.
Photos that were only local (never saved to Supabase) won't appear in the PDF.
Remind customers to hit Save before ordering.

**Email not arriving:** Check the Resend dashboard for delivery status.
Make sure the `binder.co.in` domain is verified there and the DNS records
are propagated.

**Puppeteer times out on large books:** The 120-second timeout covers most
books up to ~300 pages. Very large books (500+ pages) may need the timeout
increased in the Edge Function. Contact support@supabase.com if needed.
