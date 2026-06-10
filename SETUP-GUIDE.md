# Binder — Netlify CMS Setup Guide
## Complete step-by-step instructions

---

## What you'll have when done

- Your site live at `https://your-site.netlify.app` (or your own domain)
- A CMS at `https://your-site.netlify.app/admin`
- Every change you make in the CMS goes live in ~30 seconds
- Full visual editing: text, images, blog posts, press coverage, settings

---

## Step 1 — Create a GitHub repository

1. Go to **github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it: `binder-site`
4. Set it to **Public** *(required for free Netlify CMS)*
5. Leave everything else as default
6. Click **Create repository**

---

## Step 2 — Upload the site files to GitHub

1. On your new repository page, click **uploading an existing file**
2. Drag ALL the files and folders from the `binder-netlify` folder into the upload area:
   - `admin/` (folder)
   - `content/` (folder)
   - `images/` (folder)
   - `index.html`
   - `blog.html`
   - `blog-post.html`
   - `press.html`
   - `my-orders.html`
   - `photobook-editor.html`
   - `admin-cms.html`
   - `build.js`
   - `netlify.toml`
   - `_redirects`
3. At the bottom, type a commit message: `Initial Binder site upload`
4. Click **Commit changes**

---

## Step 3 — Connect to Netlify

1. Go to **app.netlify.com** and sign in
2. Click **Add new site** → **Import an existing project**
3. Click **Deploy with GitHub**
4. Authorise Netlify to access your GitHub account
5. Search for and select **binder-site**
6. Build settings (Netlify should auto-detect):
   - **Branch to deploy:** `main`
   - **Build command:** `node build.js`
   - **Publish directory:** `.`
7. Click **Deploy site**

Netlify will build your site. Takes about 60 seconds. You'll get a URL like `https://amazing-binder-123.netlify.app`.

---

## Step 4 — Enable Netlify Identity (for CMS login)

1. In your Netlify site dashboard, go to **Site settings**
2. Click **Identity** in the left menu
3. Click **Enable Identity**
4. Under **Registration preferences**, set to **Invite only**
5. Under **Services → Git Gateway**, click **Enable Git Gateway**

---

## Step 5 — Invite yourself as a CMS user

1. Still in **Identity**, click **Invite users**
2. Enter your email address
3. Check your email and click the confirmation link
4. Set your password

---

## Step 6 — Update config.yml with your GitHub username

In your GitHub repository, open `admin/config.yml` and change:

```yaml
repo: GITHUB_USERNAME/binder-site
```

To your actual GitHub username, for example:

```yaml
repo: orijit/binder-site
```

Commit the change. Netlify will auto-redeploy.

---

## Step 7 — Access your CMS

Go to: `https://your-site.netlify.app/admin`

Log in with the email and password you set in Step 5.

You'll see the full CMS with:
- **Homepage** — edit hero text, banner image, features, sizes, testimonials
- **Blog Posts** — create/edit/delete posts with rich text and image upload
- **Press Coverage** — add press mentions
- **Site Settings** — address, email, social links, SEO

---

## How publishing works

1. You make a change in the CMS (e.g. upload a new banner photo)
2. Click **Publish** (or **Save** for drafts)
3. The CMS commits the change to your GitHub repository
4. Netlify detects the commit and rebuilds the site
5. **Your live site updates in ~30 seconds**

---

## Adding your own domain

1. In Netlify dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter `binder.co.in` (or your domain)
4. In your domain registrar (GoDaddy, Namecheap, etc.), add:
   - Type: `CNAME`
   - Name: `www`
   - Value: `your-site.netlify.app`
5. Netlify automatically provides free HTTPS via Let's Encrypt

---

## Uploading images

In the CMS, anywhere you see an image field:
1. Click **Choose an image**
2. Click **Upload** to upload from your computer
3. Select your photo
4. Click **Choose selected** to insert it

Images are stored in the `images/uploads/` folder in your GitHub repository and served via Netlify's global CDN.

---

## Writing blog posts

1. Go to CMS → **Blog Posts** → **New Blog Post**
2. Fill in the title, date, category
3. Upload a cover image
4. Write your post using the rich text editor (WYSIWYG — what you see is what you get)
   - Use the toolbar for headings, bold, italic, links
   - Click the image icon to insert photos inline
5. Click **Publish** to go live, or **Save** to keep as a draft

---

## Troubleshooting

**CMS login not working:**
Make sure you completed Step 4 (Enable Identity) and Step 5 (Invite yourself). The confirmation email link must be clicked before you can log in.

**Changes not showing on live site:**
Wait 60 seconds. If still not updated, go to your Netlify dashboard and check the **Deploys** tab for any build errors.

**Images not showing:**
Make sure the image was uploaded through the CMS image picker, not just typed as a URL. The CMS uploads images to your GitHub repo and serves them from there.

**"Repo not found" error in CMS:**
Update `admin/config.yml` — replace `GITHUB_USERNAME` with your actual GitHub username (Step 6).

---

## Need help?

If anything goes wrong, come back to Claude with a screenshot or the exact error message and it will be fixed immediately.
