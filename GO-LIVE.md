# Binder — Complete Go-Live Guide

Everything needed to take Binder fully live: server-locked payments,
verified receipts, automatic PDF generation, and email notifications.

Estimated time: 30–45 minutes.

---

## Step 0 — Set up your real admin account

The old shared `binder / binder2026` login is gone — it was a password
hardcoded in `script.js`, which anyone could read straight out of the page
source, so it never actually protected anything. Admin access is now a real
Supabase Auth account, enforced by the database itself (not just the login
screen).

1. Run **`supabase-setup.sql`** in Supabase → SQL Editor (this creates the
   `profiles` table, the `is_admin()` function, and the RLS policies that
   depend on it — do this before `cms-setup.sql`).
2. Create your admin account: **Supabase → Authentication → Users → Add user**
   (or just sign up normally on the live site with the email you want as admin).
3. Make that account an admin — run in SQL Editor, with your real email:
   ```sql
   insert into public.profiles (id, email, is_admin)
   select id, email, true from auth.users where email = 'you@binder.co.in'
   on conflict (id) do update set is_admin = true;
   ```
4. Go to `binder.co.in/admin` and sign in with that email + password.

Add more admins later by repeating steps 2–3 for another email.

---

## Step 1 — Get your Razorpay Key Secret

You already have the Key ID (`rzp_live_glQFciELiCuURl`) in the site.
You need the **Key Secret** — it's in your Razorpay dashboard:

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Settings → API Keys → Regenerate Test/Live Keys**
3. Copy the **Key Secret** (shown only once — save it securely)

---

## Step 2 — Set up Resend for emails (free)

1. Go to [resend.com](https://resend.com) and sign up
2. **Domains → Add Domain → `binder.co.in`**
3. Add the DNS records Resend shows you at bagful.net
   (same way you added Vercel records — DNS Management)
4. Once verified, go to **API Keys → Create API Key**
5. Copy the key (`re_xxxxxxxxxxxx`)

---

## Step 3 — Install Supabase CLI and deploy all functions

Open **Terminal** on your Mac:

```bash
# Install Supabase CLI (one-time)
brew install supabase/tap/supabase

# Log in
supabase login

# Go to your binder-deploy folder
cd ~/Downloads/binder-deploy

# Link to your project
supabase link --project-ref sooqtzedurtjiisjdmbz

# Set ALL secrets (replace values with your real ones)
supabase secrets set RAZORPAY_KEY_ID=rzp_live_glQFciELiCuURl
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_here
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set ADMIN_EMAIL=hello@binder.co.in
supabase secrets set SITE_URL=https://binder.co.in

# Deploy all three functions
supabase functions deploy create-razorpay-order --no-verify-jwt=false
supabase functions deploy verify-razorpay-payment --no-verify-jwt=false
supabase functions deploy render-pdf --no-verify-jwt=false
```

---

## Step 4 — Create the pdfs storage bucket

1. Supabase dashboard → **Storage → New bucket**
2. Name: `pdfs`
3. Toggle **Public bucket** ON
4. **Create**

(You already created `photos` — this is the same process.)

---

## Step 5 — Run the database SQL

Run **`supabase-setup.sql`** (the full file) in Supabase → **SQL Editor → New
query** — this creates the `orders` table, the render jobs queue, and all
their RLS policies in one go. (If you already did this in Step 0, you're
done — it's safe to run more than once.)

---

## Step 6 — Set Supabase Auth URLs

1. Supabase → **Authentication → URL Configuration**
2. **Site URL** → `https://binder.co.in`
3. **Redirect URLs** → add `https://binder.co.in`

This ensures password-reset and email-confirmation links
go to the right place.

---

## Step 7 — Test everything end-to-end

1. Go to `binder.co.in`, open the Photobook editor
2. Add a photo, set a title, click **Order print**
3. Complete checkout with a real card (or use test mode first —
   set `rzp_test_` key in Admin → Payments, use card
   `4111 1111 1111 1111`, any expiry, any CVV)
4. Check:
   - Order appears in Admin → Orders ✓
   - PDF Manager shows ⚙️ Rendering… then ✅ done ✓
   - You receive an admin email with the order + PDF link ✓
   - Customer receives a confirmation email ✓
   - Admin → Orders shows "Verified" badge on the payment ✓

---

## What each function does

**`create-razorpay-order`**
Creates a server-locked Razorpay order before checkout opens.
The amount is set on the server, not the browser — so it can't be
manipulated. Returns an `order_id` that Razorpay Checkout uses.

**`verify-razorpay-payment`**
After a customer pays, Razorpay sends back a cryptographic signature.
This function checks it using HMAC-SHA256 with your Key Secret.
If the signature matches, the payment is genuine. If not, it flags it.
Orders show "Verified" or "Unverified" in the Admin panel.

**`render-pdf`**
Triggered automatically when an order is placed. Builds the full
design from the saved snapshot, renders it to a proper PDF (photos
at 300 DPI, text as real selectable vector), uploads to Supabase
Storage, and emails links to you and the customer.

---

## After go-live — ongoing operations

| Task | Where |
|---|---|
| View orders | Admin → Orders |
| Download PDFs | Admin → PDF Manager |
| Change order status | Admin → Orders → Status dropdown |
| Edit a design before printing | Admin → PDF Manager → Edit Design |
| Update Razorpay key | Admin → Payments |
| Rotate admin password | Supabase → Authentication → Users → that admin account → reset password |

---

## Troubleshooting

**Payments succeeding but showing "Unverified"**
The `verify-razorpay-payment` function isn't deployed or the
`RAZORPAY_KEY_SECRET` secret is wrong. Check Supabase → Edge
Functions → verify-razorpay-payment → Logs.

**PDFs not rendering**
Check Supabase → Edge Functions → render-pdf → Logs.
Most common cause: `pdfs` bucket doesn't exist, or
`RAZORPAY_KEY_SECRET` / `RESEND_API_KEY` secrets are missing.

**Emails not arriving**
Check Resend dashboard for delivery status. Make sure
`binder.co.in` domain is verified there and DNS records propagated.

**Function returns 500 with "credentials not configured"**
Run `supabase secrets set` again — the secret names must match
exactly as shown in Step 3.
