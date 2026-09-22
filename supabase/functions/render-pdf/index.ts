// supabase/functions/render-pdf/index.ts
// Triggered by: POST from the site when an order is placed, or manually from Admin.
// Uses Puppeteer (via deno-puppeteer) to render the design snapshot into a real PDF
// with vector text + images, then stores it in Supabase Storage and emails a link.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!      // get a free key at resend.com
const ADMIN_EMAIL      = Deno.env.get('ADMIN_EMAIL')!          // your email e.g. hello@binder.co.in
const SITE_URL         = Deno.env.get('SITE_URL') || 'https://binder.co.in'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// ── Email helper via Resend ──────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Binder <noreply@binder.co.in>`, to, subject, html })
  })
  if (!res.ok) console.error('Email send failed:', await res.text())
}

// ── HTML renderer: builds a self-contained HTML page from the order snapshot ─
function buildRenderHTML(order: Record<string, unknown>, fileKey: string): string {
  const snapshot = order.snapshot as Record<string, unknown>
  const photoMap = snapshot.photoMap as Record<string, { url: string; w: number; h: number }>
  const isMonochrome = order.product === 'tradebook'
  const BLEED = 0.2  // inches
  const DPI   = 300

  // Encode snapshot and config for the renderer page
  const config = JSON.stringify({ order, fileKey, photoMap, isMonochrome, BLEED, DPI })

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: white; }
  .page { position: relative; overflow: hidden; background: white; }
  .page img { object-fit: cover; }
  .tbox { position: absolute; overflow: hidden; }
  .tbox-inner { width: 100%; height: 100%; word-wrap: break-word; }
  ${isMonochrome ? '.page img { filter: grayscale(100%); }' : ''}
</style>
</head>
<body>
<div id="root"></div>
<script>
const CFG = ${config};

// Rebuild each page as DOM for Puppeteer to screenshot
function buildPage(page, widthPx, heightPx) {
  const el = document.createElement('div');
  el.className = 'page';
  el.style.width  = widthPx + 'px';
  el.style.height = heightPx + 'px';
  el.style.background = page.bg || '#fff';

  // Images
  (page.images || []).forEach(im => {
    if (!im.photo || !CFG.photoMap[im.photo]) return;
    const ph = CFG.photoMap[im.photo];
    const d  = document.createElement('div');
    d.style.cssText = 'position:absolute;overflow:hidden;' +
      'left:'   + (im.x / 100 * widthPx)  + 'px;' +
      'top:'    + (im.y / 100 * heightPx) + 'px;' +
      'width:'  + (im.w / 100 * widthPx)  + 'px;' +
      'height:' + (im.h / 100 * heightPx) + 'px;' +
      'opacity:' + ((im.op ?? 100) / 100) + ';';
    const img   = document.createElement('img');
    img.src     = ph.url;
    img.crossOrigin = 'anonymous';
    const fit   = im.fit || 'contain';
    img.style.cssText = 'width:100%;height:100%;object-fit:' + fit + ';' +
      (fit === 'cover' ? 'object-position:' + (im.fx ?? 50) + '% ' + (im.fy ?? 50) + '%;' : '') +
      'transform:rotate(' + (im.rot || 0) + 'deg)';
    // Apply brightness/contrast/saturation/etc
    const b   = im.b   ?? 100; const c = im.c ?? 100; const sat = im.sat ?? 100;
    const tmp = im.temp ?? 0;  const bl = im.blur ?? 0;
    let f = 'brightness(' + b/100 + ') contrast(' + c/100 + ') saturate(' + sat/100 + ')';
    if (tmp > 0) f += ' sepia(' + (tmp/100*0.6) + ')';
    if (bl  > 0) f += ' blur(' + (bl/2) + 'px)';
    if (CFG.isMonochrome) f += ' grayscale(100%)';
    img.style.filter = f;
    d.appendChild(img);
    el.appendChild(d);
  });

  // Text boxes
  (page.texts || []).forEach(tt => {
    const d = document.createElement('div');
    d.className = 'tbox';
    d.style.cssText =
      'left:'   + (tt.x / 100 * widthPx)  + 'px;' +
      'top:'    + (tt.y / 100 * heightPx) + 'px;' +
      'width:'  + (tt.w / 100 * widthPx)  + 'px;' +
      'height:' + (tt.h / 100 * heightPx) + 'px;';
    const inner = document.createElement('div');
    inner.className = 'tbox-inner';
    const pct  = tt.blackPct ?? 100;
    const color = CFG.isMonochrome
      ? 'rgba(0,0,0,' + (pct / 100) + ')'
      : (tt.color || '#141414');
    inner.style.cssText =
      'font-family:"' + (tt.font || 'serif') + '",serif;' +
      'font-size:'    + ((tt.size || 16) * (widthPx / 800)) + 'px;' +
      'font-weight:'  + (tt.bold ? '700' : '400') + ';' +
      'font-style:'   + (tt.italic ? 'italic' : 'normal') + ';' +
      'text-align:'   + (tt.align || 'left') + ';' +
      'color:'        + color + ';' +
      'line-height:'  + (tt.lh || 1.5) + ';' +
      'letter-spacing:' + (tt.ls || 0) + 'px;';
    inner.innerHTML = tt.html || tt.text || '';
    d.appendChild(inner);
    el.appendChild(d);
  });

  // Shapes
  (page.shapes || []).forEach(sh => {
    if (sh.hidden) return;
    const d = document.createElement('div');
    d.style.cssText =
      'position:absolute;overflow:hidden;' +
      'left:'   + (sh.x / 100 * widthPx)  + 'px;' +
      'top:'    + (sh.y / 100 * heightPx) + 'px;' +
      'width:'  + (sh.w / 100 * widthPx)  + 'px;' +
      'height:' + (sh.h / 100 * heightPx) + 'px;' +
      'background:' + (CFG.isMonochrome ? 'rgba(0,0,0,' + ((sh.blackPct ?? 100) / 100) + ')' : (sh.fill || '#141414')) + ';' +
      'opacity:' + ((sh.op ?? 100) / 100) + ';' +
      'transform:rotate(' + (sh.rot || 0) + 'deg);';
    if (sh.photo && CFG.photoMap[sh.photo]) {
      const img = document.createElement('img');
      img.src = CFG.photoMap[sh.photo].url;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;' +
        (CFG.isMonochrome ? 'filter:grayscale(100%)' : '');
      d.appendChild(img);
    }
    el.appendChild(d);
  });

  return el;
}

const { order, fileKey, BLEED, DPI } = CFG;
const snap    = order.snapshot;
const root    = document.getElementById('root');
const product = order.product;

if (product === 'artprints') {
  // 4-up artboard: 2 × 2 grid of 6×4 boards
  const bW = (6 + 2*BLEED) * DPI, bH = (4 + 2*BLEED) * DPI;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0;width:' + (bW*2) + 'px';
  for (let i = 0; i < 4; i++) {
    const b   = snap.boards[i] || {};
    const ph  = b.photoId ? CFG.photoMap[b.photoId] : null;
    const orient = snap.orient[i] || 'landscape';
    const pw  = (orient === 'portrait' ? 4 : 6) * DPI;
    const ph2 = (orient === 'portrait' ? 6 : 4) * DPI;
    const page = { images: ph ? [{ photo: b.photoId, x: b.x*100, y: b.y*100, w: b.w*100, h: b.h*100, fit: 'cover', fx: 50, fy: 50 }] : [], texts: [], shapes: [], bg: '#fff' };
    const el = buildPage(page, pw, ph2);
    el.style.margin = (BLEED * DPI) + 'px';
    wrap.appendChild(el);
  }
  root.appendChild(wrap);
} else {
  // Book: cover/interior
  const edCfg = product === 'tradebook'
    ? { pageInW: 5.5, pageInH: 8, hasSpine: true, spineCaliperIn: 0.0035 }
    : { pageInW: 8.5, pageInH: 8.5, hasSpine: true, spineCaliperIn: 0.0035 };
  const pw = edCfg.pageInW, ph = edCfg.pageInH;
  const spineIn = (snap.doc.pages.length) * (edCfg.spineCaliperIn || 0.0035);

  if (fileKey === 'cover') {
    const totalW  = (pw * 2 + spineIn + BLEED * 2) * DPI;
    const totalH  = (ph + BLEED * 2) * DPI;
    const pagePx  = pw * DPI, pageHPx = ph * DPI;
    const spinePx = spineIn * DPI;
    const wrap    = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:' + totalW + 'px;height:' + totalH + 'px;';
    const back  = buildPage(snap.doc.backCover || snap.doc.cover, pagePx, pageHPx);
    back.style.cssText += 'position:absolute;left:' + (BLEED*DPI) + 'px;top:' + (BLEED*DPI) + 'px;';
    const spine = buildPage(snap.doc.spine || {}, spinePx, pageHPx);
    spine.style.cssText += 'position:absolute;left:' + (BLEED*DPI + pagePx) + 'px;top:' + (BLEED*DPI) + 'px;';
    const front = buildPage(snap.doc.cover, pagePx, pageHPx);
    front.style.cssText += 'position:absolute;left:' + (BLEED*DPI + pagePx + spinePx) + 'px;top:' + (BLEED*DPI) + 'px;';
    wrap.appendChild(back); wrap.appendChild(spine); wrap.appendChild(front);
    root.appendChild(wrap);
  } else {
    // Interior pages
    const pagePx = pw * DPI, pageHPx = ph * DPI;
    const wrap   = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:0;';
    snap.doc.pages.forEach((page, i) => {
      const el = buildPage(page, pagePx, pageHPx);
      el.setAttribute('data-page', i);
      el.style.cssText += 'page-break-after:always;';
      wrap.appendChild(el);
    });
    root.appendChild(wrap);
  }
}
window.__RENDER_DONE__ = true;
</script>
</body>
</html>`
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' })

  // Auth: only service role or internal calls
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.includes(SERVICE_KEY.slice(-8))) {
    return json(401, { error: 'Unauthorized' })
  }

  const { order_id, file_key } = await req.json().catch(() => ({}))
  if (!order_id || !file_key) return json(400, { error: 'order_id and file_key required' })

  // Fetch the order
  const { data: order, error: oErr } = await sb
    .from('orders').select('*').eq('id', order_id).single()
  if (oErr || !order) return json(404, { error: 'Order not found' })

  // Mark job as processing
  await sb.from('orders').update({ render_status: 'rendering' }).eq('id', order_id)

  try {
    // Build the render HTML
    const html = buildRenderHTML(order, file_key)

    // Launch Puppeteer (Deno-compatible via @astral/astral)
    const { launch } = await import('jsr:@astral/astral@0.4')
    const browser    = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page       = await browser.newPage()

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 120_000 })

    // Wait for all images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(r => { img.onload = r; img.onerror = r; }))
      )
    })

    // Wait for render flag
    await page.waitForFunction('window.__RENDER_DONE__ === true', { timeout: 30_000 })

    // Generate PDF
    const product    = order.product as string
    const snap       = order.snapshot as Record<string, unknown>
    const isInterior = file_key === 'interior'
    const BLEED      = 0.2
    const edCfg      = product === 'tradebook'
      ? { pageInW: 5.5, pageInH: 8, spineCaliperIn: 0.0035 }
      : { pageInW: 8.5, pageInH: 8.5, spineCaliperIn: 0.0035 }

    let pdfBytes: Uint8Array

    if (product === 'artprints') {
      pdfBytes = await page.pdf({
        width:  `${(6 * 2 + BLEED * 4) * 96}px`,
        height: `${(4 + BLEED * 2) * 96}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })
    } else if (file_key === 'cover') {
      const pages = (snap.doc as Record<string, unknown[]>).pages as unknown[]
      const spineIn = pages.length * edCfg.spineCaliperIn
      pdfBytes = await page.pdf({
        width:  `${(edCfg.pageInW * 2 + spineIn + BLEED * 2) * 96}px`,
        height: `${(edCfg.pageInH + BLEED * 2) * 96}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })
    } else {
      // Interior: one PDF page per book page
      pdfBytes = await page.pdf({
        width:  `${edCfg.pageInW * 96}px`,
        height: `${edCfg.pageInH * 96}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })
    }

    await browser.close()

    // Upload PDF to Supabase Storage
    const fileName  = `${order_id}/${file_key}-${Date.now()}.pdf`
    const { error: upErr } = await sb.storage
      .from('pdfs')
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw new Error('Storage upload failed: ' + upErr.message)

    const { data: urlData } = sb.storage.from('pdfs').getPublicUrl(fileName)
    const pdfUrl = urlData.publicUrl

    // Update order with PDF URL
    const currentPdfFiles = (order.pdf_files as Record<string, string>) || {}
    currentPdfFiles[file_key] = pdfUrl
    await sb.from('orders').update({
      pdf_files: currentPdfFiles,
      render_status: 'done',
      render_error: null
    }).eq('id', order_id)

    // Check if all files are done
    const allKeys = product === 'artprints' ? ['artboard'] : ['cover', 'interior']
    const allDone = allKeys.every(k => currentPdfFiles[k])

    if (allDone) {
      // Email customer
      const customerHtml = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="font-size:22px">Your Binder PDF is ready 🎉</h2>
          <p>Hi ${order.customer_name || order.customer_email.split('@')[0]},</p>
          <p>Your print files for <strong>${order.title}</strong> (${order.id}) are ready and have been sent to our print team.</p>
          <p>We'll update you once your order moves to printing. Expected turnaround is 5–7 working days.</p>
          <p style="margin-top:24px;font-size:13px;color:#666">— Binder, Delhi</p>
        </div>`
      await sendEmail(order.customer_email, `Your Binder order ${order.id} is confirmed`, customerHtml)

      // Email admin
      const pdfLinks = Object.entries(currentPdfFiles)
        .map(([k, u]) => `<a href="${u}">${k} PDF</a>`).join(' · ')
      const adminHtml = `
        <div style="font-family:sans-serif">
          <h2>New order ready to print: ${order.id}</h2>
          <p><strong>Customer:</strong> ${order.customer_email}</p>
          <p><strong>Product:</strong> ${order.product}</p>
          <p><strong>Amount:</strong> ₹${order.amount}</p>
          <p><strong>Files:</strong> ${pdfLinks}</p>
          <p><a href="${SITE_URL}/#admin">Open Admin Panel</a></p>
        </div>`
      await sendEmail(ADMIN_EMAIL, `[Binder] Print-ready: ${order.id} — ${order.title}`, adminHtml)
    }

    return json(200, { success: true, pdf_url: pdfUrl, all_done: allDone })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sb.from('orders').update({ render_status: 'failed', render_error: msg }).eq('id', order_id)
    console.error('Render failed:', msg)
    return json(500, { error: msg })
  }
})
