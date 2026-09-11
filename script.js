/* ================= BINDER — shared utilities ================= */
const $=id=>document.getElementById(id);
const uid=()=>Math.random().toString(36).slice(2,9);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2800)}
function show(id){$(id).classList.add('show')} function hide(id){$(id).classList.remove('show')}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
/* Word-style rich text commands for in-editor text boxes. Toolbar buttons call this with
   onmousedown="event.preventDefault()" so the currently-focused/selected text isn't lost
   when the button is clicked — the standard technique for contentEditable toolbars. */
try{document.execCommand('defaultParagraphSeparator',false,'p');}catch(e){}
function rteCmd(cmd,val){document.execCommand(cmd,false,val||null);}
/* ---------- InDesign-style character-level formatting ----------
   Word-processor formatting (bold/italic/underline/strike/super/subscript) already applies
   to just the current selection via execCommand. Font and size normally apply to the whole
   text box (paragraph style); these helpers let them apply to an exclusive selection instead,
   the way InDesign's Character panel works, while an empty selection still restyles the box. */
function rteActiveInner(){
  const sel=window.getSelection(); if(!sel||!sel.rangeCount)return null;
  const node=sel.anchorNode; if(!node)return null;
  const el=node.nodeType===3?node.parentElement:node;
  return (el&&el.closest)?el.closest('.tbox-inner'):null;
}
function rteHasSelection(){
  const sel=window.getSelection();
  return !!(sel&&sel.rangeCount&&!sel.isCollapsed&&rteActiveInner());
}
function rteApplyCharStyle(styleStr){
  const sel=window.getSelection(); if(!sel||!sel.rangeCount||sel.isCollapsed)return false;
  const inner=rteActiveInner(); if(!inner)return false;
  const range=sel.getRangeAt(0);
  const span=document.createElement('span'); span.setAttribute('style',styleStr);
  try{range.surroundContents(span);}
  catch(e){const frag=range.extractContents();span.appendChild(frag);range.insertNode(span);}
  const r=document.createRange(); r.selectNodeContents(span);
  sel.removeAllRanges(); sel.addRange(r);
  return true;
}
function contrastColor(hex){const c=(hex||'#FFFFFF').replace('#','');if(c.length!==6)return '#1D1D1F';
  const r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);
  return (0.299*r+0.587*g+0.114*b)/255>0.6?'#1D1D1F':'#FFFFFF';}
const SEO_META={
  home:{title:'Binder — Custom Photobook & Book Printing, Delhi, India',
    desc:'Binder is a Delhi-based publisher and printer — design custom photobooks, self-publish trade books with free ISBN help, and order archival art prints.',
    keywords:'photobook printing India, custom photo book maker, self publish book India, free ISBN registration India, layflat photo album, trade book printing Delhi, art print printing India, photobook printing Delhi'},
  publish:{title:'Publish My Book — Free ISBN & Printing Help | Binder',
    desc:'How to self-publish a book in India with Binder — free ISBN registration guidance, manuscript formatting, and professional trade book printing in Delhi.',
    keywords:'self publish book India, publish my book, free ISBN registration India, manuscript printing Delhi, trade book publishing'},
  clients:{title:'Our Clients — Photobook & Book Printing, Binder Delhi',
    desc:'Publishers, authors, studios, and corporates who print photobooks, trade books, and art prints with Binder, a premium printing studio in Delhi, India.',
    keywords:'photobook printing clients, corporate photobook printing India, publishing studio Delhi'},
  gallery:{title:'Photobook Gallery — Custom Photo Book Examples | Binder',
    desc:'Browse real custom photobooks printed and bound by Binder in Delhi — layflat wedding albums, travel books, and coffee table books in 8.5″, 12″, and 18″ sizes.',
    keywords:'custom photobook examples, wedding album printing India, layflat photo album, coffee table book printing, travel photobook'},
  store:{title:'Binder Store — Photo Book Accessories & Gifting Editions',
    desc:'Shop print accessories, protective book sleeves, and gifting editions from Binder — a premium photobook and trade book printing studio in Delhi, India.',
    keywords:'photobook accessories India, book sleeve, gifting editions, print accessories Delhi'},
  journal:{title:'Kagaz Journal — Publishing & Photo Book Printing Blog',desc:'Notes on self-publishing, custom photobook printing, ISBN registration, and book design — from Binder, a printing studio in Delhi, India.',
    keywords:'self publishing blog India, photobook printing tips, ISBN registration guide, book design blog'},
  isbn:{title:'Free ISBN Registration India — 5 Easy Steps | Binder',desc:'How to get a free ISBN for your self-published book in India in 5 easy steps — a step-by-step guide from Binder, a trade book printer in Delhi.',
    keywords:'free ISBN India, ISBN registration India, Raja Rammohun Roy National Agency ISBN, self publish book ISBN'},
  pricing:{title:'Pricing — Photobook, Trade Book & Art Print Printing India',desc:'Transparent pricing for custom photobook printing, trade book self-publishing, and archival art prints in India — bulk discounts on 10+ copies. Binder, Delhi.',
    keywords:'photobook printing price India, trade book printing cost, art print pricing India, bulk photobook printing discount'},
  contact:{title:'Contact Binder — Photobook & Book Printing Studio, Delhi',desc:'Get in touch with Binder, a premium photobook, trade book, and art print printing studio in Delhi, India, to publish or print your book.',
    keywords:'contact photobook printer Delhi, book printing studio contact India'},
  scanning:{title:'Photo & Document Scanning Services in Delhi | Binder',desc:'Archival-quality photo scanning, negative digitisation, and document scanning in Delhi at 600 DPI — pick-up and drop across Delhi NCR. Minimum 100 images.',
    keywords:'photo scanning services Delhi, negative scanning India, document digitisation Delhi NCR, archival photo scanning'},
  photography:{title:'Photography Services Delhi — Architecture & Editorial',desc:'Professional photography in Delhi across architecture, editorial, corporate, and institutional work — from the team behind Binder\'s photobook printing studio.',
    keywords:'architecture photography Delhi, editorial photography India, corporate photography Delhi, professional photographer Delhi'},
};
const DEFAULT_OG_IMAGE='https://www.binder.co.in/images/img-hero.jpg';
function setPageSchema(obj){ const el=$('ldPage'); if(el)el.textContent=JSON.stringify(obj); }
function clearPageSchema(){ const el=$('ldPage'); if(el)el.textContent=''; }
// A single BreadcrumbList entry set, reused across start pages, store product pages, and
// journal posts — Google shows these as the little "Home > Category > Page" trail in search
// results, and they're one of the highest-value, lowest-effort structured data wins available.
function buildBreadcrumbSchema(items){
  return {"@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":items.map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.name,"item":it.url}))};
}
// Service schema for the three "before you start" format pages (/photobooks, /trade-books,
// /art-prints) — these are Binder's main commercial landing pages and previously shipped with
// zero structured data at all.
const START_SERVICE_PRICE={photobook:'2200',tradebook:'1000',artprints:'800'};
function buildServiceSchema(key){
  const info=START_PAGES[key], seo=START_SEO[key]; if(!info||!seo)return null;
  return {"@context":"https://schema.org","@type":"Service",
    "serviceType":info.label+' Printing',
    "provider":{"@type":"LocalBusiness","name":"Binder","url":"https://www.binder.co.in/"},
    "areaServed":["Delhi","India"],
    "description":seo.desc,
    "offers":{"@type":"Offer","priceCurrency":"INR","price":START_SERVICE_PRICE[key]||'','url':'https://www.binder.co.in/'+START_PATH_FOR_KEY[key]}};
}
// FAQPage schema, built from whatever's actually in the FAQ list (admin-editable) — only ever
// injected while the home page (where the FAQ section actually lives) is showing, so the
// structured data always matches what's visibly on the page.
function buildFaqSchema(){
  return {"@context":"https://schema.org","@type":"FAQPage",
    "mainEntity":FAQ.map(item=>({"@type":"Question","name":item.q,"acceptedAnswer":{"@type":"Answer","text":item.a}}))};
}
function updateSeoKeywords(kw){
  const el=document.querySelector('meta[name="keywords"]'); if(el)el.setAttribute('content',kw||'');
}
function isoDateOrNull(v){ if(!v)return null; const d=new Date(v); return isNaN(d.getTime())?null:d.toISOString(); }
function buildPostSchema(p,slugPath){
  const published=p.dateISO||isoDateOrNull(p.date);
  const modified=p.updatedISO||isoDateOrNull(p.updated)||published;
  const schema={
    "@context":"https://schema.org","@type":"BlogPosting",
    "headline":p.title,
    "image":p.hero||DEFAULT_OG_IMAGE,
    "author":{"@type":"Organization","name":"Binder"},
    "publisher":{"@type":"Organization","name":"Binder","logo":{"@type":"ImageObject","url":"https://www.binder.co.in/images/logo.png"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":"https://www.binder.co.in/journal/"+slugPath},
    "description":(p.html||'').replace(/<[^>]+>/g,'').trim().slice(0,155)
  };
  if(published)schema.datePublished=published;
  if(modified)schema.dateModified=modified;
  return schema;
}
function buildProductSchema(p,slugPath){
  return {
    "@context":"https://schema.org","@type":"Product",
    "name":p.name,
    "image":p.img||DEFAULT_OG_IMAGE,
    "description":p.blurb||p.details||('Order '+p.name+' from Binder, a premium printer in Delhi.'),
    "sku":p.id,
    "brand":{"@type":"Brand","name":"Binder"},
    "offers":{
      "@type":"Offer","url":"https://www.binder.co.in/store/"+slugPath,
      "priceCurrency":"INR","price":(p.price/100).toString(),
      "availability":"https://schema.org/InStock"
    }
  };
}
function updateSeoMeta(v){
  const m=SEO_META[v]; if(!m)return;
  document.title=m.title;
  const desc=document.querySelector('meta[name="description"]'); if(desc)desc.setAttribute('content',m.desc);
  updateSeoKeywords(m.keywords);
  const og=document.querySelector('meta[property="og:title"]'); if(og)og.setAttribute('content',m.title);
  const ogd=document.querySelector('meta[property="og:description"]'); if(ogd)ogd.setAttribute('content',m.desc);
  const ogi=document.querySelector('meta[property="og:image"]'); if(ogi)ogi.setAttribute('content',DEFAULT_OG_IMAGE);
  const ogtype=document.querySelector('meta[property="og:type"]'); if(ogtype)ogtype.setAttribute('content','website');
  const ogp=document.querySelector('meta[property="product:price:amount"]'); if(ogp)ogp.setAttribute('content','');
  clearPageSchema();
  const tt=document.querySelector('meta[name="twitter:title"]'); if(tt)tt.setAttribute('content',m.title);
  const td=document.querySelector('meta[name="twitter:description"]'); if(td)td.setAttribute('content',m.desc);
  const ti=document.querySelector('meta[name="twitter:image"]'); if(ti)ti.setAttribute('content',DEFAULT_OG_IMAGE);
  const canon=document.querySelector('link[rel="canonical"]'); if(canon)canon.setAttribute('href','https://www.binder.co.in'+pathForView(v));
}
function go(v,push){
  if(v==='dashboard'&&!S.user){authGo('login');show('authModal');toast('Sign in to view your dashboard');return}
  const robots=document.querySelector('meta[name="robots"]');
  if(robots)robots.setAttribute('content',(v==='admin'||v==='dashboard')?'noindex, nofollow':'index, follow');
  if(v==='admin'){checkAdminGate()}
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.ed-root').forEach(x=>x.classList.remove('active'));
  document.querySelector('.site-nav').style.display='flex';
  if($('siteFooter'))$('siteFooter').style.display='block';
  $('view-'+v).classList.add('active'); window.scrollTo(0,0);
  updateSeoMeta(v);
  if(v==='home')setPageSchema(buildFaqSchema()); // FAQ section only actually renders on the home view
  if(push!==false)setPath(pathForView(v));
  if(v==='journal')renderBlog(); if(v==='store')renderStore(); if(v==='clients')renderClients(); if(v==='gallery')renderGallery();
  if(v==='dashboard')renderCustomerDashboard();
  if(v==='scanning'){const vid=$('scanHeroVideo');if(vid){vid.style.display='block';$('scanHeroStill').style.display='none';vid.currentTime=0;vid.play().catch(()=>{});}}
}
/* ================= "BEFORE YOU START" FORMAT PAGES =================
   One page per format (Photobook / Trade Book / Art Prints) that a visitor lands
   on BEFORE the editor opens — trim size, page limits, image requirements, what
   to have ready, and how the process works. Every current entry point that used
   to jump straight into openEditor() now routes here first; the page's own
   "Start creating" button is what actually calls openEditor(). Specs are pulled
   from the real editor config (EDS[key].cfg) and PRICING_RULES so this can't
   drift out of sync with the actual editor limits. */
const START_PATH_FOR_KEY={photobook:'photobooks',tradebook:'trade-books',artprints:'art-prints'};
const START_KEY_FOR_PATH={photobooks:'photobook','trade-books':'tradebook','art-prints':'artprints'};
const START_PAGES={
  photobook:{
    label:'Photobook',heroImg:'/images/photobook-hero.mp4',heroImgKey:'photobookTileImageUrl',contentKey:'startPhotobookIntro',needKey:'startPhotobookNeed',stepsKey:'startPhotobookSteps',
  },
  tradebook:{
    label:'Trade Book',heroImg:'/images/img-3.jpg',heroImgKey:'tradebookTileImageUrl',contentKey:'startTradebookIntro',needKey:'startTradebookNeed',stepsKey:'startTradebookSteps',
  },
  artprints:{
    label:'Art Prints',heroImg:'/images/img-5.jpg',heroImgKey:'artprintsTileImageUrl',contentKey:'startArtprintsIntro',needKey:'startArtprintsNeed',stepsKey:'startArtprintsSteps',
  }
};
let ACTIVE_START_KEY=null;
const START_SEO={
  photobook:{title:'Custom Photobook Printing Delhi — Layflat, 8.5″–18″',desc:'Design and order a custom layflat photobook online, printed in Delhi on premium 250gsm stock. Three sizes from 8.5″ to 12″×18″ — from ₹2,200/copy, no minimum.',
    keywords:'custom photobook printing India, layflat photo album, photobook maker online, wedding photobook Delhi, coffee table book printing, yearbook printing India'},
  tradebook:{title:'Trade Book Printing Delhi — Self-Publish Your Novel',desc:'Print your novel or manuscript as a professional perfect-bound trade book in Delhi. Free ISBN registration guidance included — no minimum order quantity.',
    keywords:'trade book printing India, self publish novel India, perfect bound book printing, manuscript printing Delhi, free ISBN India'},
  artprints:{title:'Archival Art Print Printing Delhi — Photo & Fine Art',desc:'Order archival-quality art prints in Delhi — 6×4″ sets or large-format 12″×18″ and 16″×20″ single prints on 300gsm fine art paper, with pan-India delivery.',
    keywords:'archival art print printing India, fine art print Delhi, photo print framing India, giclee print India, large format print Delhi'},
};
function goStart(key,push){
  const info=START_PAGES[key]; if(!info)return;
  ACTIVE_START_KEY=key;
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.ed-root').forEach(x=>x.classList.remove('active'));
  document.querySelector('.site-nav').style.display='flex';
  if($('siteFooter'))$('siteFooter').style.display='block';
  $('view-start').classList.add('active'); window.scrollTo(0,0);
  renderStartPage(key);
  const robots=document.querySelector('meta[name="robots"]'); if(robots)robots.setAttribute('content','index, follow');
  const seo=START_SEO[key];
  if(seo){
    document.title=seo.title;
    const desc=document.querySelector('meta[name="description"]'); if(desc)desc.setAttribute('content',seo.desc);
    updateSeoKeywords(seo.keywords);
    const og=document.querySelector('meta[property="og:title"]'); if(og)og.setAttribute('content',seo.title);
    const ogd=document.querySelector('meta[property="og:description"]'); if(ogd)ogd.setAttribute('content',seo.desc);
    const ogImg=(info.heroImgKey&&CONTENT[info.heroImgKey]&&!isVideoUrl(CONTENT[info.heroImgKey]))?CONTENT[info.heroImgKey]:DEFAULT_OG_IMAGE;
    const ogi=document.querySelector('meta[property="og:image"]'); if(ogi)ogi.setAttribute('content',ogImg);
    const ogtype=document.querySelector('meta[property="og:type"]'); if(ogtype)ogtype.setAttribute('content','website');
    const ogp=document.querySelector('meta[property="product:price:amount"]'); if(ogp)ogp.setAttribute('content','');
    const tt=document.querySelector('meta[name="twitter:title"]'); if(tt)tt.setAttribute('content',seo.title);
    const td=document.querySelector('meta[name="twitter:description"]'); if(td)td.setAttribute('content',seo.desc);
    const ti=document.querySelector('meta[name="twitter:image"]'); if(ti)ti.setAttribute('content',ogImg);
    const canon=document.querySelector('link[rel="canonical"]'); if(canon)canon.setAttribute('href','https://www.binder.co.in/'+START_PATH_FOR_KEY[key]);
    const svc=buildServiceSchema(key);
    const crumbs=buildBreadcrumbSchema([{name:'Home',url:'https://www.binder.co.in/'},{name:info.label,url:'https://www.binder.co.in/'+START_PATH_FOR_KEY[key]}]);
    setPageSchema(svc?[svc,crumbs]:crumbs);
  }
  if(push!==false)setPath('/'+START_PATH_FOR_KEY[key]);
}
// "need" is stored as one checklist item per line; "steps" as "Title | Description" per line —
// simple, admin-typeable formats rather than a JSON editor. Falls back to sane parsing if a
// line is missing its "|" separator, so a typo doesn't blank out that step's title.
function parseNeedList(text){ return (text||'').split('\n').map(s=>s.trim()).filter(Boolean); }
function parseStepsList(text){
  return (text||'').split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{
    const i=line.indexOf('|');
    return i===-1?[line,'']:[line.slice(0,i).trim(),line.slice(i+1).trim()];
  });
}
function renderStartPage(key){
  const info=START_PAGES[key]; if(!info)return;
  const wrap=$('startPageContent');
  const heroSrc=(info.heroImgKey&&CONTENT[info.heroImgKey])||info.heroImg;
  const needList=parseNeedList(CONTENT[info.needKey]);
  const stepsList=parseStepsList(CONTENT[info.stepsKey]);
  const intro=CONTENT[info.contentKey]||'';
  const heroBlock=key==='photobook'
    ? `<div class="start-video-hero-wrap">${isVideoUrl(heroSrc)
        ? `<video src="${esc(heroSrc)}" autoplay muted playsinline preload="auto"></video>`
        : `<img src="${esc(heroSrc)}" alt="${esc(info.label)}">`}</div>`
    : `<div style="overflow:hidden;margin:28px 0 40px;max-width:800px">
        <img src="${esc(heroSrc)}" alt="${esc(info.label)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block">
      </div>`;
  wrap.innerHTML=`
    <span class="tag">Start creating</span>
    <h1>${esc(info.label)}</h1>
    <p class="lead">${esc(intro)}</p>
    ${heroBlock}
    <h4 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-l);font-weight:700;margin-bottom:14px">What you'll need before you start</h4>
    <ul style="list-style:none;margin-bottom:40px;max-width:640px">
      ${needList.map(n=>`<li style="display:flex;gap:12px;padding:9px 0;font-size:15px;line-height:1.55;border-bottom:1px solid var(--line)"><span style="color:var(--accent);flex:0 0 auto">✓</span><span>${esc(n)}</span></li>`).join('')}
    </ul>

    <h4 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-l);font-weight:700;margin-bottom:14px">How it works</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;margin-bottom:44px">
      ${stepsList.map(([t,d],i)=>`<div><div style="font-family:var(--disp);font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">0${i+1}</div><h3 style="font-size:16px;margin-bottom:6px">${esc(t)}</h3><p style="font-size:14px;color:var(--slate);line-height:1.55;margin:0">${esc(d)}</p></div>`).join('')}
    </div>

    ${key==='photobook'?`
    <h4 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-l);font-weight:700;margin-bottom:14px">Choose a size</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:32px;max-width:960px">
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">8.5″ × 8.5″</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">Our original layflat photobook. From ₹2,200/copy, 20 pages included.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('photobook')">Start 8.5″×8.5″ →</button>
      </div>
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">12″ × 12″</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">A larger format for bigger, bolder spreads. From ₹4,200/copy, 20 pages included. Hardbound or softbound, same price.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('photobook12')">Start 12″×12″ →</button>
      </div>
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">12″ × 18″</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">Our largest format, for a real coffee-table statement piece. Switch between portrait and landscape right in the editor. From ₹6,300/copy, 20 pages included. Hardbound or softbound, same price.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('photobook18')">Start 12″×18″ →</button>
      </div>
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <a onclick="go('pricing')" style="color:var(--accent);cursor:pointer;font-size:14px;font-weight:600">See full pricing →</a>
    </div>
    `:key==='artprints'?`
    <h4 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-l);font-weight:700;margin-bottom:14px">Choose a format</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px;max-width:940px">
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">Set of 4</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">Four 6″×4″ prints on one order. ₹200/print — ₹800 for the set.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('artprints')">Start set of 4 →</button>
      </div>
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">12″ × 18″</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">One large single print. ₹2,800. Rotate to 18″×12″ landscape any time in the editor.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('artprint12x18')">Start 12″×18″ →</button>
      </div>
      <div style="border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column">
        <h3 style="font-size:19px;margin-bottom:6px">16″ × 20″</h3>
        <p style="font-size:14px;color:var(--slate);line-height:1.5;margin-bottom:20px">Our largest single print. ₹4,200. Rotate to 20″×16″ landscape any time in the editor.</p>
        <button class="btn btn-accent sm" style="margin-top:auto" onclick="openEditor('artprint16x20')">Start 16″×20″ →</button>
      </div>
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <a onclick="go('pricing')" style="color:var(--accent);cursor:pointer;font-size:14px;font-weight:600">See full pricing →</a>
    </div>
    `:`
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-accent" onclick="openEditor('${key}')">Start creating your ${esc(info.label.toLowerCase())} →</button>
      <a onclick="go('pricing')" style="color:var(--accent);cursor:pointer;font-size:14px;font-weight:600">See full pricing →</a>
    </div>
    `}
  `;
  document.title=info.label+' — Binder';
  const desc=document.querySelector('meta[name="description"]'); if(desc)desc.setAttribute('content',intro.slice(0,155));
  const canon=document.querySelector('link[rel="canonical"]'); if(canon)canon.setAttribute('href','https://www.binder.co.in/'+START_PATH_FOR_KEY[key]);
}
/* ================= URL ROUTER ================= */
/* Every section, editor, and blog post gets its own real path (e.g. /store, /journal,
   /editor/photobook, /journal/<postId>) via the History API, so pages can be linked,
   bookmarked, refreshed, and navigated with the browser's back/forward buttons.
   Admin (/admin) and Dashboard (/dashboard) stay noindex via updateSeoMeta/go() above. */
function pathForView(v){ return v==='home' ? '/' : '/'+v; }
function setPath(path){
  if(location.pathname===path)return;
  history.pushState({},'',path);
}
function routeFromPath(){
  let path=location.pathname.replace(/\/+$/,'')||'/';
  const segs=path.split('/').filter(Boolean); // e.g. ['journal','abc123'] or ['editor','photobook']

  if(segs[0]==='editor'&&segs[1]){ openEditor(segs[1],false); return; }
  if(START_KEY_FOR_PATH[segs[0]]&&segs.length===1){ goStart(START_KEY_FOR_PATH[segs[0]],false); return; }
  if(segs[0]==='journal'&&segs[1]){ const key=segs[1]; let p=POSTS.find(x=>x.slug===key); if(!p)p=POSTS.find(x=>x.id===key); if(p){ openPost(p,false); return; } go('journal',false); return; }
  if(segs[0]==='store'&&segs[1]){ const key=segs[1]; let p=CATALOG.find(x=>x.slug===key); if(!p)p=CATALOG.find(x=>x.id===key); if(p){ openProductDetail(p.id,false); return; } go('store',false); return; }
  if(!segs.length){ go('home',false); return; }

  const v=segs[0];
  if($('view-'+v)){ go(v,false); return; }
  // Unknown path — fall back to home without leaving the browser stuck on a dead URL.
  go('home',false);
}
window.addEventListener('popstate', routeFromPath);
function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v==null?fallback:v}catch(e){return fallback}}
function saveJSON(key,val){try{localStorage.setItem(key,JSON.stringify(val));return true}catch(e){console.warn('localStorage save failed for',key,'—',e.message||e);return false}}

/* ---------- Google Fonts loader ---------- */
const _loadedFonts=new Set();
function loadGoogleFont(family){
  if(_loadedFonts.has(family))return; _loadedFonts.add(family);
  const l=document.createElement('link');l.rel='stylesheet';
  l.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g,'+')}:ital,wght@0,400;0,700;1,400&display=swap`;
  document.head.appendChild(l);
}
let FONT_CATS=loadJSON('binder_fonts',{
  sans:['Inter','Poppins','Montserrat','Raleway','Nunito','Work Sans','Josefin Sans'],
  serif:['Playfair Display','Merriweather','Lora','Cormorant Garamond','DM Serif Display','Fraunces','Libre Baskerville'],
  decorative:['Bebas Neue','Dancing Script','Pacifico','Caveat','Abril Fatface','Great Vibes','Amatic SC'],
  trade:['Tinos','EB Garamond','Lato','Montserrat']
});
function saveFonts(){saveJSON('binder_fonts',FONT_CATS)}

/* ---------- Print quality check ---------- */
const PRINT_DPI=300, TRIM_IN=8.5;
function minPrintPx(w,h){return Math.round(Math.max(w,h))}

/* ---------- Photo ingest (shared) ---------- */
async function decodeHeic(file){
  if(!window.heic2any){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js')}
  const b=await heic2any({blob:file,toType:'image/jpeg',quality:.92}); return Array.isArray(b)?b[0]:b;
}
async function decodeTiff(file){
  if(!window.UTIF){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/utif/3.1.0/UTIF.min.js')}
  const buf=await file.arrayBuffer(); const ifds=UTIF.decode(buf); UTIF.decodeImage(buf,ifds[0]);
  const rgba=UTIF.toRGBA8(ifds[0]); const c=document.createElement('canvas');
  c.width=ifds[0].width;c.height=ifds[0].height;
  c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba),c.width,c.height),0,0);
  return new Promise(r=>c.toBlob(r,'image/jpeg',.92));
}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
// One shared, consistent function for downsizing an uploaded image for fast web display. Used
// every time a photo is uploaded to Photography Services (and reusable anywhere else a
// fast-loading web image is needed) — deliberately separate from ingestFiles() above, which
// keeps full resolution on purpose since that content is destined for print, not a web page.
async function resizeImageForWeb(file,maxDimensionPx,quality){
  maxDimensionPx=maxDimensionPx||1600; quality=quality||0.82;
  let blob=file; const name=(file.name||'').toLowerCase();
  if(file.type==='image/heic'||file.type==='image/heif'||/\.hei[cf]$/.test(name))blob=await decodeHeic(file);
  else if(file.type==='image/tiff'||/\.tiff?$/.test(name))blob=await decodeTiff(file);
  const url=URL.createObjectURL(blob);
  try{
    const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=url;});
    let w=img.naturalWidth,h=img.naturalHeight;
    if(Math.max(w,h)>maxDimensionPx){const scale=maxDimensionPx/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale);}
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    const resized=await new Promise(res=>canvas.toBlob(res,'image/jpeg',quality));
    return resized||blob; // if canvas encoding somehow fails, fall back to the (decoded) original rather than losing the upload
  }finally{
    URL.revokeObjectURL(url);
  }
}
// SINGLE CHOKE POINT for every web-display image upload on the entire site. Every place that
// needs to put an image in the public 'cms-images' bucket calls this — never sb.storage upload
// directly — so resizing cannot be silently skipped by a call site that forgot to do it itself.
// resizeImageForWeb() is idempotent (an already-small image just gets re-compressed, not
// shrunk further), so this is always safe to call even if something upstream already resized.
// Deliberately NOT used for the 'photos' bucket, which feeds the print editors and must stay
// full-resolution for print quality — see uploadPhotoToStorage() for that separate path.
function isVideoFile(file){
  return (file.type||'').startsWith('video/')||/\.(mp4|webm|mov|m4v)$/i.test(file.name||'');
}
function isVideoUrl(url){
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url||'');
}
// Builds the correct tag for a placeholder that could hold either a video or an image — used
// consistently everywhere a placeholder gets rendered, so this logic exists in exactly one place.
// Videos autoplay muted and loop silently, since these are decorative backgrounds, not
// user-controlled playback — no controls, no sound.
function mediaTagHtml(url,altOrCaption,extraAttrs){
  extraAttrs=extraAttrs||'';
  if(isVideoUrl(url))return `<video src="${esc(url)}" autoplay muted loop playsinline preload="auto" ${extraAttrs}></video>`;
  return `<img src="${esc(url)}" loading="lazy" alt="${esc(altOrCaption||'')}" ${extraAttrs}>`;
}
function createMediaEl(url,altOrCaption){
  if(isVideoUrl(url)){
    const el=document.createElement('video');
    el.src=url; el.muted=true; el.loop=true; el.playsInline=true; el.preload='auto'; el.autoplay=true;
    return el;
  }
  const el=document.createElement('img');
  el.src=url; el.loading='lazy'; el.alt=altOrCaption||'';
  return el;
}
async function uploadWebImage(pathNoExt,file,maxDimensionPx){
  if(isVideoFile(file)){
    // Client-side video re-encoding isn't practical in a browser (no ffmpeg available) — videos
    // upload as-is. Keep hero videos short and reasonably compressed before uploading, the same
    // way the site's own built-in hero videos are prepared.
    const path=pathNoExt+'.mp4';
    const {error}=await sb.storage.from('cms-images').upload(path,file,{upsert:true,contentType:file.type||'video/mp4'});
    if(error)return {error};
    const {data}=sb.storage.from('cms-images').getPublicUrl(path);
    return {error:null,url:data.publicUrl};
  }
  const resized=await resizeImageForWeb(file,maxDimensionPx||1600,0.82);
  const path=pathNoExt+'.jpg';
  const {error}=await sb.storage.from('cms-images').upload(path,resized,{upsert:true,contentType:'image/jpeg'});
  if(error)return {error};
  const {data}=sb.storage.from('cms-images').getPublicUrl(path);
  return {error:null,url:data.publicUrl};
}
// Full-width hero/banner images (homepage hero, Store hero, Scanning hero, Photography Services
// lead image, Gallery) display at up to the visitor's entire screen width via object-fit:cover —
// on any screen wider than 1600 CSS px (i.e. most modern monitors, and doubly so on high-DPI/
// retina displays which need 2x the CSS width in real pixels), the 1600px thumbnail cap was
// being stretched past its native resolution, which is exactly what pixelation looks like.
const HERO_IMAGE_MAX_PX=3600;
/* ================= Supabase (real backend: auth, projects, photo storage) ================= */
const SUPABASE_URL='https://sooqtzedurtjiisjdmbz.supabase.co';
const SUPABASE_KEY='sb_publishable_3qDmjs8Bu9BTqyngt1m_1w_Vo6s1q1K';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let PENDING_UPLOADS=0;
async function uploadPhotoToStorage(photoId,blob,filename){
  if(!S.user)return; // not signed in yet — stays as a local-only blob until they sign in and save
  PENDING_UPLOADS++;
  try{
    const path=`${S.user.id}/${photoId}-${filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const {error}=await sb.storage.from('photos').upload(path,blob,{upsert:true,contentType:blob.type||'image/jpeg'});
    if(error)throw error;
    const {data}=sb.storage.from('photos').getPublicUrl(path);
    PHOTO_PERMANENT_URLS[photoId]=data.publicUrl;
  }catch(e){console.warn('Photo upload failed, staying local for this session:',e.message||e)}
  finally{PENDING_UPLOADS--;}
}
const PHOTO_PERMANENT_URLS={}; // photoId -> permanent Supabase Storage URL, once uploaded

// Per-file upload cap for the book editors' photo tray. The Supabase "photos" storage bucket
// must ALSO be configured to allow files this large (its own file-size limit defaults to a much
// smaller value) — see the "100MB uploads" note in supabase-setup.sql for the exact steps.
const MAX_UPLOAD_BYTES=100*1024*1024; // 100MB
async function ingestFiles(files,minLongEdgePx){
  const out=[];
  for(const f of files){
    try{
      if(f.size>MAX_UPLOAD_BYTES){
        toast(f.name+' is over 100MB and was skipped — try a smaller export of the same photo.');
        continue;
      }
      let blob=f; const name=f.name.toLowerCase();
      if(f.type==='image/heic'||f.type==='image/heif'||/\.hei[cf]$/.test(name))blob=await decodeHeic(f);
      else if(f.type==='image/tiff'||/\.tiff?$/.test(name))blob=await decodeTiff(f);
      const url=URL.createObjectURL(blob);
      const dim=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res({w:im.naturalWidth,h:im.naturalHeight});im.onerror=rej;im.src=url});
      const lowRes=Math.max(dim.w,dim.h)<(minLongEdgePx||2625);
      const photo={id:uid(),name:f.name,url,w:dim.w,h:dim.h,lowRes,takenAt:new Date(f.lastModified).toISOString()};
      out.push(photo);
      uploadPhotoToStorage(photo.id,blob,f.name); // fire-and-forget; Save waits on PENDING_UPLOADS if needed
      if(lowRes)toast(f.name+' is below 300 DPI print quality at full size — it will still place, with a warning.');
    }catch(e){toast("Couldn't read "+f.name+': '+(e.message||'unsupported format'))}
  }
  return out;
}
/* ================= Parameterized book editor engine (Photobook + Trade Book) ================= */
const EDS={};
const SHAPES=[
  {key:'rect',label:'Rectangle',clip:'none'},
  {key:'circle',label:'Circle',clip:'circle(50% at 50% 50%)'},
  {key:'ellipse',label:'Ellipse',clip:'ellipse(50% 38% at 50% 50%)'},
  {key:'triangle',label:'Triangle',clip:'polygon(50% 0%,0% 100%,100% 100%)'},
  {key:'triangle-down',label:'Inverted Triangle',clip:'polygon(0% 0%,100% 0%,50% 100%)'},
  {key:'diamond',label:'Diamond',clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
  {key:'pentagon',label:'Pentagon',clip:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)'},
  {key:'hexagon',label:'Hexagon',clip:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'},
  {key:'octagon',label:'Octagon',clip:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'},
  {key:'star',label:'Star',clip:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
  {key:'heart',label:'Heart',clip:'polygon(50% 15%,61% 5%,75% 5%,88% 15%,92% 30%,85% 48%,50% 80%,15% 48%,8% 30%,12% 15%,25% 5%,39% 5%)'},
  {key:'arrow',label:'Arrow',clip:'polygon(0% 22%,58% 22%,58% 2%,100% 50%,58% 98%,58% 78%,0% 78%)'},
  {key:'cross',label:'Cross',clip:'polygon(35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%)'},
  {key:'parallelogram',label:'Parallelogram',clip:'polygon(15% 0%,100% 0%,85% 100%,0% 100%)'},
  {key:'trapezoid',label:'Trapezoid',clip:'polygon(22% 0%,78% 0%,100% 100%,0% 100%)'},
];
function shapeClip(key){const s=SHAPES.find(x=>x.key===key);return s?s.clip:'none'}
function mkShape(shapeKey,isPlaceholder,x,y,w,h){return {id:uid(),shapeKey,isPlaceholder,photo:null,x,y,w,h,rot:0,
  fill:isPlaceholder?'hsla(0,0%,80%,0.8)':'hsla(0,0%,0%,0.5)',b:100,c:100,sat:100};}

/* Fits a photo into a slot (x,y,w,h in %) preserving the photo's true pixel aspect
   ratio, so it is never stretched or cropped — shrinks to fit within the slot and
   centers there. containerR is the on-screen width/height ratio of the box the
   percentages are relative to (a page, or an Art Print board), since a % box only
   looks square/rectangular on screen if the container itself is that shape. */
function fitPhotoBox(ph,containerR,x,y,w,h){
  const pr=(ph&&ph.w&&ph.h)?ph.w/ph.h:1;
  let fw=w, fh=w*containerR/pr;
  if(fh>h){fh=h;fw=h*pr/containerR;}
  return {x:x+(w-fw)/2,y:y+(h-fh)/2,w:fw,h:fh};
}
const MIN_PRINT_DPI=300;
// The box (b.x/y/w/h, in % of the board) always exactly matches what fitPhotoBox fit the photo
// into — no letterboxing — so the box's physical size on the board IS the image's printed size.
// Effective DPI = the photo's native pixels ÷ that physical size in inches. Takes the lower of
// the horizontal/vertical figures (they're normally near-identical since aspect ratio is
// preserved) so a very slightly non-square rounding can't hide a real problem.
function computePrintDpi(ph,boardWIn,boardHIn,box){
  if(!ph||!box||!ph.w||!ph.h)return null;
  const boxWIn=(box.w/100)*boardWIn, boxHIn=(box.h/100)*boardHIn;
  if(boxWIn<=0||boxHIn<=0)return null;
  return Math.round(Math.min(ph.w/boxWIn, ph.h/boxHIn));
}
// Only ever shown when there's actually a problem — an image at or above 300 DPI gets no badge
// at all, so the editor stays uncluttered for the common case.
function dpiWarningEl(dpi){
  if(dpi===null||dpi>=MIN_PRINT_DPI)return null;
  const el=document.createElement('div'); el.className='dpi-warning';
  el.title='This photo is too low-resolution for a sharp print at its current size — use a higher-resolution photo, or shrink it on the board.';
  el.textContent=`⚠ ${dpi} DPI — below ${MIN_PRINT_DPI} recommended`;
  return el;
}
function createEditor(key,cfg){
  const mkImg=(photo,x,y,w,h)=>({id:uid(),photo,x,y,w,h,rot:0,b:100,c:100,sat:100,fit:'contain'});
  const mkPage=()=>({bg:'#FFFFFF',images:[],texts:[],shapes:[]});
  // pageR is a function (not a cached constant) because orientation-switchable editors (e.g. the
  // 12×18 photobook) mutate cfg.aspect at runtime — a cached ratio would silently go stale the
  // moment someone flips portrait/landscape, throwing off every fitBox() call after that.
  const pageR=()=>{const parts=cfg.aspect.split('/').map(Number);return parts[0]/parts[1];};
  // For orientation-switchable editors, remember the original (portrait) trim size once at
  // creation time so we can always compute the landscape swap from a fixed baseline rather than
  // drifting after repeated toggles.
  if(cfg.hasOrientation){cfg._baseW=cfg.pageInW;cfg._baseH=cfg.pageInH;}

  const ed={
    key,cfg,photos:[],
    doc:{title:cfg.defaultTitle,cover:mkPage(),backCover:mkPage(),spine:mkPage(),pages:Array.from({length:cfg.minPages},mkPage),
      orientation:cfg.hasOrientation?(cfg.defaultOrientation||'portrait'):undefined},
    cur:-1, sel:null, tool:'photos', armed:null, history:[], future:[], _coverZone:'cover', grid:false, zoom:100,
    fitBox(ph,x,y,w,h){return fitPhotoBox(ph,pageR(),x,y,w,h);},
    /* ---------- Orientation (portrait/landscape) — only wired up for editors created with
       cfg.hasOrientation:true. Swaps cfg.pageInW/pageInH/aspect between the base (portrait)
       dimensions and their landscape flip, then re-renders. Content stays in place because every
       object's position/size is stored as a percentage of the page, not an absolute value. ---- */
    applyOrientation(o){ // sync cfg dims to the given orientation WITHOUT touching undo history — used when opening/loading a doc
      if(!cfg.hasOrientation)return;
      if(o==='landscape'){cfg.pageInW=cfg._baseH;cfg.pageInH=cfg._baseW;}
      else{cfg.pageInW=cfg._baseW;cfg.pageInH=cfg._baseH;}
      cfg.aspect=cfg.pageInW+'/'+cfg.pageInH;
    },
    setOrientation(o){ // user-triggered — goes through mutate() so it's undoable
      if(!cfg.hasOrientation)return;
      o=(o==='landscape')?'landscape':'portrait';
      if(ed.doc.orientation===o)return;
      ed.mutate(d=>{d.orientation=o;});
      ed.applyOrientation(o);
      const btn=$(cfg.prefix+'-orientBtn');
      if(btn){btn.title='Currently '+o+' — switch to '+(o==='portrait'?'landscape':'portrait');btn.classList.toggle('on',o==='landscape');
        btn.style.transform=o==='landscape'?'rotate(90deg)':'none';}
      ed.renderAll();
      toast('Switched to '+o+' ('+cfg.pageInW+'″ × '+cfg.pageInH+'″)');
    },
    toggleOrientation(){ed.setOrientation(ed.doc.orientation==='landscape'?'portrait':'landscape');},
    spineWidthIn(){return +(ed.pageCount()*(cfg.spineCaliperIn||0.0035)).toFixed(3)},
    pageRefObj(ref){return ref==='cover'?ed.doc.cover:ref==='back'?ed.doc.backCover:ref==='spine'?ed.doc.spine:ed.doc.pages[ref]},
    /* Interior page layout: an ordered list of {type:'single',idx} or {type:'spread',l,r} entries.
       For blockStartsRecto editors (Trade Book), page index 0 stands alone on the right (recto),
       matching real book convention — the block doesn't open on a left/right pair. */
    interiorLayout(){
      const N=ed.doc.pages.length; const L=[];
      if(cfg.blockStartsRecto){
        L.push({type:'single',idx:0}); let i=1;
        while(i+1<N){L.push({type:'spread',l:i,r:i+1});i+=2;}
        if(i<N)L.push({type:'single',idx:i});
      }else{
        for(let i=0;i<N;i+=2)L.push({type:'spread',l:i,r:i+1});
      }
      return L;
    },
    curPage(){if(ed.sel)return ed.pageRefObj(ed.sel.page);
      if(ed.cur==='coverspread')return ed.pageRefObj(ed._coverZone);
      if(ed.cur==='cover'||ed.cur==='back')return ed.pageRefObj(ed.cur);
      const item=ed.interiorLayout()[ed.cur]; if(!item)return ed.doc.pages[0];
      return ed.doc.pages[item.type==='single'?item.idx:item.l];},
    curPageRef(){if(ed.sel)return ed.sel.page;
      if(ed.cur==='coverspread')return ed._coverZone;
      if(ed.cur==='cover'||ed.cur==='back')return ed.cur;
      const item=ed.interiorLayout()[ed.cur]; if(!item)return 0;
      return item.type==='single'?item.idx:item.l;},

    snap(){ed.history.push(JSON.stringify(ed.doc));if(ed.history.length>60)ed.history.shift();ed.future=[];ed.syncUndo();ed._dirty=true;},
    mutate(fn){ed.snap();fn(ed.doc);ed.autosave()},
    undo(){if(!ed.history.length)return;ed.future.push(JSON.stringify(ed.doc));ed.doc=JSON.parse(ed.history.pop());ed.sel=null;ed.renderAll();ed.autosave()},
    redo(){if(!ed.future.length)return;ed.history.push(JSON.stringify(ed.doc));ed.doc=JSON.parse(ed.future.pop());ed.sel=null;ed.renderAll();ed.autosave()},
    syncUndo(){const u=$(cfg.prefix+'-undoBtn'),r=$(cfg.prefix+'-redoBtn');if(u)u.disabled=!ed.history.length;if(r)r.disabled=!ed.future.length},
    autosave(){const el=$(cfg.prefix+'-saveState');if(el){el.textContent='Saved';clearTimeout(ed._st);ed._st=setTimeout(()=>{if(el)el.textContent=''},1400)}},

    pageCount(){return ed.doc.pages.length},
    addPages(){if(cfg.maxPages&&ed.pageCount()>=cfg.maxPages)return toast('Maximum page count reached.');
      ed.mutate(d=>{for(let i=0;i<cfg.pageStep;i++)d.pages.push(mkPage())});
      toast(cfg.pageStep+' pages added — now '+ed.pageCount()+' pages');ed.renderAll();if(key==='photobook'||key==='photobook12'||key==='photobook18')updatePhotobookPrice(key);},
    removePages(){if(ed.pageCount()<=cfg.minPages)return toast('Books start at '+cfg.minPages+' pages.');
      const tail=ed.doc.pages.slice(-cfg.pageStep);
      if(tail.some(p=>p.images.length||p.texts.length)&&!confirm('The last pages contain content. Remove anyway?'))return;
      ed.mutate(d=>{d.pages.length-=cfg.pageStep});
      if(typeof ed.cur==='number'){const max=ed.interiorLayout().length-1;if(ed.cur>max)ed.cur=Math.max(0,max);}
      toast(cfg.pageStep+' pages removed — now '+ed.pageCount()+' pages');ed.renderAll();if(key==='photobook'||key==='photobook12'||key==='photobook18')updatePhotobookPrice(key);},

    usedIds(){const s=new Set();[ed.doc.cover,ed.doc.backCover,...ed.doc.pages].forEach(p=>p.images.forEach(im=>s.add(im.photo)));return s},
    addFiles(files){ingestFiles(files,cfg.minPrintPx).then(added=>{ed.photos.push(...added);ed.renderPanel();toast(added.length+' photo(s) in your tray')})},

    smartFill(){
      const used=ed.usedIds(); const pool=ed.photos.filter(p=>!used.has(p.id));
      if(!pool.length)return toast('Add photos first — everything is already placed.');
      const ARR={1:[[10,10,80,80]],2:[[4,10,44,80],[52,10,44,80]],3:[[4,4,92,56],[4,62,44,34],[52,62,44,34]],4:[[4,4,44,44],[52,4,44,44],[4,52,44,44],[52,52,44,44]]};
      ed.mutate(d=>{
        if(!d.cover.images.length){const ph=pool.shift();if(ph){const fb=ed.fitBox(ph,8,8,84,84);d.cover.images.push(mkImg(ph.id,fb.x,fb.y,fb.w,fb.h));}}
        // Grow the book first, targeting ~3 photos/page (the middle of this layout's own 1–4
        // range) — a fresh book starts at cfg.minPages, which usually isn't enough empty pages
        // to hold everything in the tray, so top up before distributing rather than after.
        growPagesForAutoLayout(d,cfg,Math.ceil(pool.length/3));
        const empties=d.pages.filter(pg=>!pg.images.length);
        empties.forEach((pg,i)=>{
          if(!pool.length)return;
          const remaining=pool.length/Math.max(1,empties.length-i);
          const n=Math.min(4,remaining<=1.2?1:remaining<=2.4?2:remaining<=3.4?3:4);
          (ARR[n]||ARR[1]).forEach(([x,y,w,h])=>{if(pool.length){const ph=pool.shift();const fb=ed.fitBox(ph,x,y,w,h);pg.images.push(mkImg(ph.id,fb.x,fb.y,fb.w,fb.h));}});
        });
      });
      if(PRICING_RULES[key])updatePhotobookPrice(key);
      if(pool.length>0)toast(`Smart Layout placed what fits — added pages up to the ${cfg.maxPages}-page maximum, but ${pool.length} photo${pool.length===1?'':'s'} still need${pool.length===1?'s':''} a spot. Remove a few, or split into a second book.`);
      else toast('Smart Layout placed all your photos ✦ Pages were added automatically to fit — everything stays movable.');
      ed.renderAll();
    },

    setTool(t){ed.tool=t;if(t==='cover'&&cfg.hasSpine){ed.cur='coverspread';ed.sel=null;}
      document.querySelectorAll('#'+cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));ed.renderPanel();ed.renderStage();ed.renderStrip();},
    setCur(c){ed.cur=c;ed.sel=null;ed.renderAll()},
    toggleGrid(){ed.grid=!ed.grid;const b=$(cfg.prefix+'-gridBtn');if(b)b.classList.toggle('on',ed.grid);ed.renderStage();},
    togglePageNums(){ed._pageNums=!ed._pageNums;const b=$(cfg.prefix+'-pnBtn');if(b)b.classList.toggle('on',ed._pageNums);ed.renderStage();toast(ed._pageNums?'Page numbers on':'Page numbers off');},
    setZoom(delta){ed.zoom=delta===0?100:Math.max(50,Math.min(150,ed.zoom+delta));
      const st=$(cfg.prefix+'-stage');if(st)st.style.transform='scale('+(ed.zoom/100)+')';
      const lbl=$(cfg.prefix+'-zoomVal');if(lbl)lbl.textContent=ed.zoom+'%';},

    imgFilter(im,blurScale){let f=`brightness(${im.b??100}%) contrast(${im.c??100}%) saturate(${im.sat??100}%)`;
      const t=im.temp||0;
      if(!cfg.monochrome&&t>0)f+=` sepia(${Math.round(t*0.35)}%) saturate(${100+t*0.3}%)`;
      if(!cfg.monochrome&&t<0)f+=` hue-rotate(${Math.round(t*0.25)}deg) saturate(${100+t*0.15}%)`;
      if(im.blur)f+=` blur(${(im.blur*(blurScale||1)).toFixed(2)}px)`;
      if(cfg.monochrome)f+=' grayscale(100%)';return f},

    /* ---------- Snapping: page centre/edges + alignment with sibling objects on the same page ---------- */
    snapTargets(page,excludeId){
      const xs=[0,50,100], ys=[0,50,100];
      const collect=arr=>arr.forEach(o=>{if(o.id===excludeId)return;xs.push(o.x,o.x+o.w/2,o.x+o.w);ys.push(o.y,o.y+o.h/2,o.y+o.h);});
      collect(page.images); collect(page.texts.map(t=>({id:t.id,x:t.x,y:t.y,w:t.w||10,h:4}))); collect(page.shapes||[]);
      if(ed.grid){xs.push(25,75);ys.push(25,75);}
      return{xs,ys};
    },
    snapValue(val,size,targets,guideAxis,pageEl,threshold){
      threshold=threshold||1.3;
      const edges=[val,val+size/2,val+size]; let best=null,bestDelta=threshold,bestGuide=null;
      edges.forEach((edge,i)=>{
        targets.forEach(t=>{
          const delta=Math.abs(edge-t);
          if(delta<bestDelta){bestDelta=delta;bestGuide=t;
            best=i===0?t:i===1?t-size/2:t-size;}
        });
      });
      if(best!==null&&pageEl){ed.showGuide(pageEl,guideAxis,bestGuide);} 
      return best!==null?best:val;
    },
    showGuide(pageEl,axis,pos){
      let line=pageEl.querySelector('.snap-line.'+axis);
      if(!line){line=document.createElement('div');line.className='snap-line '+axis;pageEl.appendChild(line);}
      if(axis==='v')line.style.left=pos+'%'; else line.style.top=pos+'%';
      line.style.display='block';
    },
    clearGuides(pageEl){pageEl.querySelectorAll('.snap-line').forEach(l=>l.style.display='none');},
    // Adds all 8 resize handles (4 edges + 4 corners) to an already-positioned object element `d`,
    // wired to resize `obj` (anything with x/y/w/h in page %, shared shape by images/shapes/AP
    // boards) from whichever side is grabbed — each moving edge snaps against the same
    // page/grid/sibling-object targets a move-drag uses. Holding Shift while dragging a corner
    // preserves the object's original aspect ratio; Alt (like moving) temporarily disables
    // snapping. `onStart` fires at mousedown (e.g. to select the object); `onDone` fires once,
    // after mouseup, for resize-only side effects (e.g. growing a photo back out to bleed).
    wireResizeHandles(d,obj,page,el,onStart,onDone){
      ['n','s','e','w','ne','nw','se','sw'].forEach(dir=>{
        const rh=document.createElement('div'); rh.className='rh rh-'+dir; d.appendChild(rh);
        rh.onmousedown=e=>{
          e.preventDefault();e.stopPropagation();
          if(obj.locked)return;
          if(onStart)onStart();
          const rect=el.getBoundingClientRect();
          const sx=e.clientX, sy=e.clientY;
          const ox=obj.x, oy=obj.y, ow=obj.w, oh=obj.h, ratio=(oh||1)/(ow||1);
          const right=ox+ow, bottom=oy+oh; // fixed anchor edges for this drag
          const targets=ed.snapTargets(page,obj.id);
          const MIN=4;
          const mv=ev=>{
            const dx=(ev.clientX-sx)/rect.width*100, dy=(ev.clientY-sy)/rect.height*100;
            ed.clearGuides(el);
            let nx=ox, ny=oy, nw=ow, nh=oh;
            if(dir.includes('e')){
              let r=right+dx;
              if(!ev.altKey)r=ed.snapValue(r,0,targets.xs,'v',el);
              nw=Math.max(MIN,r-ox);
            }
            if(dir.includes('w')){
              let l=ox+dx;
              if(!ev.altKey)l=ed.snapValue(l,0,targets.xs,'v',el);
              l=Math.min(l,right-MIN);
              nx=l; nw=right-l;
            }
            if(dir.includes('s')){
              let b=bottom+dy;
              if(!ev.altKey)b=ed.snapValue(b,0,targets.ys,'h',el);
              nh=Math.max(MIN,b-oy);
            }
            if(dir.includes('n')){
              let t=oy+dy;
              if(!ev.altKey)t=ed.snapValue(t,0,targets.ys,'h',el);
              t=Math.min(t,bottom-MIN);
              ny=t; nh=bottom-t;
            }
            if(ev.shiftKey&&dir.length===2){ // corner handle — preserve original aspect ratio
              if(Math.abs(dx)>=Math.abs(dy)){nh=nw*ratio; if(dir.includes('n'))ny=bottom-nh;}
              else{nw=nh/ratio; if(dir.includes('w'))nx=right-nw;}
            }
            obj.x=nx;obj.y=ny;obj.w=nw;obj.h=nh;
            d.style.left=nx+'%';d.style.top=ny+'%';d.style.width=nw+'%';d.style.height=nh+'%';
          };
          const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);ed.clearGuides(el);
            if(onDone)onDone();
            ed.snap();ed.autosave();ed.renderStrip();ed.renderAll();};
          window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);
        };
      });
    },

    buildPage(page,pageRef,_pgNum,_side,interactive,showSafeArea){
      // Applied here, at the top of the one function every page (cover/back/spine/interior) goes
      // through on every render, rather than only once when the editor first opens — that one-time
      // approach turned out to miss sessions where the editor was already open, or where a page
      // gets rendered through some other entry point. This is idempotent (safe to re-run on
      // already-corrected data), so running it on every render is harmless and far more reliable.
      if(pageRef!=='spine'&&ed.growEdgesToBleed)(page.images||[]).forEach(im=>ed.growEdgesToBleed(im));
      const el=document.createElement('div');el.className='book-page';el.style.background=page.bg;
      el.style.width=cfg.pageCssW; el.style.aspectRatio=cfg.aspect;
      if(cfg.monochrome&&typeof pageRef==='number')el.style.filter='grayscale(100%)';
      interactive=interactive!==false;
      if(ed.grid&&interactive){
        [25,50,75].forEach(pct=>{
          const v=document.createElement('div');v.className='grid-line v';v.style.left=pct+'%';el.appendChild(v);
          const h=document.createElement('div');h.className='grid-line h';h.style.top=pct+'%';el.appendChild(h);
        });
      }
      // Safe-margin guide (0.5" inset by default) — shown on every editable page except the spine.
      const showGuides=interactive&&cfg.marginIn&&cfg.pageInW&&cfg.pageInH&&pageRef!=='spine';
      if(showGuides){
        const pw=cfg.pageInW,ph=cfg.pageInH,m=cfg.marginIn;
        const guide=document.createElement('div');guide.className='safe-area-guide';
        guide.style.cssText=`left:${(m/pw)*100}%;top:${(m/ph)*100}%;width:${(1-2*m/pw)*100}%;height:${(1-2*m/ph)*100}%`;
        el.appendChild(guide);
      }
      // Auto page numbers
      if(ed._pageNums&&typeof pageRef==='number'&&pageRef>=0){
        const pn=document.createElement('div');
        pn.style.cssText=`position:absolute;bottom:5%;left:50%;transform:translateX(-50%);font-size:11px;font-weight:500;color:rgba(0,0,0,.55);pointer-events:none;font-family:serif;letter-spacing:.08em;line-height:1`;
        pn.textContent=pageRef+1;
        el.appendChild(pn);
      }
      page.images.forEach(im=>{
        const d=document.createElement('div');d.className='img-obj'+(im.locked?' locked':'');
        d.style.cssText=`left:${im.x}%;top:${im.y}%;width:${im.w}%;height:${im.h}%`;
        if((im.op??100)<100)d.style.opacity=(im.op/100);
        if(im.shadow)d.style.boxShadow=`0 ${(im.shadow*0.35).toFixed(1)}px ${im.shadow}px rgba(0,0,0,.38)`;
        if(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='image'&&ed.sel.id===im.id)d.classList.add('sel');
        const ph=ed.photos.find(p=>p.id===im.photo);
        if(ph){const img=document.createElement('img');img.src=ph.url;img.style.filter=ed.imgFilter(im);
          const fit=im.fit||'contain';img.style.objectFit=fit;
          let tf=`rotate(${im.rot}deg)`;
          if(fit==='cover'){img.style.objectPosition=`${im.fx??50}% ${im.fy??50}%`;if((im.zoom||100)!==100)tf+=` scale(${(im.zoom/100).toFixed(2)})`;}
          img.style.transform=tf;
          d.appendChild(img);}
        if(!interactive){el.appendChild(d);return}
        const addDel=()=>{if(im.locked||d.querySelector('.obj-del'))return;const del=document.createElement('div');del.className='obj-del';del.textContent='×';
          del.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
          del.onclick=e=>{e.preventDefault();e.stopPropagation();ed.mutate(()=>{const arr=ed.pageRefObj(pageRef).images;const i=arr.findIndex(o=>o.id===im.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll()};
          d.appendChild(del)};
        if(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='image'&&ed.sel.id===im.id)addDel();
        const select=()=>{ed.sel={page:pageRef,kind:'image',id:im.id};
          document.querySelectorAll('#'+cfg.prefix+'-stage .tbox.sel,#'+cfg.prefix+'-stage .img-obj.sel').forEach(x=>{x.classList.remove('sel');const b=x.querySelector('.obj-del');if(b)b.remove()});
          d.classList.add('sel');addDel();el.appendChild(d);
          ed.tool=cfg.hasAdjust?'adjust':'photos';document.querySelectorAll('#'+cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool===ed.tool));
          ed.renderPanel();};
        d.onmousedown=e=>{if(e.target.classList&&e.target.classList.contains('rh'))return;e.preventDefault();e.stopPropagation();select();
          if(im.locked)return;
          const rect=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=im.x,oy=im.y;let moved=false;
          const targets=ed.snapTargets(page,im.id);
          const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;if(Math.abs(dx)+Math.abs(dy)>0.4)moved=true;
            let nx=Math.min(100-im.w*0.15,Math.max(-im.w*0.85,ox+dx)),ny=Math.min(100-im.h*0.15,Math.max(-im.h*0.85,oy+dy));
            ed.clearGuides(el);
            if(!ev.altKey){nx=ed.snapValue(nx,im.w,targets.xs,'v',el);ny=ed.snapValue(ny,im.h,targets.ys,'h',el);}
            im.x=nx;im.y=ny; d.style.left=im.x+'%';d.style.top=im.y+'%';};
          const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);ed.clearGuides(el);if(moved){ed.growEdgesToBleed(im);ed.snap();ed.autosave();ed.renderStrip();ed.renderAll();}};
          window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);};
        if(!im.locked)ed.wireResizeHandles(d,im,page,el,select,()=>ed.growEdgesToBleed(im));
        d.ondragover=ev=>{ev.preventDefault();d.classList.add('dragover')};
        d.ondragleave=()=>d.classList.remove('dragover');
        d.ondrop=ev=>{ev.preventDefault();d.classList.remove('dragover');const id=ev.dataTransfer.getData('photo');if(!id)return;
          ed.mutate(()=>{im.photo=id});ed.sel={page:pageRef,kind:'image',id:im.id};ed.renderAll();};
        el.appendChild(d);
      });
      (page.shapes||[]).forEach(sh=>{
        const d=document.createElement('div');d.className='shape-obj'+(sh.locked?' locked':'');
        const clip=shapeClip(sh.shapeKey);
        d.style.cssText=`left:${sh.x}%;top:${sh.y}%;width:${sh.w}%;height:${sh.h}%;transform:rotate(${sh.rot||0}deg)`;
        if(sh.shadow)d.style.filter=`drop-shadow(0 ${(sh.shadow*0.35).toFixed(1)}px ${sh.shadow}px rgba(0,0,0,.35))`;
        if(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='shape'&&ed.sel.id===sh.id)d.classList.add('sel');
        const mask=document.createElement('div');mask.className='shape-mask';mask.style.cssText=`clip-path:${clip};-webkit-clip-path:${clip}`;
        const ph=sh.photo?ed.photos.find(p=>p.id===sh.photo):null;
        if(ph){const img=document.createElement('img');img.src=ph.url;img.style.filter=ed.imgFilter(sh);mask.appendChild(img);}
        else{mask.style.background=sh.fill;}
        d.appendChild(mask);
        if(!interactive){el.appendChild(d);return}
        const addDel=()=>{if(d.querySelector('.obj-del'))return;const del=document.createElement('div');del.className='obj-del';del.textContent='×';
          del.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
          del.onclick=e=>{e.preventDefault();e.stopPropagation();ed.mutate(()=>{const arr=ed.pageRefObj(pageRef).shapes||[];const i=arr.findIndex(o=>o.id===sh.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll()};
          d.appendChild(del)};
        if(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='shape'&&ed.sel.id===sh.id)addDel();
        const select=()=>{ed.sel={page:pageRef,kind:'shape',id:sh.id};
          document.querySelectorAll('#'+cfg.prefix+'-stage .tbox.sel,#'+cfg.prefix+'-stage .img-obj.sel,#'+cfg.prefix+'-stage .shape-obj.sel').forEach(x=>{x.classList.remove('sel');const b=x.querySelector('.obj-del');if(b)b.remove()});
          d.classList.add('sel');addDel();el.appendChild(d);
          ed.tool='shapes';document.querySelectorAll('#'+cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool==='shapes'));
          ed.renderPanel();};
        d.onmousedown=e=>{if(e.target.classList&&e.target.classList.contains('rh'))return;e.preventDefault();e.stopPropagation();select();
          if(sh.locked)return;
          const rect=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=sh.x,oy=sh.y;let moved=false;
          const targets=ed.snapTargets(page,sh.id);
          const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;if(Math.abs(dx)+Math.abs(dy)>0.4)moved=true;
            let nx=Math.min(100-sh.w*0.15,Math.max(-sh.w*0.85,ox+dx)),ny=Math.min(100-sh.h*0.15,Math.max(-sh.h*0.85,oy+dy));
            ed.clearGuides(el);
            if(!ev.altKey){nx=ed.snapValue(nx,sh.w,targets.xs,'v',el);ny=ed.snapValue(ny,sh.h,targets.ys,'h',el);}
            sh.x=nx;sh.y=ny;d.style.left=sh.x+'%';d.style.top=sh.y+'%';};
          const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);ed.clearGuides(el);if(moved){ed.snap();ed.autosave();ed.renderStrip();}};
          window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);};
        if(!sh.locked)ed.wireResizeHandles(d,sh,page,el,select);
        if(sh.isPlaceholder){
          d.ondragover=ev=>{ev.preventDefault();d.classList.add('dragover')};
          d.ondragleave=()=>d.classList.remove('dragover');
          d.ondrop=ev=>{ev.preventDefault();d.classList.remove('dragover');const id=ev.dataTransfer.getData('photo');if(!id)return;
            ed.mutate(()=>{sh.photo=id});ed.sel={page:pageRef,kind:'shape',id:sh.id};ed.renderAll();};
        }
        el.appendChild(d);
      });
      page.texts.forEach(t=>{
        const d=document.createElement('div');d.className='tbox'+(t.locked?' locked':'')+(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='text'&&ed.sel.id===t.id?' sel':'');
        d.style.cssText=`left:${t.x}%;top:${t.y}%${t.w?`;width:${t.w}%`:''}`;
        const inner=document.createElement('div');inner.className='tbox-inner';inner.contentEditable=interactive&&!t.locked;inner.innerHTML=t.html;
        const col=cfg.monochrome?`rgba(0,0,0,${(t.blackPct??100)/100})`:t.color;
        inner.style.cssText=`font-size:${t.size}${t.unit||'px'};color:${col};font-family:'${t.font}',serif;text-align:${t.align};
          font-weight:${t.bold?700:(t.weight||400)};font-style:${t.italic?'italic':'normal'};text-decoration:${t.underline?'underline':'none'};
          line-height:${t.lineHeight??1.3};--para-gap:${t.paraSpacing??8}px;letter-spacing:${t.ls??0}px;text-indent:${t.indent??0}em`+
          (t.shadow?`;text-shadow:0 ${(t.shadow*0.006).toFixed(3)}em ${(t.shadow*0.014).toFixed(3)}em rgba(0,0,0,.42)`:'');
        d.appendChild(inner);
        if(!interactive){el.appendChild(d);return}
        const addDel=()=>{if(t.locked||d.querySelector('.obj-del'))return;const del=document.createElement('div');del.className='obj-del';del.textContent='×';
          del.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
          del.onclick=e=>{e.preventDefault();e.stopPropagation();ed.mutate(()=>{const arr=ed.pageRefObj(pageRef).texts;const i=arr.findIndex(o=>o.id===t.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll()};
          d.appendChild(del)};
        if(ed.sel&&ed.sel.page===pageRef&&ed.sel.kind==='text'&&ed.sel.id===t.id)addDel();
        const selectLite=()=>{ed.sel={page:pageRef,kind:'text',id:t.id};
          document.querySelectorAll('#'+cfg.prefix+'-stage .tbox.sel,#'+cfg.prefix+'-stage .img-obj.sel').forEach(x=>{x.classList.remove('sel');const b=x.querySelector('.obj-del');if(b)b.remove()});
          d.classList.add('sel');addDel();el.appendChild(d);
          ed.tool='text';document.querySelectorAll('#'+cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool==='text'));
          ed.renderPanel();};
        d.onmousedown=e=>{if(e.target.classList&&e.target.classList.contains('obj-del'))return;
          if(document.activeElement===inner)return;
          selectLite();
          if(t.locked)return;
          const rect=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=t.x,oy=t.y;let dragging=false;
          const dRect=d.getBoundingClientRect();const tw=dRect.width/rect.width*100,th=dRect.height/rect.height*100;
          const targets=ed.snapTargets(page,t.id);
          const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;
            if(!dragging&&Math.abs(dx)+Math.abs(dy)>1.5)dragging=true; if(!dragging)return;
            let nx=Math.min(92,Math.max(0,ox+dx)),ny=Math.min(94,Math.max(0,oy+dy));
            ed.clearGuides(el);
            if(!ev.altKey){nx=ed.snapValue(nx,tw,targets.xs,'v',el);ny=ed.snapValue(ny,th,targets.ys,'h',el);}
            t.x=nx;t.y=ny;d.style.left=t.x+'%';d.style.top=t.y+'%';};
          const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);ed.clearGuides(el);
            if(dragging){ed.snap();ed.autosave();ed.renderStrip();}else inner.focus();};
          window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);};
        inner.ondblclick=()=>inner.focus();
        inner.onblur=()=>{if(inner.innerHTML!==t.html){ed.snap();t.html=inner.innerHTML;ed.autosave();}};
        el.appendChild(d);
      });
      /* page numbers intentionally not rendered */
      if(interactive){
        el.onclick=e=>{
          if(ed.armed&&e.target===el){const ph=ed.photos.find(p=>p.id===ed.armed);if(ph){
            const rect=el.getBoundingClientRect();const cx=(e.clientX-rect.left)/rect.width*100,cy=(e.clientY-rect.top)/rect.height*100;
            const fb=ed.fitBox(ph,cx-18,cy-18,36,36);
            ed.mutate(()=>{ed.pageRefObj(pageRef).images.push(mkImg(ph.id,Math.max(0,Math.min(100-fb.w,fb.x)),Math.max(0,Math.min(100-fb.h,fb.y)),fb.w,fb.h))});
            ed.armed=null;ed.sel={page:pageRef,kind:'image',id:ed.pageRefObj(pageRef).images.slice(-1)[0].id};ed.renderAll();return;}}
          ed.sel=null;ed.renderAll();};
        el.ondragover=e=>e.preventDefault();
        el.ondrop=e=>{if(e.target!==el)return;e.preventDefault();
          const shapeData=e.dataTransfer.getData('shape');
          if(shapeData){const {shapeKey,isPlaceholder}=JSON.parse(shapeData);
            const rect=el.getBoundingClientRect();const cx=(e.clientX-rect.left)/rect.width*100,cy=(e.clientY-rect.top)/rect.height*100;
            const w=34,h=34;
            ed.mutate(()=>{const p=ed.pageRefObj(pageRef);if(!p.shapes)p.shapes=[];
              const sh=mkShape(shapeKey,isPlaceholder,Math.max(0,Math.min(100-w,cx-w/2)),Math.max(0,Math.min(100-h,cy-h/2)),w,h);
              p.shapes.push(sh);ed.sel={page:pageRef,kind:'shape',id:sh.id};});
            ed.tool='shapes';ed.renderAll();return;}
          const id=e.dataTransfer.getData('photo');if(!id)return;
          const ph=ed.photos.find(p=>p.id===id);if(!ph)return;
          const rect=el.getBoundingClientRect();const cx=(e.clientX-rect.left)/rect.width*100,cy=(e.clientY-rect.top)/rect.height*100;
          const fb=ed.fitBox(ph,cx-18,cy-18,36,36);
          ed.mutate(()=>{ed.pageRefObj(pageRef).images.push(mkImg(id,Math.max(0,fb.x),Math.max(0,fb.y),fb.w,fb.h))});
          ed.sel={page:pageRef,kind:'image',id:ed.pageRefObj(pageRef).images.slice(-1)[0].id};ed.renderAll();};
      }
      if(showGuides){
        // Bleed guide sits on a wrapper so it can extend past the trim (page) edge without being clipped.
        const pw=cfg.pageInW,ph=cfg.pageInH,bl=cfg.bleedIn||0.2;
        const wrap=document.createElement('div');wrap.className='page-guide-wrap';
        // Any image positioned or resized so it extends past the trim edge (dragging already let
        // this happen; resizing was fixed to allow it too) needs to actually be visible out there —
        // .book-page clips everything at the trim line, so it used to just vanish at the edge
        // instead of reaching the bleed mark. This renders a backdrop copy of each such image in
        // this unclipped wrapper, using its own unmodified x/y/w/h (wrap shares the exact same
        // percentage basis as the page, so no rescaling is needed) — it sits behind the normal
        // page content and only shows through in the parts that overhang the trim edge.
        (page.images||[]).filter(im=>im._fullBleed||im.x<0||im.y<0||im.x+im.w>100||im.y+im.h>100).forEach(im=>{
          const bph=ed.photos.find(p=>p.id===im.photo); if(!bph)return;
          const bd=document.createElement('div');bd.className='bleed-extend';
          bd.style.cssText=`position:absolute;left:${im.x}%;top:${im.y}%;width:${im.w}%;height:${im.h}%;overflow:hidden`;
          const bimg=document.createElement('img');bimg.src=bph.url;
          const bfit=im.fit||'contain';
          let btf=`rotate(${im.rot||0}deg)`; if(bfit==='cover'&&(im.zoom||100)!==100)btf+=` scale(${(im.zoom/100).toFixed(2)})`;
          bimg.style.cssText=`width:100%;height:100%;object-fit:${bfit};object-position:${im.fx??50}% ${im.fy??50}%;transform:${btf};filter:${ed.imgFilter(im)}`;
          bd.appendChild(bimg);wrap.appendChild(bd);
        });
        const bleed=document.createElement('div');bleed.className='bleed-guide';
        bleed.style.cssText=`left:${-(bl/pw)*100}%;top:${-(bl/ph)*100}%;right:${-(bl/pw)*100}%;bottom:${-(bl/ph)*100}%`;
        wrap.appendChild(el);wrap.appendChild(bleed);
        return wrap;
      }
      return el;
    },

    renderStage(){
      const st=$(cfg.prefix+'-stage');st.innerHTML='';
      if(ed.cur==='coverspread'&&cfg.hasSpine){
        const wrap=document.createElement('div');wrap.className='spread wrap-cover';
        const back=ed.buildPage(ed.doc.backCover,'back');
        const spineEl=ed.buildPage(ed.doc.spine,'spine');
        const spineWidthPx=Math.max(18,ed.spineWidthIn()*180); // on-screen scale only, print math is separate
        spineEl.style.width=spineWidthPx+'px'; spineEl.style.aspectRatio='unset'; spineEl.style.height='auto'; spineEl.classList.add('spine-zone');
        const front=ed.buildPage(ed.doc.cover,'cover');
        const lbl=document.createElement('div');lbl.className='spine-label';lbl.textContent=ed.spineWidthIn()+'″';
        spineEl.appendChild(lbl);
        wrap.append(back,spineEl,front);
        st.appendChild(wrap);
        return;
      }
      const spread=document.createElement('div');spread.className='spread';
      if(ed.cur==='cover'||ed.cur==='back'){
        spread.classList.add('single');
        spread.appendChild(ed.buildPage(ed.cur==='cover'?ed.doc.cover:ed.doc.backCover,ed.cur));
      }else{
        const item=ed.interiorLayout()[ed.cur];
        if(!item){st.appendChild(spread);return}
        if(item.type==='single'){
          spread.classList.add('single');
          spread.appendChild(ed.buildPage(ed.doc.pages[item.idx],item.idx,null,null,true,true));
        }else{
          spread.appendChild(ed.buildPage(ed.doc.pages[item.l],item.l,null,null,true,true));
          spread.appendChild(ed.buildPage(ed.doc.pages[item.r],item.r,null,null,true,true));
        }
      }
      st.appendChild(spread);
    },
    miniBox(page){
      const b=document.createElement('div');b.className='box';b.style.background=page.bg;
      page.images.forEach(im=>{const ph=ed.photos.find(p=>p.id===im.photo);const i=document.createElement('i');
        i.style.cssText=`left:${im.x}%;top:${im.y}%;width:${im.w}%;height:${im.h}%;position:absolute`+(ph?`;background-image:url(${ph.url})`:'')+(cfg.monochrome?';filter:grayscale(100%)':'');
        b.appendChild(i)});
      return b;
    },
    renderStrip(){
      const s=$(cfg.prefix+'-strip');s.innerHTML='';
      if(cfg.hasSpine){
        const cov=document.createElement('div');cov.className='pg-th'+(ed.cur==='coverspread'?' on':'');
        const wrap=document.createElement('div');wrap.className='box wide';wrap.style.cssText='display:flex;gap:1px;width:52px;height:52px;border:none;background:none';
        const b1=ed.miniBox(ed.doc.backCover),sp=document.createElement('div'),b2=ed.miniBox(ed.doc.cover);
        sp.style.cssText='width:4px;height:100%;background:#EDEDED';
        b1.style.width=b2.style.width='24px';b1.style.height=b2.style.height='100%';
        wrap.append(b1,sp,b2);cov.appendChild(wrap);cov.insertAdjacentHTML('beforeend','<span>Cover · Spine · Back</span>');
        cov.onclick=()=>{ed.cur='coverspread';ed.sel=null;ed.tool='cover';document.querySelectorAll('#'+cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool==='cover'));ed.renderAll();};
        s.appendChild(cov);
      }else{
        const cov=document.createElement('div');cov.className='pg-th'+(ed.cur==='cover'?' on':'');cov.appendChild(ed.miniBox(ed.doc.cover));cov.insertAdjacentHTML('beforeend','<span>Cover</span>');
        cov.onclick=()=>ed.setCur('cover');s.appendChild(cov);
      }
      const layout=ed.interiorLayout();
      layout.forEach((item,i)=>{
        const th=document.createElement('div');th.className='pg-th'+(ed.cur===i?' on':'');
        if(item.type==='single'){
          const b=ed.miniBox(ed.doc.pages[item.idx]);b.style.width='50px';b.style.height='50px';
          th.appendChild(b);th.insertAdjacentHTML('beforeend',`<span>Page ${item.idx+1}</span>`);
        }else{
          const wrap=document.createElement('div');wrap.style.cssText='display:flex;gap:1px';
          const b1=ed.miniBox(ed.doc.pages[item.l]),b2=ed.miniBox(ed.doc.pages[item.r]);
          b1.style.width=b2.style.width='25px';b1.style.height=b2.style.height='50px';
          wrap.append(b1,b2);th.appendChild(wrap);th.insertAdjacentHTML('beforeend',`<span>Pages ${item.l+1}–${item.r+1}</span>`);
          th.draggable=true; th.title='Drag to reorder spreads';
          th.ondragstart=ev=>{ev.dataTransfer.setData('spread-i',String(i))};
          th.ondragover=ev=>{if(layout[i].type==='spread'){ev.preventDefault();th.classList.add('drag-over')}};
          th.ondragleave=()=>th.classList.remove('drag-over');
          th.ondrop=ev=>{ev.preventDefault();th.classList.remove('drag-over');
            const from=+ev.dataTransfer.getData('spread-i'); if(isNaN(from)||layout[from].type!=='spread')return;
            const a=layout[from],b2i=layout[i]; if(b2i.type!=='spread')return;
            ed.mutate(d=>{const pages=d.pages;
              const tmp=[pages[a.l],pages[a.r]]; pages[a.l]=pages[b2i.l];pages[a.r]=pages[b2i.r]; pages[b2i.l]=tmp[0];pages[b2i.r]=tmp[1];});
            ed.sel=null; ed.renderAll();};
        }
        th.onclick=()=>ed.setCur(i);s.appendChild(th);
      });
      if(!cfg.hasSpine){
        const back=document.createElement('div');back.className='pg-th'+(ed.cur==='back'?' on':'');back.appendChild(ed.miniBox(ed.doc.backCover));back.insertAdjacentHTML('beforeend','<span>Back</span>');
        back.onclick=()=>ed.setCur('back');s.appendChild(back);
      }
      const add=document.createElement('div');add.className='pg-add';
      add.innerHTML=`<button class="btn btn-ghost xs" onclick="EDS.${key}.addPages()">+ ${cfg.pageStep} pages</button>
        <button class="btn btn-ghost xs" onclick="EDS.${key}.removePages()">− ${cfg.pageStep} pages</button>
        <span style="font-size:10px;color:var(--slate-l);text-align:center">${ed.pageCount()} pages${cfg.hasSpine?' · spine '+ed.spineWidthIn()+'″':''}</span>`;
      s.appendChild(add);
    },
    renderAll(){ed.renderStage();ed.renderStrip();ed.renderPanel();ed.syncUndo();},
    renderPanel(){ /* set per-editor below */ },
  };
  if(cfg.coverDefaultText){
    ed.doc.cover.texts.push({id:uid(),html:'<p>'+esc(cfg.coverDefaultText)+'</p>',x:10,y:88,w:80,size:cfg.monochrome?11:20,unit:cfg.monochrome?'pt':'px',
      font:cfg.monochrome?FONT_CATS.trade[0]:'Caveat',weight:400,bold:false,italic:false,underline:false,align:'center',
      lineHeight:1.3,paraSpacing:8,color:cfg.monochrome?'#1D1D1F':'#1D1D1F',blackPct:cfg.monochrome?70:undefined});
  }
  EDS[key]=ed;
  return ed;
}
/* ---------- Generic panel renderer, shared by Photobook + Trade Book ---------- */
function shapeDragStart(e,shapeKey,isPlaceholder){e.dataTransfer.setData('shape',JSON.stringify({shapeKey,isPlaceholder}));e.dataTransfer.effectAllowed='copy';}
function shapeGridHTML(edKey,isPlaceholder){
  return `<div class="shape-grid">`+SHAPES.map(s=>
    `<button class="shape-btn" title="${esc(s.label)}" draggable="true" ondragstart="shapeDragStart(event,'${s.key}',${isPlaceholder})" onclick="EDS.${edKey}.addShape('${s.key}',${isPlaceholder})"><span style="clip-path:${s.clip};-webkit-clip-path:${s.clip}"></span></button>`
  ).join('')+`</div>`;
}
/* ---------- CMYK colour selector (print-native colour picking) ----------
   A reusable C/M/Y/K slider picker for any editor element: text, shapes,
   interior page backgrounds and covers. Values are stored on the element as
   both hex (for on-screen preview) and the raw CMYK percentages.
   Screen preview uses the standard naive conversion (no ICC profile), so
   on-press colour may differ slightly — the numbers you set are what count. */
function hex2cmyk(hex){
  const h=(hex||'#FFFFFF').replace('#','');const v=h.length===3?h.split('').map(x=>x+x).join(''):h;
  const r=parseInt(v.slice(0,2),16)/255,g=parseInt(v.slice(2,4),16)/255,b=parseInt(v.slice(4,6),16)/255;
  const k=1-Math.max(r,g,b);
  if(k>=0.999)return{c:0,m:0,y:0,k:100};
  return{c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)};
}
function cmyk2hex(c,m,y,k){
  c/=100;m/=100;y/=100;k/=100;
  const f=x=>Math.round(255*(1-x)*(1-k)).toString(16).padStart(2,'0').toUpperCase();
  return '#'+f(c)+f(m)+f(y);
}
function cssToHex(col){ /* normalise any CSS colour (hsla/rgba/hex/name) to #RRGGBB */
  if(!col)return '#FFFFFF';
  if(/^#[0-9a-f]{6}$/i.test(col))return col.toUpperCase();
  const ctx=cssToHex._ctx||(cssToHex._ctx=document.createElement('canvas').getContext('2d'));
  ctx.fillStyle='#000';ctx.fillStyle=col;const v=ctx.fillStyle;
  if(v.startsWith('#'))return v.toUpperCase();
  const m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
  return m?('#'+[m[1],m[2],m[3]].map(x=>(+x).toString(16).padStart(2,'0')).join('').toUpperCase()):'#FFFFFF';
}
function hexToRgba(hex,a){const h=hex.replace('#','');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;}
function defVal(o,k){const d={b:100,c:100,sat:100,op:100,temp:0,blur:0,shadow:0,zoom:100,fx:50,fy:50};return o[k]??(d[k]??0);}
function cmykSectionHTML(ed,kind,curColor,label){
  const hex=cssToHex(curColor);const {c,m,y,k}=hex2cmyk(hex);const px=ed.cfg.prefix;
  const chans=[['C','c',c],['M','m',m],['Y','y',y],['K','k',k]];
  return `<div class="rte-label">${label}</div><div class="cmyk-box">
    ${chans.map(([lab,ch,val])=>`<div class="cmyk-row ch-${ch}"><label>${lab}</label>
      <input type="range" min="0" max="100" value="${val}" id="${px}-cmyk-${kind}-${ch}"
        oninput="cmykLive('${ed.key}','${kind}')" onchange="cmykCommit('${ed.key}','${kind}')">
      <input type="number" min="0" max="100" value="${val}" id="${px}-cmyk-${kind}-${ch}-n"
        onchange="cmykNum('${ed.key}','${kind}','${ch}',this.value)"></div>`).join('')}
    <div class="cmyk-prev">
      <div class="sw" id="${px}-cmyk-${kind}-sw" style="background:${hex}"></div>
      <div class="vals"><b id="${px}-cmyk-${kind}-hex">${hex}</b><br><span id="${px}-cmyk-${kind}-txt">C${c} M${m} Y${y} K${k}</span></div>
      <button class="btn btn-ghost xs" style="margin-left:auto" title="Sample a colour from anywhere on screen — your photos included" onclick="cmykEyedrop('${ed.key}','${kind}')">⌖ Sample</button>
    </div>
  </div>`;
}
async function cmykEyedrop(edKey,kind){
  if(!window.EyeDropper)return toast('The eyedropper needs Chrome or Edge');
  try{
    const {sRGBHex}=await new EyeDropper().open();
    const ed=EDS[edKey];const {c,m,y,k}=hex2cmyk(cssToHex(sRGBHex));const px=ed.cfg.prefix;
    [['c',c],['m',m],['y',y],['k',k]].forEach(([ch,v])=>{const el=$(px+'-cmyk-'+kind+'-'+ch);if(el)el.value=v});
    cmykCommit(edKey,kind);toast('Sampled '+cssToHex(sRGBHex));
  }catch(e){/* user pressed Esc — nothing to do */}
}
function cmykRead(ed,kind){
  const px=ed.cfg.prefix,g=ch=>{const el=$(px+'-cmyk-'+kind+'-'+ch);return el?Math.max(0,Math.min(100,+el.value||0)):0};
  const c=g('c'),m=g('m'),y=g('y'),k=g('k');const hex=cmyk2hex(c,m,y,k);
  ['c','m','y','k'].forEach(ch=>{const n=$(px+'-cmyk-'+kind+'-'+ch+'-n');if(n)n.value=g(ch)});
  const sw=$(px+'-cmyk-'+kind+'-sw');if(sw)sw.style.background=hex;
  const hx=$(px+'-cmyk-'+kind+'-hex');if(hx)hx.textContent=hex;
  const tx=$(px+'-cmyk-'+kind+'-txt');if(tx)tx.textContent=`C${c} M${m} Y${y} K${k}`;
  return {c,m,y,k,hex};
}
function cmykNum(edKey,kind,ch,val){const ed=EDS[edKey];const el=$(ed.cfg.prefix+'-cmyk-'+kind+'-'+ch);
  if(el)el.value=Math.max(0,Math.min(100,+val||0));cmykCommit(edKey,kind);}
function cmykLive(edKey,kind){ /* live on-stage preview while dragging — no history spam */
  const ed=EDS[edKey];const {hex}=cmykRead(ed,kind);const px=ed.cfg.prefix;
  if(kind==='text'){const el=document.querySelector('#'+px+'-stage .tbox.sel .tbox-inner');if(el)el.style.color=hex;}
  else if(kind==='shape'){const sh=ed.curShape();
    const el=document.querySelector('#'+px+'-stage .shape-obj.sel .shape-mask');
    if(el&&sh&&!sh.photo)el.style.background=hexToRgba(hex,ed.alphaOf(sh.fill)/100);}
}
function cmykCommit(edKey,kind){
  const ed=EDS[edKey];const {c,m,y,k,hex}=cmykRead(ed,kind);const cmyk={c,m,y,k};
  if(kind==='text'){if(!ed.sel||ed.sel.kind!=='text')return;
    ed.mutate(()=>{const t=ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id);if(t){t.color=hex;t.cmyk=cmyk;}});ed.renderAll();}
  else if(kind==='shape'){const sh=ed.curShape();if(!sh)return;const a=ed.alphaOf(sh.fill)/100;
    ed.mutate(()=>{sh.fill=hexToRgba(hex,a);sh.cmyk=cmyk;});ed.renderAll();}
  else if(kind==='cover'){ed.setCoverBg(hex,cmyk);}
  else if(kind==='page'){const ref=ed.curPageRef();
    ed.mutate(()=>{const p=ed.pageRefObj(ref);p.bg=hex;p.bgCmyk=cmyk;});ed.renderAll();}
}

function genericRenderPanel(ed){
  const P=$(ed.cfg.prefix+'-panel'); const page=ed.curPage(); const pageRef=ed.curPageRef();
  if(ed.tool==='photos'){
    const used=ed.usedIds();
    const selIm=(!ed.cfg.hasAdjust&&ed.sel&&ed.sel.kind==='image')?ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id):null;
    P.innerHTML=`<h4>Your photos</h4>
      <div class="drop-up" id="${ed.cfg.prefix}-dropUp">Drop photos here or click to browse<br><b style="color:var(--slate)">${ed.cfg.monochrome?'PNG · JPEG · HEIC · TIFF — converted to monochrome automatically':'HEIC · JPEG · TIFF · PNG · WebP'}</b></div>
      <button class="btn btn-accent sm" style="width:100%;justify-content:center;margin-bottom:8px" onclick="EDS.${ed.key}.smartFill()">✦ Smart Layout — auto-arrange</button>
      <button class="btn btn-ghost sm" style="width:100%;justify-content:center;margin-bottom:8px" onclick="show('aiArrangeModal');window._aiArrangeTarget='${ed.key}'">✦ AI Arrange with instructions…</button>
      <div class="hint">Click a photo to arm it, then click or drop it anywhere on the page.</div>
      ${selIm?`<div class="rte-label">Selected photo</div>
        <div class="rte-row">
          <button onclick="EDS.${ed.key}.rotImg()">⟳ Rotate</button>
          <button onclick="EDS.${ed.key}.dupImg()">⧉ Duplicate</button>
        </div>
        <div class="rte-row">
          <button onclick="EDS.${ed.key}.layerImg('front')">To front</button>
          <button onclick="EDS.${ed.key}.layerImg('back')">To back</button>
        </div>
        <button class="btn btn-ghost xs" style="width:100%;justify-content:center;margin-bottom:12px" onclick="EDS.${ed.key}.removeImg()">Remove photo</button>`:''}
      <div class="photo-grid" id="${ed.cfg.prefix}-pGrid"></div>
      <div class="rte-label">This page's background</div>
      <div class="swatches">${(ed.cfg.monochrome?['#FFFFFF','#F1F1F0','#D5D5D3','#5C5C5A','#1D1D1F']:['#FFFFFF','#141414','#52B57D','#F1F1F0','#B0432E','#1B4332','#2A5C8A','#8A5A00','#5B2A86','#333333']).map(c=>`<div class="swatch ${(page&&page.bg)===c?'on':''}" style="background:${c}" onclick="EDS.${ed.key}.setPageBg('${c}')"></div>`).join('')}</div>
      ${ed.cfg.monochrome?'':cmykSectionHTML(ed,'page',(page&&page.bg)||'#FFFFFF','Exact ink colour — CMYK')}`;
    const dz=$(ed.cfg.prefix+'-dropUp');dz.onclick=()=>{window._uploadTarget=ed.key;$('fileInput').click()};
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');
    dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');ed.addFiles([...e.dataTransfer.files])};
    const g=$(ed.cfg.prefix+'-pGrid');

    // Sort bar
    if(ed.photos.length>1){
      const sortBar=document.createElement('div');
      sortBar.className='tray-sort-bar';
      sortBar.innerHTML=`<span style="font-size:11.5px;color:var(--slate-l)">Sort:</span>
        <button class="tray-sort-btn${(ed._traySort||'date')==='date'?'  active':''}" onclick="EDS.${ed.key}.sortTray('date')">Newest first</button>
        <button class="tray-sort-btn${ed._traySort==='name'?' active':''}" onclick="EDS.${ed.key}.sortTray('name')">A → Z</button>
        <button class="tray-sort-btn${ed._traySort==='oldest'?' active':''}" onclick="EDS.${ed.key}.sortTray('oldest')">Oldest first</button>`;
      g.parentElement.insertBefore(sortBar, g);
    }

    ed.photos.forEach(ph=>{const d=document.createElement('div');
      d.className='photo-th'+(used.has(ph.id)?' used':'')+(ed.armed===ph.id?' armed':'');
      d.style.backgroundImage=`url(${ph.url})`;if(ed.cfg.monochrome)d.style.filter='grayscale(100%)';
      d.title=ph.name+(ph.lowRes?' · low resolution — below 300 DPI at full size':'');d.draggable=true;
      if(ph.lowRes)d.insertAdjacentHTML('beforeend','<span style="position:absolute;bottom:4px;left:4px;background:#B0432E;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:900px">LOW DPI</span>');
      // Delete button
      const del=document.createElement('div');del.className='tray-del';del.title='Remove from tray';del.innerHTML='×';
      del.onclick=e=>{e.stopPropagation();if(!confirm('Remove "'+ph.name+'" from the tray?\n\nPhotos already placed on pages will stay in your design.'))return;
        const idx=ed.photos.findIndex(p=>p.id===ph.id);if(idx>-1)ed.photos.splice(idx,1);
        if(ed.armed===ph.id)ed.armed=null;ed.renderPanel();};
      d.appendChild(del);
      d.ondragstart=e=>e.dataTransfer.setData('photo',ph.id);
      d.onclick=()=>{ed.armed=ed.armed===ph.id?null:ph.id;ed.renderPanel();if(ed.armed)toast('Armed — click the page to place')};
      g.appendChild(d)});
    if(!ed.photos.length)g.innerHTML='<div class="hint" style="grid-column:1/-1">Your tray is empty.</div>';
  }
  else if(ed.tool==='shapes'){
    const sh=ed.curShape();
    const hue=sh?ed.hueOf(sh.fill):0;
    const density=sh?(100-ed.lightnessOf(sh.fill)):100;
    const alpha=sh?ed.alphaOf(sh.fill):50;
    P.innerHTML=`<h4>Shapes</h4>
      <div class="hint">Click a placeholder or shape below to drop it onto the page, then drag to move, use any of the 8 edge/corner handles to resize (hold Shift on a corner to keep its proportions), and drag a photo from the Photos tab onto a placeholder to fill it.</div>
      <div class="rte-label">Image placeholders</div>
      <div class="hint" style="margin-bottom:8px">Hold a photo, keep its shape.</div>
      ${shapeGridHTML(ed.key,true)}
      <div class="rte-label">Shapes</div>
      <div class="hint" style="margin-bottom:8px">${ed.cfg.monochrome?'Solid black shapes — adjust density and opacity.':'Solid decorative shapes — default 50% black, recolour freely.'}</div>
      ${shapeGridHTML(ed.key,false)}
      ${sh?`
      <div class="rte-label">Selected ${sh.isPlaceholder?'placeholder':'shape'}</div>
      <div class="rte-row">
        <button onclick="EDS.${ed.key}.rotShape()">⟳ Rotate</button>
        <button onclick="EDS.${ed.key}.dupShape()">⧉ Duplicate</button>
      </div>
      <div class="rte-row">
        <button onclick="EDS.${ed.key}.centerSelected('h')">↔ Center horiz.</button>
        <button onclick="EDS.${ed.key}.centerSelected('v')">↕ Center vert.</button>
      </div>
      ${sh.isPlaceholder?(sh.photo?`<button class="btn btn-ghost xs" style="width:100%;justify-content:center;margin:10px 0" onclick="EDS.${ed.key}.removeShapePhoto()">Remove photo</button>`:`<div class="hint" style="margin:10px 0">Empty — drag a photo from the Photos tab onto this shape to fill it.</div>`):''}
      ${ed.cfg.monochrome?`
      <div class="rte-label">Black density<span id="${ed.cfg.prefix}-shapeDensityVal" style="float:right;color:var(--text);font-weight:600;text-transform:none;letter-spacing:0">${density}%</span></div>
      <div class="hue-row">
        <div class="hue-swatch" id="${ed.cfg.prefix}-shapeDensitySwatch" style="background:hsl(0,0%,${100-density}%)"></div>
        <input type="range" class="density-slider" min="0" max="100" value="${density}" oninput="EDS.${ed.key}.setShapeDensity(this.value)">
      </div>
      <div class="hint" style="margin-top:-6px">0% = white · 100% = full black ink.</div>`:`
      <div class="rte-label">Colour</div>
      <div class="hue-row">
        <div class="hue-swatch" id="${ed.cfg.prefix}-shapeHueVal" style="background:hsl(${hue},72%,50%)"></div>
        <input type="range" class="hue-slider" min="0" max="360" value="${hue}" oninput="EDS.${ed.key}.setShapeHue(this.value)">
      </div>`}
      <div class="slider-row"><label>Opacity<span id="${ed.cfg.prefix}-shapeOpacityVal">${alpha}%</span></label><input type="range" min="10" max="100" value="${alpha}" oninput="EDS.${ed.key}.setShapeOpacity(this.value)"></div>
      <div class="slider-row"><label>Drop shadow<span id="${ed.cfg.prefix}-shapeShadowVal">${sh.shadow??0}</span></label><input type="range" min="0" max="30" value="${sh.shadow??0}" oninput="EDS.${ed.key}.setShapeShadow(this.value)" onchange="EDS.${ed.key}.autosave()"></div>
      ${ed.cfg.monochrome?'':cmykSectionHTML(ed,'shape',sh.fill,'Exact ink colour — CMYK')}
      <button class="btn btn-ghost xs" style="width:100%;justify-content:center;margin-bottom:8px" onclick="EDS.${ed.key}.resetShapeColor()">Reset to default ${ed.cfg.monochrome?'black':'colour'}</button>
      <button class="btn btn-ghost xs" style="width:100%;justify-content:center" onclick="EDS.${ed.key}.removeShape()">Remove ${sh.isPlaceholder?'placeholder':'shape'}</button>
      `:''}`;
  }
  else if(ed.tool==='adjust'){
    const im=(ed.sel&&ed.sel.kind==='image')?ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id):null;
    if(!im){P.innerHTML=`<h4>Adjust photo</h4><div class="hint">Select a photo to correct brightness, contrast${ed.cfg.monochrome?'':', saturation, temperature,'} blur, opacity and shadow — or apply a one-click look.</div>`;return}
    const ph=ed.photos.find(p=>p.id===im.photo);
    const sliders=ed.cfg.monochrome
      ?[['Brightness','b',50,150,'%'],['Contrast','c',50,150,'%'],['Blur','blur',0,8,'px'],['Opacity','op',10,100,'%'],['Drop shadow','shadow',0,30,'']]
      :[['Brightness','b',50,150,'%'],['Contrast','c',50,150,'%'],['Saturation','sat',0,200,'%'],['Temperature','temp',-100,100,''],['Blur','blur',0,8,'px'],['Opacity','op',10,100,'%'],['Drop shadow','shadow',0,30,'']];
    const presets=ed.cfg.monochrome
      ?[['Original','orig'],['Soft','matte'],['Punch','noir']]
      :[['Original','orig'],['Vivid','vivid'],['Warm','warm'],['Cool','cool'],['Matte','matte'],['Noir','noir'],['Fade','fade']];
    P.innerHTML=`<h4>Adjust photo</h4>
      ${ph&&ph.lowRes?'<div class="quality-warn">⚠ This photo is below 300 DPI for full-size print — consider a higher-resolution version.</div>':''}
      <div class="rte-label">Frame fit</div>
      <div class="align-row" style="margin-bottom:10px">
        <button class="${(im.fit||'contain')==='contain'?'on':''}" onclick="EDS.${ed.key}.setFit('contain')" title="Whole photo visible, no cropping">Fit whole photo</button>
        <button class="${im.fit==='cover'?'on':''}" onclick="EDS.${ed.key}.setFit('cover')" title="Photo fills the frame; crop by zooming and repositioning">Fill &amp; crop</button>
        <button class="${im._fullBleed?'on':''}" onclick="EDS.${ed.key}.setFullBleed()" title="Photo fills the entire page edge-to-edge — true full bleed">Full page</button>
      </div>
      ${im.fit==='cover'?`
      <div class="slider-row"><label>Zoom<span id="v_zoom">${defVal(im,'zoom')}%</span></label>
      <input type="range" min="100" max="300" value="${defVal(im,'zoom')}" oninput="EDS.${ed.key}.adjImg('zoom',this.value,'%')" onchange="EDS.${ed.key}.autosave()"></div>
      <div class="slider-row"><label>Pan horizontal<span id="v_fx">${defVal(im,'fx')}%</span></label>
      <input type="range" min="0" max="100" value="${defVal(im,'fx')}" oninput="EDS.${ed.key}.adjImg('fx',this.value,'%')" onchange="EDS.${ed.key}.autosave()"></div>
      <div class="slider-row"><label>Pan vertical<span id="v_fy">${defVal(im,'fy')}%</span></label>
      <input type="range" min="0" max="100" value="${defVal(im,'fy')}" oninput="EDS.${ed.key}.adjImg('fy',this.value,'%')" onchange="EDS.${ed.key}.autosave()"></div>
      <div class="hint" style="margin-bottom:10px">Zoom in, then drag the Pan sliders to choose which part of the photo shows through the frame.</div>`:''}
      <div class="rte-label">Looks — one-click presets</div>
      <div class="preset-row">${presets.map(([lab,key])=>`<button class="preset-chip" onclick="EDS.${ed.key}.applyPreset('${key}')">${lab}</button>`).join('')}</div>
      <div class="rte-label">Fine adjustments</div>
      ${sliders.map(([lab,kk,mn,mx,unit])=>`
      <div class="slider-row"><label>${lab}<span id="v_${kk}">${defVal(im,kk)}${unit}</span></label>
      <input type="range" min="${mn}" max="${mx}" value="${defVal(im,kk)}" oninput="EDS.${ed.key}.adjImg('${kk}',this.value,'${unit}')" onchange="EDS.${ed.key}.autosave()"></div>`).join('')}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.rotImg()">⟳ Rotate 90°</button>
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.resetImg()">Reset</button>
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.dupImg()">⧉ Duplicate</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.centerSelected('h')">↔ Center horiz.</button>
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.centerSelected('v')">↕ Center vert.</button>
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.centerSelected('both')">✛ Center on page</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.layerImg('front')">Bring to front</button>
        <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.layerImg('back')">Send to back</button>
      </div>
      <div style="margin-top:8px"><button class="btn btn-ghost xs" onclick="EDS.${ed.key}.removeImg()">Remove photo</button></div>`;
  }
  else if(ed.tool==='text'){
    const tt=(ed.sel&&ed.sel.kind==='text')?ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id):null;
    P.innerHTML=`<h4>Text</h4>
      <button class="btn btn-accent sm" style="width:100%;justify-content:center;margin-bottom:12px" onclick="EDS.${ed.key}.addText()">+ Add text to this page</button>
      ${tt?`<div class="hint">Click into the text to place your cursor, select a word or paragraph, then format it — just like Word or InDesign. A selection formats only that text (font, size, super/subscript included); no selection formats the whole box. Drag the box (outside the text) to move it; the × removes it.</div>

      <div class="rte-label">Character</div>
      <div class="rte-row">
        <button style="font-weight:800" onmousedown="event.preventDefault()" onclick="rteCmd('bold')">B</button>
        <button style="font-style:italic" onmousedown="event.preventDefault()" onclick="rteCmd('italic')">I</button>
        <button style="text-decoration:underline" onmousedown="event.preventDefault()" onclick="rteCmd('underline')">U</button>
        <button style="text-decoration:line-through" onmousedown="event.preventDefault()" onclick="rteCmd('strikeThrough')">S</button>
        <button title="Superscript" onmousedown="event.preventDefault()" onclick="rteCmd('superscript')">x²</button>
        <button title="Subscript" onmousedown="event.preventDefault()" onclick="rteCmd('subscript')">x₂</button>
      </div>

      <div class="rte-label">Paragraph alignment</div>
      <div class="rte-row">
        <button onmousedown="event.preventDefault()" onclick="rteCmd('justifyLeft')">⟵</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('justifyCenter')">↔</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('justifyRight')">⟶</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('justifyFull')">☰</button>
      </div>

      <div class="rte-label">Lists &amp; indent</div>
      <div class="rte-row">
        <button onmousedown="event.preventDefault()" onclick="rteCmd('insertUnorderedList')">• List</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('insertOrderedList')">1. List</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('outdent')">⇤</button>
        <button onmousedown="event.preventDefault()" onclick="rteCmd('indent')">⇥</button>
      </div>

      <div class="rte-label">Paragraph style</div>
      <div class="rte-row">
        <button onmousedown="event.preventDefault()" onclick="rteCmd('formatBlock','<p>')">Body</button>
        <button style="font-weight:800" onmousedown="event.preventDefault()" onclick="rteCmd('formatBlock','<h2>')">Heading</button>
        <button style="font-weight:700" onmousedown="event.preventDefault()" onclick="rteCmd('formatBlock','<h3>')">Subhead</button>
        <button style="font-style:italic" onmousedown="event.preventDefault()" onclick="rteCmd('formatBlock','<blockquote>')">Quote</button>
      </div>

      <div class="slider-row"><label>Line spacing<span id="${ed.cfg.prefix}-tVal-lineHeight">${(tt.lineHeight??1.3).toFixed(2)}</span></label><input type="range" min="1" max="2.2" step="0.05" value="${tt.lineHeight??1.3}" oninput="EDS.${ed.key}.tAdj('lineHeight',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="slider-row"><label>Paragraph spacing<span id="${ed.cfg.prefix}-tVal-paraSpacing">${tt.paraSpacing??8}px</span></label><input type="range" min="0" max="32" value="${tt.paraSpacing??8}" oninput="EDS.${ed.key}.tAdj('paraSpacing',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="slider-row"><label>First-line indent<span id="${ed.cfg.prefix}-tVal-indent">${(tt.indent??0)}em</span></label><input type="range" min="0" max="3" step="0.2" value="${tt.indent??0}" oninput="EDS.${ed.key}.tAdj('indent',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="slider-row"><label>Letter spacing<span id="${ed.cfg.prefix}-tVal-ls">${(tt.ls??0)}px</span></label><input type="range" min="-1" max="4" step="0.1" value="${tt.ls??0}" oninput="EDS.${ed.key}.tAdj('ls',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="slider-row"><label>Size<span id="${ed.cfg.prefix}-tVal-size">${tt.size}${tt.unit||'px'}</span></label><input type="range" min="${tt.unit==='pt'?4:10}" max="${tt.unit==='pt'?48:96}" step="${tt.unit==='pt'?0.5:1}" value="${tt.size}" oninput="EDS.${ed.key}.tAdj('size',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="slider-row"><label>Drop shadow<span id="${ed.cfg.prefix}-tVal-shadow">${tt.shadow??0}</span></label><input type="range" min="0" max="30" value="${tt.shadow??0}" oninput="EDS.${ed.key}.tAdj('shadow',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="rte-label">Text styles — save once, apply anywhere</div>
      <div class="preset-row">
        ${(ed.doc.textStyles||[]).map(st=>`<span class="preset-chip" onclick="EDS.${ed.key}.applyTextStyle('${st.id}')">${esc(st.name)}<b class="chip-x" onclick="event.stopPropagation();EDS.${ed.key}.deleteTextStyle('${st.id}')">×</b></span>`).join('')}
        <button class="preset-chip add" onclick="EDS.${ed.key}.saveTextStyle()">＋ Save current</button>
      </div>
      ${ed.cfg.monochrome?`<div class="rte-label">Black density<span id="${ed.cfg.prefix}-tVal-blackPct" style="float:right;color:var(--text);font-weight:600;text-transform:none;letter-spacing:0">${tt.blackPct??100}%</span></div>
      <div class="hue-row"><div class="hue-swatch" id="${ed.cfg.prefix}-tBlackSwatch" style="background:hsl(0,0%,${100-(tt.blackPct??100)}%)"></div><input type="range" class="density-slider" min="1" max="100" step="1" value="${tt.blackPct??100}" oninput="EDS.${ed.key}.tAdj('blackPct',+this.value)" onchange="EDS.${ed.key}.tAdjCommit()"></div>
      <div class="hint" style="margin-top:-6px;margin-bottom:10px">1% = faint grey · 100% = full black ink.</div>`
        :`<div class="slider-row"><label>Colour</label><div class="swatches">${['#141414','#FFFFFF','#52B57D','#5C5C5A','#B0432E'].map(c=>`<div class="swatch ${tt.color===c?'on':''}" style="background:${c}" onclick="EDS.${ed.key}.tAdj('color','${c}')"></div>`).join('')}</div></div>
      ${cmykSectionHTML(ed,'text',tt.color||'#141414','Exact ink colour — CMYK')}`}
      <div class="slider-row"><label>${ed.cfg.monochrome?'Typeface':'Google Font'}</label></div>
      ${ed.cfg.monochrome?'':`<div class="align-row" style="margin-bottom:8px">
        <button class="${ed._fontCat==='sans'?'on':''}" onclick="EDS.${ed.key}.setFontCat('sans')">Sans</button>
        <button class="${ed._fontCat==='serif'?'on':''}" onclick="EDS.${ed.key}.setFontCat('serif')">Serif</button>
        <button class="${ed._fontCat==='decorative'?'on':''}" onclick="EDS.${ed.key}.setFontCat('decorative')">Decorative</button>
      </div>`}
      <input class="font-search" id="${ed.cfg.prefix}-fontSearch" placeholder="Search fonts…" oninput="EDS.${ed.key}.renderFontList(this.value)">
      <div class="font-list" id="${ed.cfg.prefix}-fontList"></div>
      <div class="rte-row" style="margin-top:10px">
        <button onclick="EDS.${ed.key}.dupText()">⧉ Duplicate</button>
        <button onclick="EDS.${ed.key}.layerText('front')">To front</button>
        <button onclick="EDS.${ed.key}.layerText('back')">To back</button>
      </div>
      <button class="btn btn-ghost xs" onclick="EDS.${ed.key}.delText()">Delete text</button>`:
      '<div class="hint">Add text, then select it to format paragraphs, alignment, lists and fonts — Word-style.</div>'}`;
    if(tt)ed.renderFontList('');
  }
  else if(ed.tool==='layers'){
    const p=ed.pageRefObj(pageRef)||{};
    /* Render order on the page: images (bottom) → shapes → texts (top).
       The panel lists top-most first, like InDesign/Photoshop. */
    const entries=[];
    (p.texts||[]).slice().reverse().forEach(o=>entries.push({kind:'text',arr:'texts',o,icon:'T',label:(o.html||'').replace(/<[^>]+>/g,' ').trim().slice(0,26)||'(empty text)'}));
    (p.shapes||[]).slice().reverse().forEach(o=>{const ph=o.photo?ed.photos.find(x=>x.id===o.photo):null;
      entries.push({kind:'shape',arr:'shapes',o,icon:'⬠',label:(o.isPlaceholder?'Placeholder':'Shape')+(ph?' · '+ph.name.slice(0,16):'')});});
    (p.images||[]).slice().reverse().forEach(o=>{const ph=ed.photos.find(x=>x.id===o.photo);
      entries.push({kind:'image',arr:'images',o,icon:'▣',label:ph?ph.name.slice(0,24):'(photo)'});});
    const groups={texts:(p.texts||[]),shapes:(p.shapes||[]),images:(p.images||[])};
    const rowsHtml=entries.map(en=>{
      const idx=groups[en.arr].indexOf(en.o);
      const sel=ed.sel&&ed.sel.page===pageRef&&ed.sel.kind===en.kind&&ed.sel.id===en.o.id;
      const atTop=idx===groups[en.arr].length-1, atBot=idx===0;
      return `<div class="layer-row ${sel?'on':''} ${en.o.locked?'lk':''}" onclick="EDS.${ed.key}.selectLayer('${en.kind}','${en.o.id}')">
        <span class="layer-ic">${en.icon}</span>
        <span class="layer-lab">${esc(en.label)}</span>
        <button title="Move up" ${atTop?'disabled':''} onclick="event.stopPropagation();EDS.${ed.key}.moveLayer('${en.arr}','${en.o.id}',1)">▲</button>
        <button title="Move down" ${atBot?'disabled':''} onclick="event.stopPropagation();EDS.${ed.key}.moveLayer('${en.arr}','${en.o.id}',-1)">▼</button>
        <button title="${en.o.locked?'Unlock':'Lock'}" onclick="event.stopPropagation();EDS.${ed.key}.toggleLock('${en.arr}','${en.o.id}')">${en.o.locked?`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#52B57D" stroke-width="1.5"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#52B57D" stroke-width="1.5" stroke-linecap="round"/></svg>`:`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#52B57D" stroke-width="1.5"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0" stroke="#52B57D" stroke-width="1.5" stroke-linecap="round"/></svg>`}</button>
      </div>`;}).join('');
    P.innerHTML=`<h4>Layers</h4>
      <div class="hint">Everything on this page, top-most first — like InDesign's Layers panel. Click to select, ▲▼ to restack (within photos, shapes or text — text always sits above shapes, shapes above photos), 🔒 to lock an object so it can't be moved, edited or deleted by accident.</div>
      ${entries.length?rowsHtml:'<div class="hint">Nothing on this page yet.</div>'}`;
  }
  else if(ed.tool==='manuscript'){
    const m=ed.doc.msMeta;
    P.innerHTML=`<h4>Manuscript</h4>
      <div class="hint">Import your full text (paste or .txt / .md) and Binder auto-lays it out across the book block — chapters open on a right-hand page, scene breaks are honoured, and photos from your tray can be placed at chapter openings or as full-page plates.</div>
      <button class="btn btn-accent sm" style="width:100%;justify-content:center;margin-bottom:8px" onclick="openManuscriptModal()">✦ Import &amp; auto-layout…</button>
      ${m?`<div class="rte-label">Last layout</div>
      <div class="hint">${m.words.toLocaleString('en-IN')} words → pages ${m.from}–${m.to} · ${m.chapters} chapter${m.chapters===1?'':'s'}${m.images?` · ${m.images} image${m.images===1?'':'s'}`:''}.</div>
      <button class="btn btn-ghost sm" style="width:100%;justify-content:center;margin-bottom:8px" onclick="openManuscriptModal()">↻ Re-run layout…</button>`:''}
      <div class="hint">Afterwards, every page is a normal editable text box — switch to the <b>Text</b> tool to restyle paragraphs, indents, spacing and alignment, or drag images around. Undo (↺) reverts the whole layout in one step.</div>
      <div class="hint" style="color:var(--slate-l)">A print-ready proof PDF (300 DPI, 0.2″ bleed, trim marks) can be generated after ordering — see Admin → PDF Manager.</div>`;
  }
  else if(ed.tool==='cover'){
    if(ed.cfg.hasSpine){
      const coverTextBlack=ed._coverTextBlack??100;
      P.innerHTML=`<h4>Cover, spine &amp; back cover</h4>
        <div class="hint">One continuous wrap: back cover on the left, spine in the middle, front cover on the right — exactly how it prints and folds. Spine width is calculated from your page count.</div>
        <div class="align-row" style="margin-bottom:10px">
          <button class="${ed._coverZone==='back'?'on':''}" onclick="EDS.${ed.key}.setCoverZone('back')">Back</button>
          <button class="${ed._coverZone==='spine'?'on':''}" onclick="EDS.${ed.key}.setCoverZone('spine')">Spine</button>
          <button class="${ed._coverZone==='cover'?'on':''}" onclick="EDS.${ed.key}.setCoverZone('cover')">Front</button>
        </div>
        <div class="slider-row"><label>Spine width (from ${ed.pageCount()} pages)<span>${ed.spineWidthIn()}″</span></label></div>
        ${ed.cfg.monochrome?`
        <div class="rte-label">Cover text colour<span style="float:right;color:var(--text);font-weight:600;text-transform:none;letter-spacing:0" id="${ed.cfg.prefix}-coverBlackVal">${coverTextBlack}%</span></div>
        <div class="hue-row"><div class="hue-swatch" id="${ed.cfg.prefix}-coverBlackSwatch" style="background:hsl(0,0%,${100-coverTextBlack}%)"></div><input type="range" class="density-slider" min="1" max="100" step="1" value="${coverTextBlack}" oninput="EDS.${ed.key}.setCoverTextBlack(+this.value)"></div>
        <div class="hint" style="margin-top:-6px">1% = faint grey · 100% = full black. Applies to all text on the cover wrap.</div>`:`
        <div class="hint">Background colour for the <b>${ed._coverZone==='back'?'back cover':ed._coverZone==='spine'?'spine':'front cover'}</b>:</div>
        <div class="swatches">${['#FFFFFF','#141414','#52B57D','#F1F1F0','#B0432E','#1B4332','#2A5C8A','#8A5A00','#5B2A86','#333333'].map(c=>`<div class="swatch ${ed.pageRefObj(ed._coverZone).bg===c?'on':''}" style="background:${c}" onclick="EDS.${ed.key}.setCoverBg('${c}')"></div>`).join('')}</div>
        ${cmykSectionHTML(ed,'cover',ed.pageRefObj(ed._coverZone).bg,'Exact ink colour — CMYK')}`}`;
    }else{
      P.innerHTML=`<h4>Cover &amp; back cover</h4>
        <div class="hint">Pick a background colour for the cover and back cover.</div>
        <div class="align-row" style="margin-bottom:14px"><button class="${ed.cur==='cover'?'on':''}" onclick="EDS.${ed.key}.setCur('cover')">Cover</button><button class="${ed.cur==='back'?'on':''}" onclick="EDS.${ed.key}.setCur('back')">Back cover</button></div>
        <div class="swatches">${['#FFFFFF','#141414','#52B57D','#F1F1F0','#B0432E','#1B4332','#2A5C8A','#8A5A00','#5B2A86','#333333'].map(c=>`<div class="swatch ${page.bg===c?'on':''}" style="background:${c}" onclick="EDS.${ed.key}.setCoverBg('${c}')"></div>`).join('')}</div>
        ${ed.cfg.monochrome?'':cmykSectionHTML(ed,'cover',page.bg,'Exact ink colour — CMYK')}`;
    }
  }
}

/* ---------- wire generic methods onto each editor instance ---------- */
function wireEditorMethods(ed){
  ed.renderPanel=()=>genericRenderPanel(ed);
  ed.adjImg=(k,v,unit)=>{const im=ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id);if(!im)return;im[k]=+v;
    const lbl=$('v_'+k);if(lbl)lbl.textContent=v+(unit!==undefined?unit:'%');
    const d=document.querySelector('#'+ed.cfg.prefix+'-stage .img-obj.sel');if(!d)return;
    if(k==='op')d.style.opacity=(im.op??100)/100;
    else if(k==='shadow')d.style.boxShadow=im.shadow?`0 ${(im.shadow*0.35).toFixed(1)}px ${im.shadow}px rgba(0,0,0,.38)`:'none';
    else if(k==='zoom'||k==='fx'||k==='fy'){const el=d.querySelector('img');if(el&&im.fit==='cover'){
        el.style.objectPosition=`${im.fx??50}% ${im.fy??50}%`;
        let tf=`rotate(${im.rot||0}deg)`;if((im.zoom||100)!==100)tf+=` scale(${(im.zoom/100).toFixed(2)})`;
        el.style.transform=tf;}}
    else{const el=d.querySelector('img');if(el)el.style.filter=ed.imgFilter(im);}};
  ed.applyPreset=(key)=>{const P={
      orig:{b:100,c:100,sat:100,temp:0,blur:0},
      vivid:{b:104,c:118,sat:145,temp:0,blur:0},
      warm:{b:103,c:104,sat:110,temp:45,blur:0},
      cool:{b:102,c:106,sat:105,temp:-45,blur:0},
      matte:{b:108,c:82,sat:88,temp:8,blur:0},
      noir:{b:98,c:132,sat:0,temp:0,blur:0},
      fade:{b:112,c:88,sat:70,temp:12,blur:0}}[key];if(!P)return;
    ed.mutate(()=>{const im=ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id);if(im)Object.assign(im,P);});
    ed.renderAll();};
  ed.rotImg=()=>{ed.mutate(()=>{const im=ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id);im.rot=(im.rot+90)%360});ed.renderAll();};
  ed.resetImg=()=>{ed.mutate(()=>{Object.assign(ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id),{b:100,c:100,sat:100,rot:0,temp:0,blur:0,op:100,shadow:0,fit:'contain',zoom:100,fx:50,fy:50})});ed.renderAll();};
  ed.setFit=(mode)=>{ed.mutate(()=>{const im=ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id);if(!im)return;im.fit=mode==='bleed'?'cover':mode;im._fullBleed=false;if(mode==='cover'||mode==='bleed'){im.zoom=im.zoom||100;im.fx=im.fx??50;im.fy=im.fy??50;}});ed.renderAll();};
  ed.setFullBleed=()=>{ed.mutate(()=>{const im=ed.pageRefObj(ed.sel.page).images.find(o=>o.id===ed.sel.id);if(!im)return;im.fit='cover';im.x=0;im.y=0;im.w=100;im.h=100;im.zoom=100;im.fx=50;im.fy=50;im._fullBleed=true;});ed.renderAll();};
  // If a photo's edge is dragged or resized to (or very near) the trim line, it should actually
  // bleed off that edge rather than stop exactly at it — a hairline off in either direction during
  // trimming would otherwise leave a sliver of blank page showing. This grows just the touching
  // edge(s) out to the true bleed line, leaving the opposite edge(s) exactly where they were.
  ed.growEdgesToBleed=(im)=>{
    const bl=ed.cfg.bleedIn||0.2, pw=ed.cfg.pageInW, ph=ed.cfg.pageInH, thr=1.5;
    const bxPct=(bl/pw)*100, byPct=(bl/ph)*100;
    const origX=im.x, origY=im.y, origR=im.x+im.w, origB=im.y+im.h;
    let x=origX, y=origY, r=origR, b=origB;
    if(origX<=thr) x=-bxPct;
    if(origY<=thr) y=-byPct;
    if(100-origR<=thr) r=100+bxPct;
    if(100-origB<=thr) b=100+byPct;
    im.x=x; im.y=y; im.w=r-x; im.h=b-y;
  };
  ed.sortTray=(by)=>{ed._traySort=by;
    if(by==='name')ed.photos.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    else if(by==='oldest')ed.photos.sort((a,b)=>new Date(a.takenAt||0)-new Date(b.takenAt||0));
    else ed.photos.sort((a,b)=>new Date(b.takenAt||0)-new Date(a.takenAt||0)); // newest first (default)
    ed.renderPanel();};
  ed.removeImg=()=>{const o=ed._findSel();if(o&&o.locked)return toast('Locked — unlock it in the Layers panel first');
    ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).images;const i=arr.findIndex(o=>o.id===ed.sel.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll();};
  ed.dupImg=()=>{let newId;ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).images;const src=arr.find(o=>o.id===ed.sel.id);if(!src)return;
    const copy={...src,id:uid(),x:Math.min(100-src.w,src.x+4),y:Math.min(100-src.h,src.y+4)};arr.push(copy);newId=copy.id;});
    if(newId)ed.sel={page:ed.sel.page,kind:'image',id:newId};ed.renderAll();};
  ed.layerImg=(dir)=>{ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).images;const i=arr.findIndex(o=>o.id===ed.sel.id);if(i<0)return;
    const [o]=arr.splice(i,1); dir==='front'?arr.push(o):arr.unshift(o);});ed.renderAll();};
  ed.curShape=()=>{if(!ed.sel||ed.sel.kind!=='shape')return null;const p=ed.pageRefObj(ed.sel.page);return (p.shapes||[]).find(o=>o.id===ed.sel.id)||null;};
  ed.addShape=(shapeKey,isPlaceholder)=>{const pageRef=ed.curPageRef();ed.mutate(()=>{const p=ed.pageRefObj(pageRef);if(!p.shapes)p.shapes=[];
    const sh=mkShape(shapeKey,isPlaceholder,32,32,36,36);p.shapes.push(sh);ed.sel={page:pageRef,kind:'shape',id:sh.id};});ed.renderAll();};
  ed.removeShape=()=>{const o=ed._findSel();if(o&&o.locked)return toast('Locked — unlock it in the Layers panel first');
    ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).shapes||[];const i=arr.findIndex(o=>o.id===ed.sel.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll();};
  ed.dupShape=()=>{let newId;ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).shapes||[];const src=arr.find(o=>o.id===ed.sel.id);if(!src)return;
    const copy={...src,id:uid(),x:Math.min(100-src.w,src.x+4),y:Math.min(100-src.h,src.y+4)};arr.push(copy);newId=copy.id;});
    if(newId)ed.sel={page:ed.sel.page,kind:'shape',id:newId};ed.renderAll();};
  ed.hueOf=(fill)=>{const m=/hsla?\(([\d.]+)/.exec(fill||'');return m?+m[1]:0;};
  ed.lightnessOf=(fill)=>{const m=/hsla?\([\d.]+,\s*[\d.]+%,\s*([\d.]+)%/.exec(fill||'');return m?+m[1]:0;};
  ed.alphaOf=(fill)=>{const m=/,\s*([\d.]+)\s*\)$/.exec(fill||'');return m?Math.round(+m[1]*100):(/^hsl\(/.test(fill||'')?100:50);};
  ed.setShapeHue=(h)=>{const sh=ed.curShape();if(!sh)return;const a=ed.alphaOf(sh.fill)/100;
    sh.fill=`hsla(${h},72%,50%,${a})`;ed.autosave();
    const el=document.querySelector('#'+ed.cfg.prefix+'-stage .shape-obj.sel .shape-mask');if(el&&!sh.photo)el.style.background=sh.fill;
    const sw=$(ed.cfg.prefix+'-shapeHueVal');if(sw)sw.style.background=`hsl(${h},72%,50%)`;};
  ed.setShapeDensity=(pct)=>{const sh=ed.curShape();if(!sh)return;const a=ed.alphaOf(sh.fill)/100;const light=100-pct;
    sh.fill=`hsla(0,0%,${light}%,${a})`;ed.autosave();
    const el=document.querySelector('#'+ed.cfg.prefix+'-stage .shape-obj.sel .shape-mask');if(el&&!sh.photo)el.style.background=sh.fill;
    const sw=$(ed.cfg.prefix+'-shapeDensitySwatch');if(sw)sw.style.background=`hsl(0,0%,${light}%)`;
    const lbl=$(ed.cfg.prefix+'-shapeDensityVal');if(lbl)lbl.textContent=pct+'%';};
  ed.setShapeOpacity=(pct)=>{const sh=ed.curShape();if(!sh)return;const h=ed.hueOf(sh.fill);
    const isGrey=/hsla\(0,0%/.test(sh.fill);
    sh.fill=isGrey?`hsla(0,0%,${sh.isPlaceholder?85:0}%,${pct/100})`:`hsla(${h},72%,50%,${pct/100})`;
    ed.autosave();const el=document.querySelector('#'+ed.cfg.prefix+'-stage .shape-obj.sel .shape-mask');if(el&&!sh.photo)el.style.background=sh.fill;
    const lbl=$(ed.cfg.prefix+'-shapeOpacityVal');if(lbl)lbl.textContent=pct+'%';};
  ed.setShapeShadow=(v)=>{const sh=ed.curShape();if(!sh)return;sh.shadow=+v;
    const d=document.querySelector('#'+ed.cfg.prefix+'-stage .shape-obj.sel');
    if(d)d.style.filter=sh.shadow?`drop-shadow(0 ${(sh.shadow*0.35).toFixed(1)}px ${sh.shadow}px rgba(0,0,0,.35))`:'none';
    const lbl=$(ed.cfg.prefix+'-shapeShadowVal');if(lbl)lbl.textContent=v;};
  ed.resetShapeColor=()=>{const sh=ed.curShape();if(!sh)return;ed.mutate(()=>{sh.fill=sh.isPlaceholder?'hsla(0,0%,80%,0.8)':'hsla(0,0%,0%,0.5)'});ed.renderAll();};
  ed.rotShape=()=>{ed.mutate(()=>{const sh=ed.curShape();if(sh)sh.rot=(sh.rot+90)%360});ed.renderAll();};
  ed.removeShapePhoto=()=>{ed.mutate(()=>{const sh=ed.curShape();if(sh)sh.photo=null});ed.renderAll();};
  ed.addText=()=>{const page=ed.curPage();const pageRef=ed.curPageRef();
    let x=14,y=44,w=undefined;
    if(ed.cfg.marginIn&&ed.cfg.pageInW&&ed.cfg.pageInH&&pageRef!=='cover'&&pageRef!=='back'&&pageRef!=='spine'){
      const m=ed.cfg.marginIn,pw=ed.cfg.pageInW,ph=ed.cfg.pageInH;
      x=(m/pw)*100+2; y=(m/ph)*100+2; w=(1-2*m/pw)*100-4;
    }
    ed.mutate(()=>{ed.pageRefObj(pageRef).texts.push({id:uid(),html:'<p>Write something…</p>',x,y,w,size:22,unit:'px',
      font:ed.cfg.monochrome?FONT_CATS.trade[0]:'Inter',weight:400,bold:false,italic:false,underline:false,align:'left',
      lineHeight:1.3,paraSpacing:8,color:ed.cfg.monochrome?'#1D1D1F':contrastColor(page.bg),blackPct:ed.cfg.monochrome?100:undefined})});
    const arr=ed.pageRefObj(pageRef).texts; ed.sel={page:pageRef,kind:'text',id:arr[arr.length-1].id};
    ed.tool='text';document.querySelectorAll('#'+ed.cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool==='text'));
    ed.renderAll();};
  // Sliders in the Text panel (size, spacing, shadow, etc.) call this on every drag tick.
  // Patch the value + the live DOM directly rather than going through ed.renderAll() — a full
  // panel rebuild on every 'input' event destroys and recreates the very <input> the mouse is
  // still dragging, which is what made these controls look unresponsive. tAdjCommit() (wired to
  // the input's onchange) flashes the "Saved" indicator once the drag actually ends.
  const TEXT_LIVE_KEYS=new Set(['lineHeight','paraSpacing','indent','ls','size','shadow','blackPct']);
  ed.tAdj=(k,v)=>{
    if((k==='font'||k==='size')&&rteHasSelection()){
      const inner=rteActiveInner();
      const t=ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id);
      const styleStr=k==='font'?`font-family:'${v}',serif`:`font-size:${v}${t.unit||'px'}`;
      if(rteApplyCharStyle(styleStr)){
        if(k==='font')loadGoogleFont(v);
        ed.snap(); t.html=inner.innerHTML; ed.autosave();
        ed.renderPanel(); // keep the stage untouched so the live selection/cursor isn't lost
        return;
      }
    }
    const t=ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id); if(!t)return;
    if(TEXT_LIVE_KEYS.has(k)){
      t[k]=v;
      const inner=document.querySelector('#'+ed.cfg.prefix+'-stage .tbox.sel .tbox-inner');
      if(inner){
        if(k==='size')inner.style.fontSize=v+(t.unit||'px');
        else if(k==='lineHeight')inner.style.lineHeight=v;
        else if(k==='paraSpacing')inner.style.setProperty('--para-gap',v+'px');
        else if(k==='ls')inner.style.letterSpacing=v+'px';
        else if(k==='indent')inner.style.textIndent=v+'em';
        else if(k==='shadow')inner.style.textShadow=v?`0 ${(v*0.006).toFixed(3)}em ${(v*0.014).toFixed(3)}em rgba(0,0,0,.42)`:'none';
        else if(k==='blackPct')inner.style.color=`rgba(0,0,0,${v/100})`;
      }
      const lbl=$(ed.cfg.prefix+'-tVal-'+k);
      if(lbl)lbl.textContent=k==='lineHeight'?(+v).toFixed(2):k==='paraSpacing'?v+'px':k==='indent'?v+'em':k==='ls'?v+'px':k==='size'?v+(t.unit||'px'):k==='blackPct'?v+'%':v;
      if(k==='blackPct'){const sw=$(ed.cfg.prefix+'-tBlackSwatch');if(sw)sw.style.background=`hsl(0,0%,${100-v}%)`;}
      return;
    }
    ed.mutate(()=>{const t=ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id);t[k]=v;if(k==='color')t.cmyk=hex2cmyk(cssToHex(v));if(k==='font')loadGoogleFont(v);});
    ed.renderAll();
  };
  ed.tAdjCommit=()=>{ed.autosave();};
  ed.delText=()=>{const o=ed._findSel();if(o&&o.locked)return toast('Locked — unlock it in the Layers panel first');
    ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).texts;const i=arr.findIndex(o=>o.id===ed.sel.id);if(i>-1)arr.splice(i,1)});ed.sel=null;ed.renderAll();};
  ed.dupText=()=>{let newId;ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).texts;const src=arr.find(o=>o.id===ed.sel.id);if(!src)return;
    const copy={...src,id:uid(),x:Math.min(92,src.x+4),y:Math.min(94,src.y+4)};arr.push(copy);newId=copy.id;});
    if(newId)ed.sel={page:ed.sel.page,kind:'text',id:newId};ed.renderAll();};
  ed.layerText=(dir)=>{ed.mutate(()=>{const arr=ed.pageRefObj(ed.sel.page).texts;const i=arr.findIndex(o=>o.id===ed.sel.id);if(i<0)return;
    const [o]=arr.splice(i,1); dir==='front'?arr.push(o):arr.unshift(o);});ed.renderAll();};
  ed.selectLayer=(kind,id)=>{ed.sel={page:ed.curPageRef(),kind,id};ed.renderAll();};
  ed.moveLayer=(arrKey,id,dir)=>{ed.mutate(()=>{const arr=ed.pageRefObj(ed.curPageRef())[arrKey]||[];
    const i=arr.findIndex(o=>o.id===id);const j=i+dir;
    if(i<0||j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];});ed.renderAll();};
  ed.toggleLock=(arrKey,id)=>{ed.mutate(()=>{const o=(ed.pageRefObj(ed.curPageRef())[arrKey]||[]).find(x=>x.id===id);
    if(o)o.locked=!o.locked;});ed.renderAll();};
  ed._findSel=()=>{if(!ed.sel)return null;const p=ed.pageRefObj(ed.sel.page);
    const arr=ed.sel.kind==='image'?p.images:ed.sel.kind==='shape'?(p.shapes||[]):p.texts;
    return arr.find(x=>x.id===ed.sel.id)||null;};
  ed.deleteSelected=()=>{if(!ed.sel)return;const o=ed._findSel();if(o&&o.locked)return toast('Locked — unlock it in the Layers panel first');
    if(ed.sel.kind==='image')ed.removeImg();else if(ed.sel.kind==='shape')ed.removeShape();else ed.delText();};
  ed.nudgeSelected=(dx,dy)=>{if(!ed.sel)return;const sel=ed._findSel();if(sel&&sel.locked)return;
    ed.mutate(()=>{
    const arr=ed.sel.kind==='image'?ed.pageRefObj(ed.sel.page).images:ed.sel.kind==='shape'?(ed.pageRefObj(ed.sel.page).shapes||[]):ed.pageRefObj(ed.sel.page).texts;
    const o=arr.find(x=>x.id===ed.sel.id);if(!o)return; o.x=Math.max(0,o.x+dx); o.y=Math.max(0,o.y+dy);});ed.renderAll();};
  ed.centerSelected=(axis)=>{if(!ed.sel||(ed.sel.kind!=='image'&&ed.sel.kind!=='shape'))return;const sel=ed._findSel();if(!sel||sel.locked)return;
    ed.mutate(()=>{const o=ed._findSel();if(!o)return;
      if(axis==='h'||axis==='both')o.x=(100-o.w)/2;
      if(axis==='v'||axis==='both')o.y=(100-o.h)/2;});
    ed.renderAll();};
  ed.setCoverBg=(c,cmyk)=>{const zone=ed.cfg.hasSpine?ed._coverZone:(ed.cur==='back'?'back':'cover');ed.mutate(()=>{const p=ed.pageRefObj(zone);p.bg=c;p.bgCmyk=cmyk||hex2cmyk(cssToHex(c));});ed.renderAll();};
  ed.setCoverTextBlack=(pct)=>{ed._coverTextBlack=pct;
    const light=100-pct;
    ['cover','back','spine'].forEach(zone=>{const p=ed.pageRefObj(zone);if(p&&p.texts)p.texts.forEach(t=>{t.blackPct=pct;t.color=`rgba(0,0,0,${pct/100})`;});});
    ed.renderAll();
    const sw=$(ed.cfg.prefix+'-coverBlackSwatch');if(sw)sw.style.background=`hsl(0,0%,${light}%)`;
    const lbl=$(ed.cfg.prefix+'-coverBlackVal');if(lbl)lbl.textContent=pct+'%';};
  ed.setPageBg=(c,cmyk)=>{const ref=ed.curPageRef();ed.mutate(()=>{const p=ed.pageRefObj(ref);if(!p)return;p.bg=c;p.bgCmyk=cmyk||hex2cmyk(cssToHex(c));});ed.renderAll();};
  ed.setCoverZone=(z)=>{ed._coverZone=z;ed.renderPanel();};
  ed._fontCat='sans';
  /* InDesign-style saved text styles — stored on the document, so they travel
     with autosave and the order snapshot. */
  const STYLE_KEYS=['font','size','unit','color','cmyk','bold','italic','underline','align','lineHeight','paraSpacing','ls','indent','shadow','blackPct','weight'];
  ed.saveTextStyle=()=>{const t=(ed.sel&&ed.sel.kind==='text')?ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id):null;
    if(!t)return toast('Select a text box first');
    const name=(prompt('Style name (e.g. Chapter Head, Caption):')||'').trim();if(!name)return;
    const props={};STYLE_KEYS.forEach(k=>{if(t[k]!==undefined)props[k]=JSON.parse(JSON.stringify(t[k]))});
    ed.mutate(()=>{if(!ed.doc.textStyles)ed.doc.textStyles=[];
      const existing=ed.doc.textStyles.find(s=>s.name.toLowerCase()===name.toLowerCase());
      if(existing)existing.props=props; else ed.doc.textStyles.push({id:uid(),name,props});});
    ed.renderPanel();toast('Style "'+name+'" saved');};
  ed.applyTextStyle=(id)=>{const st=(ed.doc.textStyles||[]).find(s=>s.id===id);if(!st)return;
    if(!ed.sel||ed.sel.kind!=='text')return toast('Select a text box first');
    ed.mutate(()=>{const t=ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id);
      if(t)Object.keys(st.props).forEach(k=>{t[k]=JSON.parse(JSON.stringify(st.props[k]))});
      if(st.props.font)loadGoogleFont(st.props.font);});
    ed.renderAll();toast('Applied "'+st.name+'"');};
  ed.deleteTextStyle=(id)=>{ed.mutate(()=>{ed.doc.textStyles=(ed.doc.textStyles||[]).filter(s=>s.id!==id)});ed.renderPanel();};
  ed.setFontCat=(cat)=>{ed._fontCat=cat;ed.renderPanel();};
  ed.renderFontList=(q)=>{
    const wrap=$(ed.cfg.prefix+'-fontList');if(!wrap)return;
    const sel=(ed.sel&&ed.sel.kind==='text')?ed.pageRefObj(ed.sel.page).texts.find(o=>o.id===ed.sel.id):null;
    wrap.innerHTML='';
    const list=ed.cfg.monochrome?FONT_CATS.trade:(FONT_CATS[ed._fontCat]||FONT_CATS.sans);
    list.filter(f=>f.toLowerCase().includes((q||'').toLowerCase())).forEach(f=>{
      loadGoogleFont(f);const d=document.createElement('div');d.className='font-opt'+(sel&&sel.font===f?' on':'');
      d.style.fontFamily=`'${f}',serif`;d.textContent=f;d.onclick=()=>ed.tAdj('font',f);wrap.appendChild(d);});
  };
}

/* ---------- Instantiate Photobook + Trade Book ---------- */
createEditor('photobook',{prefix:'pb',defaultTitle:'Untitled Photobook',pageCssW:'min(38vw,420px)',aspect:'1/1',
  minPages:20,pageStep:4,monochrome:false,hasAdjust:true,minPrintPx:2625,hasShapes:true,
  pageInW:8.5,pageInH:8.5,marginIn:0.5,bleedIn:0.2});
createEditor('photobook12',{prefix:'pb12',defaultTitle:'Untitled Photobook (12×12)',pageCssW:'min(38vw,420px)',aspect:'1/1',
  minPages:20,pageStep:4,monochrome:false,hasAdjust:true,minPrintPx:3720,hasShapes:true,
  pageInW:12,pageInH:12,marginIn:0.5,bleedIn:0.2});
createEditor('photobook18',{prefix:'pb18',defaultTitle:'Untitled Photobook (12×18)',pageCssW:'min(calc(100vw - var(--stage-reserved)),56vh,420px)',aspect:'12/18',
  minPages:20,pageStep:4,monochrome:false,hasAdjust:true,minPrintPx:5400,hasShapes:true,hasOrientation:true,defaultOrientation:'landscape',
  pageInW:12,pageInH:18,marginIn:0.5,bleedIn:0.2});
createEditor('tradebook',{prefix:'tb',defaultTitle:'Untitled Trade Book',pageCssW:'min(calc(100vw - var(--stage-reserved)),58vh,460px)',aspect:'0.6875/1',
  minPages:100,pageStep:8,monochrome:true,hasAdjust:true,minPrintPx:1650,hasSpine:true,spineCaliperIn:0.0035,blockStartsRecto:true,hasManuscript:true,coverDefaultText:'',
  pageInW:5.5,pageInH:8,marginIn:0.5,bleedIn:0.2});
wireEditorMethods(EDS.photobook); wireEditorMethods(EDS.photobook12); wireEditorMethods(EDS.photobook18); wireEditorMethods(EDS.tradebook);
/* ---------- Editor open/close, file routing, AI Arrange ---------- */
let ACTIVE_EDITOR=null;
function openEditor(key,push){
  document.querySelector('.site-nav').style.display='none';
  if($('siteFooter'))$('siteFooter').style.display='none';
  applyEditorTheme();
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.ed-root').forEach(x=>x.classList.remove('active'));
  ACTIVE_EDITOR=key;
  if(push!==false)setPath('/editor/'+key);
  const robots=document.querySelector('meta[name="robots"]'); if(robots)robots.setAttribute('content','noindex, nofollow');
  if(key==='artprints'){$('editor-artprints').classList.add('active');$('ap-title').value=AP.title;updateArtPrintPrice('artprints');renderArtPrints();return}
  if(AP_SINGLE_VARIANTS[key]){
    const variant=AP_SINGLE_VARIANTS[key], st=AP_SINGLE[key];
    $('editor-'+key).classList.add('active');
    $(variant.prefix+'-title').value=st.title;
    updateArtPrintPrice(key);
    renderApSingle(key);
    return;
  }
  $('editor-'+key).classList.add('active');
  $(EDS[key].cfg.prefix+'-title').value=EDS[key].doc.title;
  const ed=EDS[key]; ed.cur=ed.cfg.hasSpine?'coverspread':'cover'; ed.sel=null;
  ed.tool=ed.cfg.hasSpine?'cover':'photos'; document.querySelectorAll('#'+ed.cfg.prefix+'-rail button').forEach(b=>b.classList.toggle('on',b.dataset.tool===ed.tool));
  // growEdgesToBleed only runs when a drag/resize interaction ends — an image placed before this
  // feature existed (or one nobody has touched since) would never get the fix just from opening
  // the editor. Run it once across every existing image so already-placed photos catch up too.
  if(ed.growEdgesToBleed){
    let grew=false;
    const allPages=[ed.doc.cover,ed.doc.backCover,ed.doc.spine,...(ed.doc.pages||[])].filter(Boolean);
    allPages.forEach(p=>(p.images||[]).forEach(im=>{
      const before=JSON.stringify(im); ed.growEdgesToBleed(im);
      if(JSON.stringify(im)!==before)grew=true;
    }));
    if(grew)ed.autosave();
  }
  if(ed.cfg.hasOrientation){
    ed.applyOrientation(ed.doc.orientation||ed.cfg.defaultOrientation||'portrait');
    const ob=$(ed.cfg.prefix+'-orientBtn');
    if(ob){const land=ed.doc.orientation==='landscape';ob.classList.toggle('on',land);ob.style.transform=land?'rotate(90deg)':'none';
      ob.title='Currently '+(land?'landscape':'portrait')+' — switch to '+(land?'portrait':'landscape');}
  }
  ed.renderAll();
  if(PRICING_RULES[key])updatePhotobookPrice(key); // price tag must reflect THIS editor's real base price the moment it opens, not just after a page is added/removed
}
function exitEditor(){
  if(ADMIN_EDIT_ORDER){ exitAdminEditor(false); return; }
  ACTIVE_EDITOR=null; go('home');
}

/* ---------- Server-side PDF render ---------- */
async function triggerServerRender(order){
  // Browser-based render — runs immediately on order placement
  toast('Rendering PDFs…');
  const keys = order.product==='artprints'?['artboard']:(order.product==='artprint12x18'||order.product==='artprint16x20')?['print']:['cover','interior'];
  for(const fk of keys){
    try{ await generatePdfForOrder(order.id, fk, null); }
    catch(e){ console.warn('Auto-render failed for',fk,e); }
  }
  toast('✅ PDFs ready — open PDF Manager to download');
}

async function checkRenderStatus(orderId){
  const {data}=await sb.from('orders').select('render_status,pdf_files,render_error').eq('id',orderId).single();
  return data;
}

async function pollRenderStatus(orderId, onUpdate){
  let attempts=0;
  const poll=async()=>{
    const data=await checkRenderStatus(orderId);
    if(!data)return;
    onUpdate(data);
    if(data.render_status==='done'||data.render_status==='failed'||attempts>60)return;
    attempts++;
    setTimeout(poll, 5000);
  };
  poll();
}
/* ---------- Editor light/dark theme ---------- */
function applyEditorTheme(){
  const dark=loadJSON('binder_ed_theme','light')==='dark';
  document.querySelectorAll('.ed-root').forEach(r=>r.classList.toggle('ed-dark',dark));
  document.querySelectorAll('.ed-theme-btn').forEach(b=>{b.innerHTML=dark?`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="3" stroke="#52B57D" stroke-width="1.7"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M11.5 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4" stroke="#52B57D" stroke-width="1.7" stroke-linecap="round"/></svg>`:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 9A6 6 0 0 1 7 2.5a5.5 5.5 0 1 0 6.5 6.5z" stroke="#52B57D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;b.title=dark?'Switch to light mode':'Switch to dark mode';});
}
function toggleEditorTheme(){
  const next=loadJSON('binder_ed_theme','light')==='dark'?'light':'dark';
  saveJSON('binder_ed_theme',next);
  applyEditorTheme();
}
// Fixes a real bug that predates this change: none of the editor title inputs (<input class="title">)
// were ever wired to anything — typing a custom title looked like it worked, but save/checkout
// always read the underlying state object's .title, which never got updated. One delegated
// listener here covers every editor (book editors via EDS, plus artprints/artprint12x18/16x20),
// rather than needing a near-identical handler wired into five different places.
document.addEventListener('input',e=>{
  if(!e.target.classList||!e.target.classList.contains('title')||!ACTIVE_EDITOR)return;
  const val=e.target.value;
  if(ACTIVE_EDITOR==='artprints')AP.title=val;
  else if(AP_SINGLE_VARIANTS[ACTIVE_EDITOR])AP_SINGLE[ACTIVE_EDITOR].title=val;
  else if(EDS[ACTIVE_EDITOR])EDS[ACTIVE_EDITOR].doc.title=val;
});
document.addEventListener('keydown',e=>{
  if(!ACTIVE_EDITOR||ACTIVE_EDITOR==='artprints')return;
  const ed=EDS[ACTIVE_EDITOR]; if(!ed||!ed.sel)return;
  const tgt=document.activeElement;
  const typing=tgt&&(tgt.isContentEditable||/input|textarea/i.test(tgt.tagName));
  if(typing)return; // never hijack typing inside a text box or a form field
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();ed.deleteSelected();return}
  const step=e.shiftKey?2:0.4;
  if(e.key==='ArrowLeft'){e.preventDefault();ed.nudgeSelected(-step,0)}
  else if(e.key==='ArrowRight'){e.preventDefault();ed.nudgeSelected(step,0)}
  else if(e.key==='ArrowUp'){e.preventDefault();ed.nudgeSelected(0,-step)}
  else if(e.key==='ArrowDown'){e.preventDefault();ed.nudgeSelected(0,step)}
});
$('fileInput').addEventListener('change',e=>{
  const files=[...e.target.files]; e.target.value='';
  const t=window._uploadTarget;
  if(t==='artprints'){ingestFiles(files,1200).then(added=>{AP.photos.push(...added);renderApPhotoGrid()});return}
  if(AP_SINGLE_VARIANTS[t]){const st=AP_SINGLE[t];ingestFiles(files,1200).then(added=>{st.photos.push(...added);renderApSinglePhotoGrid(t)});return}
  if(t&&EDS[t])EDS[t].addFiles(files);
});
async function runAiArrange(){
  const key=window._aiArrangeTarget; const ed=EDS[key]; if(!ed)return;
  const used=ed.usedIds(); const pool=ed.photos.filter(p=>!used.has(p.id));
  if(!pool.length){toast('Add photos first.');return}
  const prompt=($('aiArrangePrompt').value||'').trim();
  const btn=$('aiArrangeBtn'); btn.disabled=true; btn.textContent='Arranging…';
  try{
    const list=pool.map((p,i)=>`${i}: ${p.name}${p.w>=p.h?' (landscape)':' (portrait)'}`).join('\n');
    const empties=ed.doc.pages.filter(pg=>!pg.images.length).length;
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1200,messages:[{role:'user',content:
      `You are arranging photos into a ${key==='tradebook'?'monochrome novel-style trade book':'photobook'} titled "${ed.doc.title}". ${empties} empty pages available.
Photos:\n${list}\nInstructions: ${prompt||'(none — use best editorial judgement)'}
Group indexes into ordered page-groups of 1-4, each optionally with a short caption or null.
Respond ONLY with JSON: {"groups":[{"indexes":[0,1],"caption":"short caption or null"}]}`}]})});
    const d=await r.json();
    const txt=(d.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('').replace(/```json|```/g,'').trim();
    const parsed=JSON.parse(txt);
    applyArrangePlan(ed,parsed.groups,pool);
    toast('AI arranged your photos and captions ✦');
  }catch(e){ed.smartFill();toast('AI arrange needs a live connection — used Smart Layout instead.');}
  btn.disabled=false;btn.textContent='✦ Arrange with AI';hide('aiArrangeModal');
}
// Shared by Smart Layout, AI Arrange, and the Trade Book manuscript layout — grows d.pages (in
// cfg.pageStep batches, same blank-page shape used by the "Add pages" button) until there are at
// least targetEmpty empty pages, or cfg.maxPages is hit, whichever comes first. Must be called
// from inside ed.mutate() since it writes directly onto the passed-in doc. A book that starts at
// cfg.minPages should never be the reason auto-layout leaves photos stranded in the tray.
function growPagesForAutoLayout(d,cfg,targetEmpty){
  let empty=d.pages.filter(pg=>!pg.images.length).length;
  while(empty<targetEmpty){
    if(cfg.maxPages&&d.pages.length>=cfg.maxPages)return true; // hit the ceiling
    const room=cfg.maxPages?Math.min(cfg.pageStep,cfg.maxPages-d.pages.length):cfg.pageStep;
    for(let i=0;i<room;i++)d.pages.push({bg:'#FFFFFF',images:[],texts:[]});
    empty+=room;
  }
  return false;
}
function applyArrangePlan(ed,groups,pool){
  if(!Array.isArray(groups)||!groups.length)return ed.smartFill();
  let overflowGroups=0;
  ed.mutate(d=>{
    // Grow the book first — a fresh photobook starts at cfg.minPages, which is rarely enough
    // empty pages to hold everything the AI wants to place, so we top up (in cfg.pageStep
    // batches, same shape as the "Add pages" button) up to cfg.maxPages before laying anything
    // out, instead of silently dropping whichever groups don't fit on today's page count.
    growPagesForAutoLayout(d,ed.cfg,groups.length);
    const empties=d.pages.filter(pg=>!pg.images.length); let pi=0;
    const ARR={1:[[10,10,80,80]],2:[[4,10,44,80],[52,10,44,80]],3:[[4,4,92,56],[4,62,44,34],[52,62,44,34]],4:[[4,4,44,44],[52,4,44,44],[4,52,44,44],[52,52,44,44]]};
    groups.forEach(g=>{
      if(pi>=empties.length){overflowGroups++;return}
      const pg=empties[pi++];
      const idxs=(g.indexes||[]).filter(i=>pool[i]); if(!idxs.length)return;
      (ARR[idxs.length]||ARR[1]).forEach(([x,y,w,h],j)=>{if(idxs[j]!==undefined){const ph=pool[idxs[j]];const fb=ed.fitBox(ph,x,y,w,h);pg.images.push({id:uid(),photo:ph.id,x:fb.x,y:fb.y,w:fb.w,h:fb.h,rot:0,b:100,c:100,sat:100});}});
      if(g.caption)pg.texts.push({id:uid(),html:'<p>'+esc(g.caption)+'</p>',x:6,y:88,size:20,unit:'px',font:ed.cfg.monochrome?FONT_CATS.trade[0]:'Caveat',weight:400,bold:false,italic:false,underline:false,align:'left',lineHeight:1.3,paraSpacing:8,color:ed.cfg.monochrome?'#1D1D1F':'#1D1D1F',blackPct:ed.cfg.monochrome?100:undefined});
    });
  });
  ed.renderAll();
  if(PRICING_RULES[ed.key])updatePhotobookPrice(ed.key);
  if(overflowGroups>0)toast(`Arranged what fits — added pages up to the ${ed.cfg.maxPages}-page maximum, but ${overflowGroups} group${overflowGroups===1?'':'s'} of photos still need${overflowGroups===1?'s':''} a spot. Remove a few pages' worth, or split into a second book.`);
}

/* ================= TRADE BOOK — Manuscript import & AI auto-layout =================
   Deterministic pagination core (works offline) + optional AI pass that classifies
   ambiguous chapter headings. One text box per page (spanning the 5×7″ safe area),
   so every laid-out page remains fully editable with the ordinary Text tool.       */
const MS={fileName:''};

function openManuscriptModal(){
  const sel=$('msFont');
  if(sel&&!sel.options.length){sel.innerHTML=FONT_CATS.trade.map(f=>`<option>${esc(f)}</option>`).join('');
    if([...sel.options].some(o=>o.value==='EB Garamond'))sel.value='EB Garamond';}
  msSyncCount(); show('msModal');
}
function msSyncCount(){
  const t=($('msText').value||'').trim();
  const words=t?t.split(/\s+/).length:0;
  $('msCount').textContent=words.toLocaleString('en-IN')+' word'+(words===1?'':'s')+(MS.fileName?' · '+MS.fileName:'');
}
async function msReadTextFile(f){
  if(!f)return;
  const name=f.name.toLowerCase();
  if(/\.docx$/.test(name)||f.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
    $('msFileName').textContent='Reading '+f.name+'…';
    try{
      if(!window.mammoth)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
      const buf=await f.arrayBuffer();
      const {value:html}=await mammoth.convertToHtml({arrayBuffer:buf},{styleMap:[
        "p[style-name='Heading 1'] => h1.ms-h:fresh","p[style-name='Heading 2'] => h1.ms-h:fresh",
        "p[style-name='Title'] => h1.ms-h:fresh"]});
      const div=document.createElement('div');div.innerHTML=html;
      const lines=[];
      div.childNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        const t=(n.textContent||'').trim(); if(!t)return;
        if(n.tagName==='H1'||/^h[1-3]$/i.test(n.tagName))lines.push('# '+t); else lines.push(t);
      });
      $('msText').value=lines.join('\n\n');
      MS.fileName=f.name; $('msFileName').textContent=f.name; msSyncCount();
      toast('Word document loaded — review the options, then lay it out.');
    }catch(e){console.error(e);toast("Couldn't read "+f.name+' — try saving it as .txt / .md instead.');$('msFileName').textContent='No file yet — pasting works too';}
    return;
  }
  if(!/\.(txt|md|markdown|text)$/i.test(name)&&!/^text\//.test(f.type))return toast('Use a .txt, .md, or .docx file.');
  const r=new FileReader();
  r.onload=()=>{$('msText').value=String(r.result||'');MS.fileName=f.name;$('msFileName').textContent=f.name;msSyncCount();toast('Manuscript loaded — review the options, then lay it out.')};
  r.onerror=()=>toast("Couldn't read "+f.name);
  r.readAsText(f);
}

/* ---------- 1. Parse raw text into blocks: para | heading | break ---------- */
function msParseBlocks(text){
  const chunks=text.replace(/\r\n/g,'\n').split(/\n{2,}/).map(s=>s.trim()).filter(Boolean);
  const blocks=[];
  const BREAK=/^(\*{3,}|(\*\s*){3,}|-{3,}|_{3,}|~{3,}|(—\s*){2,}—?|#\s*#\s*#)$/;
  const HEADWORD=/^(chapter|part|book|prologue|epilogue|interlude|preface|foreword|afterword|dedication|acknowledg\w*|contents|appendix)\b/i;
  const NUMONLY=/^(\d{1,3}|[IVXLCDM]{1,7})\.?$/i;
  chunks.forEach(ch=>{
    const lines=ch.split('\n').map(s=>s.trim()).filter(Boolean);
    if(lines.length===1){
      const l=lines[0];
      if(BREAK.test(l)){blocks.push({type:'break'});return}
      if(/^#{1,3}\s+/.test(l)){blocks.push({type:'heading',text:l.replace(/^#{1,3}\s+/,'')});return}
      if(l.length<=64&&(HEADWORD.test(l)||NUMONLY.test(l))){blocks.push({type:'heading',text:l});return}
      const letters=l.replace(/[^A-Za-z]/g,'');
      if(l.length<=48&&letters.length>=3&&letters===letters.toUpperCase()){blocks.push({type:'heading',text:l});return}
      blocks.push({type:'para',text:l});
    }else if(/^#{1,3}\s+/.test(lines[0])){
      blocks.push({type:'heading',text:lines[0].replace(/^#{1,3}\s+/,'')});
      blocks.push({type:'para',text:lines.slice(1).join(' ')});
    }else blocks.push({type:'para',text:lines.join(' ')});
  });
  return blocks;
}

/* ---------- 2. Optional AI pass: classify ambiguous short lines as headings ---------- */
async function msSmartHeadings(blocks){
  const cand=[];
  blocks.forEach((b,i)=>{if(b.type!=='break'&&b.text&&b.text.length<=90&&cand.length<250)cand.push({i,t:b.text})});
  if(!cand.length)return;
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,messages:[{role:'user',content:
`Below are short lines from a book manuscript with their block indexes. Decide which are chapter/part/section HEADINGS (titles that should open a new chapter page) versus ordinary body sentences or scene-break marks.
${cand.map(c=>c.i+': '+c.t).join('\n')}
Respond ONLY with JSON, no prose: {"headings":[indexes]}`}]})});
  const d=await r.json();
  const txt=(d.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('').replace(/```json|```/g,'').trim();
  const set=new Set((JSON.parse(txt).headings||[]).map(Number));
  cand.forEach(c=>{
    if(set.has(c.i))blocks[c.i].type='heading';
    else if(blocks[c.i].type==='heading')blocks[c.i].type='para'; // AI demoted a heuristic guess
  });
}

/* ---------- 3. Measurement probe: mirrors .tbox-inner rendering exactly ---------- */
function msProbe(ed,opts,safeWpct){
  const live=document.querySelector('#'+ed.cfg.prefix+'-stage .book-page:not(.spine-zone)');
  const pageW=(live&&live.offsetWidth>60)?live.offsetWidth:Math.min(window.innerWidth*0.26,300);
  const pageH=pageW/(ed.cfg.pageInW/ed.cfg.pageInH);
  const box=document.createElement('div');box.className='tbox-inner';
  box.style.cssText=`position:absolute;left:-9999px;top:0;width:${pageW*safeWpct/100}px;visibility:hidden;`+
    `font-size:${opts.size}pt;font-family:'${opts.font}',serif;line-height:${opts.lh};--para-gap:${opts.paraGap}px;`+
    `text-align:${opts.justify?'justify':'left'};text-indent:${opts.indent}em`;
  document.body.appendChild(box);
  return{pageH,
    h(html){box.innerHTML=html;return box.offsetHeight},
    px(pct){return pct/100*pageH},
    kill(){box.remove()}};
}

/* ---------- 4. Deterministic paginator ---------- */
function msPaginate(ed,blocks,opts){
  const cfg=ed.cfg,m=cfg.marginIn||0.5;
  const sa={w:cfg.pageInW-2*m,h:cfg.pageInH-2*m}; // safe area in inches — used below for chapter/plate image sizing
  const safeL=(m/cfg.pageInW)*100, safeW=(1-2*m/cfg.pageInW)*100;
  const safeT=(m/cfg.pageInH)*100, safeH=(1-2*m/cfg.pageInH)*100;
  const pr=msProbe(ed,opts,safeW);
  const gapPx=opts.paraGap;
  const DROP=13; // chapter title drop, % of page height
  const pool=(opts.imgMode!=='none')?ed.photos.filter(p=>!ed.usedIds().has(p.id)):[];
  const pages=[]; let chapters=0, imagesUsed=0, sincePlate=0;
  const absIdx=()=>opts.start+pages.length;             // recto ⇔ absolute index even (block starts recto)
  let cur=null,curHpx=0,budgetPx=0;

  const renderB=b=>b.type==='heading'?`<h2 style="text-align:center">${esc(b.text)}</h2>`
    :b.type==='break'?'<p class="ms-break">*&nbsp;&nbsp;*&nbsp;&nbsp;*</p>'
    :`<p>${esc(b.text)}</p>`;

  const closePage=()=>{if(!cur)return; if(cur.html.length||cur.image)sincePlate++; pages.push(cur); cur=null;};
  const openPage=(o)=>{o=o||{};
    let y=safeT+(o.drop?DROP:0), budget=safeH-(o.drop?DROP:0), image=null;
    if(o.chapterImage&&pool.length){
      const ph=pool.shift();imagesUsed++;
      const wIn=sa.w; let hIn=Math.min(wIn*(ph.h/ph.w),cfg.pageInH*0.34);
      const hPct=(hIn/cfg.pageInH)*100;
      image={photo:ph.id,x:safeL,y,w:safeW,h:hPct};
      y+=hPct+2.5; budget-=hPct+2.5;
    }
    cur={y,html:[],image}; curHpx=0; budgetPx=pr.px(budget);};
  const platePage=()=>{ // full-page image plate, centred in the safe area
    const ph=pool.shift(); if(!ph)return; imagesUsed++;
    let wIn=sa.w,hIn=wIn*(ph.h/ph.w); if(hIn>sa.h){hIn=sa.h;wIn=hIn*(ph.w/ph.h);}
    const wPct=(wIn/cfg.pageInW)*100,hPct=(hIn/cfg.pageInH)*100;
    pages.push({y:safeT,html:[],image:{photo:ph.id,x:50-wPct/2,y:50-hPct/2,w:wPct,h:hPct}});
    sincePlate=0;};
  const maybePlate=()=>{if(opts.imgMode==='interval'&&pool.length&&sincePlate>=opts.imgN)platePage();};
  const push=(html,h)=>{const g=cur.html.length?gapPx:0;cur.html.push(html);curHpx+=g+h;};
  const fits=h=>curHpx+(cur.html.length?gapPx:0)+h<=budgetPx;

  for(const b of blocks){
    if(b.type==='heading'){
      chapters++; closePage(); maybePlate();
      if(absIdx()%2!==0)pages.push({blank:true});      // force chapter onto a recto
      openPage({drop:true,chapterImage:opts.imgMode==='chapters'});
      const html=renderB(b); push(html,pr.h(html));
      continue;
    }
    if(!cur)openPage();
    const html=renderB(b), h=pr.h(html);
    if(fits(h)){push(html,h);continue}
    if(b.type!=='para'){closePage();maybePlate();openPage();push(html,h);continue}
    /* Paragraph longer than the space left — split at word boundaries (binary search on measured height) */
    let words=b.text.split(/\s+/);
    while(words.length){
      const gap=cur.html.length?gapPx:0;
      const remain=budgetPx-curHpx-gap;
      let fitN=0;
      if(remain>pr.px(5)){ // only bother if ≥ ~5% of the page remains
        let lo=1,hi=words.length;
        while(lo<=hi){const mid=(lo+hi)>>1;
          if(pr.h(`<p>${esc(words.slice(0,mid).join(' '))}</p>`)<=remain){fitN=mid;lo=mid+1}else hi=mid-1;}
        if(fitN===words.length){push(`<p>${esc(words.join(' '))}</p>`,pr.h(`<p>${esc(words.join(' '))}</p>`));words=[];break}
        if(fitN<12)fitN=0; // avoid stranding a tiny orphan chunk
      }
      if(fitN>0){const part=words.slice(0,fitN).join(' ');push(`<p>${esc(part)}</p>`,pr.h(`<p>${esc(part)}</p>`));words=words.slice(fitN);}
      closePage(); maybePlate(); openPage();
    }
  }
  closePage(); pr.kill();
  return{pages,chapters,images:imagesUsed,safe:{safeL,safeW,safeT}};
}

/* ---------- 5. Apply the plan onto real pages (one undo step) ---------- */
function msApply(ed,plan,opts,words){
  const need=opts.start+plan.pages.length;
  const cap=ed.cfg.maxPages||need;
  // Never refuse outright — a manuscript that runs past the page maximum still gets laid out as
  // far as it fits, with a clear count of what's left over and how to continue it (re-run with a
  // later start page), instead of blocking the whole import over pages that are still fine.
  const overflowPages=need>cap?need-cap:0;
  const usedPages=overflowPages?plan.pages.slice(0,plan.pages.length-overflowPages):plan.pages;
  const finalNeed=opts.start+usedPages.length;
  const touched=ed.doc.pages.slice(opts.start,finalNeed);
  if(touched.some(p=>p.images.length||p.texts.length)&&
     !confirm(`Pages ${opts.start+1}–${finalNeed} already contain content and will be replaced by the manuscript layout (one Undo step reverts it). Continue?`))return false;
  ed.mutate(d=>{
    while(d.pages.length<finalNeed)for(let i=0;i<ed.cfg.pageStep;i++)d.pages.push({bg:'#FFFFFF',images:[],texts:[]});
    usedPages.forEach((pg,i)=>{
      const P=d.pages[opts.start+i]; P.images=[];P.texts=[];P.bg='#FFFFFF';
      if(pg.blank)return;
      if(pg.image)P.images.push({id:uid(),photo:pg.image.photo,x:pg.image.x,y:pg.image.y,w:pg.image.w,h:pg.image.h,rot:0,b:100,c:100,sat:100});
      if(pg.html&&pg.html.length)P.texts.push({id:uid(),html:pg.html.join(''),x:plan.safe.safeL,y:pg.y,w:plan.safe.safeW,
        size:opts.size,unit:'pt',font:opts.font,weight:400,bold:false,italic:false,underline:false,
        align:opts.justify?'justify':'left',lineHeight:opts.lh,paraSpacing:opts.paraGap,
        indent:opts.indent,ls:0,color:'#1D1D1F',blackPct:100});
    });
    d.msMeta={words,from:opts.start+1,to:finalNeed,chapters:plan.chapters,images:plan.images,date:new Date().toISOString()};
  });
  ed.cur=opts.start===0?0:Math.floor((opts.start-1)/2)+1; // jump the stage to the first laid-out page
  ed.sel=null; ed.renderAll();
  if(overflowPages>0)toast(`Laid out ${usedPages.length} pages up to the ${cap}-page maximum — about ${overflowPages} more page${overflowPages===1?'':'s'} of manuscript didn't fit. Set "start page" to ${finalNeed+1} and run auto-layout again to continue it.`);
  return true;
}

/* ---------- 6. Orchestrator ---------- */
async function runManuscriptLayout(){
  const ed=EDS.tradebook;
  const text=($('msText').value||'').trim();
  if(text.split(/\s+/).length<10)return toast('Paste or upload your manuscript first.');
  const classic=$('msClassic').checked, size=+$('msSize').value;
  const opts={
    start:Math.max(0,(parseInt($('msStart').value)||1)-1),
    size, lh:+$('msLh').value, font:$('msFont').value||FONT_CATS.trade[0],
    justify:$('msJustify').checked,
    indent:classic?1.4:0, paraGap:classic?0:Math.round(size*0.45),
    chapters:$('msChapters').checked, ai:$('msAi').checked,
    imgMode:$('msImgMode').value, imgN:Math.max(2,parseInt($('msImgN').value)||8)
  };
  const btn=$('msRunBtn'); btn.disabled=true; btn.textContent='Laying out…';
  try{
    loadGoogleFont(opts.font);
    try{await document.fonts.load(`400 ${opts.size}pt '${opts.font}'`);
        await document.fonts.load(`700 ${Math.round(opts.size*1.65)}pt '${opts.font}'`);
        await document.fonts.ready;}catch(e){}
    let blocks=msParseBlocks(text);
    if(opts.chapters&&opts.ai){btn.textContent='✦ AI reading structure…';
      try{await msSmartHeadings(blocks)}catch(e){toast('AI assist needs a live connection — used offline chapter detection.')}
      btn.textContent='Laying out…';}
    if(!opts.chapters)blocks=blocks.map(b=>b.type==='heading'?{type:'para',text:b.text}:b);
    const words=text.split(/\s+/).length;
    const plan=msPaginate(ed,blocks,opts);
    if(msApply(ed,plan,opts,words)){
      hide('msModal');
      toast(`Manuscript laid out ✦ ${plan.pages.length} page${plan.pages.length===1?'':'s'} · ${plan.chapters} chapter${plan.chapters===1?'':'s'}${plan.images?' · '+plan.images+' image'+(plan.images===1?'':'s'):''} — everything stays editable.`);
    }
  }catch(e){console.error(e);toast('Layout failed — check the text and try again.')}
  btn.disabled=false; btn.textContent='✦ Lay out manuscript';
}

/* ---------- 7. Wire the manuscript file input + drop zone ---------- */
$('msFileInput').addEventListener('change',e=>{msReadTextFile(e.target.files[0]);e.target.value='';});
(()=>{const dz=$('msDropUp');if(!dz)return;
  dz.onclick=()=>$('msFileInput').click();
  dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};
  dz.ondragleave=()=>dz.classList.remove('over');
  dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');msReadTextFile(e.dataTransfer.files[0])};})();

/* ================= Client-side PDF rendering =================
   Produces real, downloadable proof PDFs entirely in the browser via html2canvas + jsPDF:
   each page is rendered at true 300 DPI pixel dimensions for its trim size, with 0.2" bleed
   and vector trim marks drawn directly by jsPDF.                                        */
const PAGE_DIMS={photobook:{w:8.5,h:8.5,ref:420},photobook12:{w:12,h:12,ref:420},tradebook:{w:5.5,h:8,ref:300}};
const PDF_BLOBS={};
async function ensurePdfLibs(){
  if(!window.jspdf)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  if(!window.html2canvas)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
}
function snapshotPhotoMap(doc,photos){
  const map={}; const pages=[doc.cover,doc.backCover,doc.spine,...(doc.pages||[])].filter(Boolean);
  const add=(pid)=>{if(!pid||map[pid])return; const ph=photos.find(p=>p.id===pid); if(!ph)return;
    map[pid]={url:PHOTO_PERMANENT_URLS[pid]||ph.url,w:ph.w,h:ph.h};};
  pages.forEach(pg=>{(pg.images||[]).forEach(im=>add(im.photo));(pg.shapes||[]).forEach(sh=>add(sh.photo));});
  return map;
}
function snapshotApPhotoMap(){
  const map={}; AP.boards.forEach(b=>{if(!b||map[b.photoId])return;
    const ph=AP.photos.find(p=>p.id===b.photoId); if(!ph)return;
    map[b.photoId]={url:PHOTO_PERMANENT_URLS[b.photoId]||ph.url,w:ph.w,h:ph.h};});
  return map;
}
function snapshotApSinglePhotoMap(key){
  const st=AP_SINGLE[key]; const map={}; const b=st.board;
  if(b){const ph=st.photos.find(p=>p.id===b.photoId);
    if(ph)map[b.photoId]={url:PHOTO_PERMANENT_URLS[b.photoId]||ph.url,w:ph.w,h:ph.h};}
  return map;
}
/* Builds one page's real DOM at true print-pixel dimensions (width/height = inches × dpi),
   reusing the same .tbox-inner markup/CSS the editor uses so headings, quotes, indents and
   scene breaks all render identically to what the customer saw on screen. */
function pdfBuildPage(page,dims,photoMap,dpi,monochrome,textOnly,imagesOnly){
  const wpx=Math.round(dims.w*dpi), hpx=Math.round(dims.h*dpi);
  const k=wpx/(dims.ref||wpx); // scales on-screen px font sizes up to true print resolution
  const el=document.createElement('div');
  el.style.cssText=`position:relative;width:${wpx}px;height:${hpx}px;background:${(page&&page.bg)||'#FFFFFF'};overflow:hidden`;
  if(!page)return el;
  const printFilter=(o,blurScale)=>{let f=`brightness(${o.b??100}%) contrast(${o.c??100}%) saturate(${o.sat??100}%)`;
    const t=o.temp||0;
    if(!monochrome&&t>0)f+=` sepia(${Math.round(t*0.35)}%) saturate(${100+t*0.3}%)`;
    if(!monochrome&&t<0)f+=` hue-rotate(${Math.round(t*0.25)}deg) saturate(${100+t*0.15}%)`;
    if(o.blur)f+=` blur(${(o.blur*blurScale).toFixed(2)}px)`;
    if(monochrome)f+=' grayscale(100%)';return f;};
  if(!textOnly){
    (page.images||[]).forEach(im=>{
      const ph=photoMap[im.photo]; if(!ph)return;
      const d=document.createElement('div');
      d.style.cssText=`position:absolute;left:${im.x}%;top:${im.y}%;width:${im.w}%;height:${im.h}%;overflow:hidden`;
      if((im.op??100)<100)d.style.opacity=(im.op/100);
      if(im.shadow)d.style.boxShadow=`0 ${(im.shadow*0.35*k).toFixed(1)}px ${(im.shadow*k).toFixed(1)}px rgba(0,0,0,.38)`;
      const img=document.createElement('img'); img.crossOrigin='anonymous'; img.src=ph.url;
      const fit=im.fit||'contain';
      let tf=`rotate(${im.rot||0}deg)`; let posCss='';
      if(fit==='cover'){posCss=`object-position:${im.fx??50}% ${im.fy??50}%;`;if((im.zoom||100)!==100)tf+=` scale(${(im.zoom/100).toFixed(2)})`;}
      img.style.cssText=`width:100%;height:100%;object-fit:${fit};${posCss}transform:${tf};`+
        `filter:${printFilter(im,k)}`;
      d.appendChild(img); el.appendChild(d);
    });
    (page.shapes||[]).forEach(sh=>{
      if(imagesOnly&&!sh.photo)return; // solid-fill shapes are drawn separately as native vector rects/ellipses when isolating just the photo layer — rasterizing them here too is exactly the double-render this fixes
      const clip=shapeClip(sh.shapeKey);
      const d=document.createElement('div');
      d.style.cssText=`position:absolute;left:${sh.x}%;top:${sh.y}%;width:${sh.w}%;height:${sh.h}%;overflow:hidden;transform:rotate(${sh.rot||0}deg);clip-path:${clip};-webkit-clip-path:${clip}`;
      if(sh.shadow)d.style.filter=`drop-shadow(0 ${(sh.shadow*0.35*k).toFixed(1)}px ${(sh.shadow*k).toFixed(1)}px rgba(0,0,0,.35))`;
      const ph=sh.photo?photoMap[sh.photo]:null;
      if(ph){const img=document.createElement('img');img.crossOrigin='anonymous';img.src=ph.url;
        img.style.cssText=`width:100%;height:100%;object-fit:cover;filter:${printFilter(sh,k)}`;
        d.appendChild(img);
      }else{d.style.background=sh.fill;}
      el.appendChild(d);
    });
  }
  if(!imagesOnly){
    (page.texts||[]).forEach(t=>{
      const d=document.createElement('div');
      d.style.cssText=`position:absolute;left:${t.x}%;top:${t.y}%${t.w?`;width:${t.w}%`:''}`;
      const col=monochrome?`rgba(0,0,0,${(t.blackPct??100)/100})`:(t.color||'#1D1D1F');
      const inner=document.createElement('div'); inner.className='tbox-inner'; inner.innerHTML=t.html||'';
      // Real typographic points (manuscript text) convert physically via the true print DPI (1pt = dpi/72 px).
      // Legacy freeform px sizes (photobook/trade cover text) use the on-screen-to-print calibration factor k.
      const fontPx=(t.unit==='pt')?(t.size||8)*(dpi/72):(t.size||16)*k;
      const spacePx=(v)=>(t.unit==='pt')?(v||0)*(dpi/96):(v||0)*k; // paragraph-gap/letter-spacing were tuned at 96dpi CSS scale
      inner.style.cssText=`font-size:${fontPx}px;color:${col};font-family:'${t.font||'Inter'}',serif;text-align:${t.align||'left'};`+
        `font-weight:${t.bold?700:(t.weight||400)};font-style:${t.italic?'italic':'normal'};text-decoration:${t.underline?'underline':'none'};`+
        `line-height:${t.lineHeight??1.3};--para-gap:${spacePx(t.paraSpacing??8)}px;letter-spacing:${spacePx(t.ls??0)}px;text-indent:${t.indent??0}em`+
        (t.shadow?`;text-shadow:0 ${(t.shadow*0.006).toFixed(3)}em ${(t.shadow*0.014).toFixed(3)}em rgba(0,0,0,.42)`:'');
      d.appendChild(inner); el.appendChild(d);
    });
  }
  return el;
}
/* ── Hybrid PDF renderer ──────────────────────────────────────────────────────
   Images → html2canvas at 300 DPI (pixel-perfect, each frame individually)
   Text   → native jsPDF text (selectable, searchable, scalable, no rasterisation)
   Shapes → native jsPDF rectangles/ellipses (vector, sharp at any zoom)
   This produces a proper prepress PDF: text remains selectable, file size is
   dramatically smaller than full-raster, and RIPs process it correctly.        */

async function pdfRenderPhotoLayer(page, dims, photoMap, dpi, monochrome, bleedIn, hardMono){
  /* Renders only the image/photo layer of a page to a canvas at full DPI.
     Returns null if the page has no images (no canvas needed, saves time). */
  const images = (page.images||[]).filter(im => photoMap[im.photo]);
  const shapes  = (page.shapes||[]).filter(sh => sh.photo && photoMap[sh.photo]);
  if(!images.length && !shapes.length) return null;

  const totalW = dims.w + 2*bleedIn, totalH = dims.h + 2*bleedIn;
  const wpx = Math.round(totalW*dpi), hpx = Math.round(totalH*dpi);

  const holder = document.createElement('div');
  holder.style.cssText = `position:fixed;left:-99999px;top:0;width:${wpx}px;height:${hpx}px;background:transparent`;

  // Any image positioned or resized so it extends past the trim edge (dragging already allowed
  // this; resizing was fixed to allow it too) needs its pixels to actually reach the bleed edge
  // in print — pdfBuildPage's page element clips everything at the trim line, so left alone the
  // trimmed, printed book would show a blank margin around it instead of the photo reaching the
  // true edge. This renders a backdrop copy of each such image, positioned in pixels to align
  // exactly with where its trim-clipped counterpart sits inside the offset page element below —
  // it only shows through in the parts that overhang the trim edge.
  const trimWpx=Math.round(dims.w*dpi), trimHpx=Math.round(dims.h*dpi), bleedPx=Math.round(bleedIn*dpi);
  images.filter(im=>im._fullBleed||im.x<0||im.y<0||im.x+im.w>100||im.y+im.h>100).forEach(im=>{
    const ph=photoMap[im.photo]; if(!ph)return;
    const bd=document.createElement('div');
    const leftPx=bleedPx+(im.x/100)*trimWpx, topPx=bleedPx+(im.y/100)*trimHpx;
    const wPx=(im.w/100)*trimWpx, hPx=(im.h/100)*trimHpx;
    bd.style.cssText=`position:absolute;left:${leftPx}px;top:${topPx}px;width:${wPx}px;height:${hPx}px;overflow:hidden`;
    const img=document.createElement('img'); img.crossOrigin='anonymous'; img.src=ph.url;
    const fit=im.fit||'contain';
    let tf=`rotate(${im.rot||0}deg)`; if(fit==='cover'&&(im.zoom||100)!==100)tf+=` scale(${(im.zoom/100).toFixed(2)})`;
    img.style.cssText=`width:100%;height:100%;object-fit:${fit};object-position:${im.fx??50}% ${im.fy??50}%;transform:${tf};filter:${monochrome||hardMono?'grayscale(100%)':'none'}`;
    bd.appendChild(img); holder.appendChild(bd);
  });

  // Build a DOM containing only the image/shape-photo layer (no text, no solid shapes)
  const el = pdfBuildPage(page, dims, photoMap, dpi, monochrome, /*textOnly=*/false, /*imagesOnly=*/true);
  if(hardMono) el.style.filter = 'grayscale(100%)';
  el.style.position = 'absolute';
  el.style.left = Math.round(bleedIn*dpi)+'px';
  el.style.top  = Math.round(bleedIn*dpi)+'px';
  holder.appendChild(el);
  document.body.appendChild(holder);
  await Promise.all([...holder.querySelectorAll('img')].map(img =>
    img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })
  ));
  const canvas = await html2canvas(holder, {
    scale: 1,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    width: wpx,
    height: hpx,
    logging: false
  });
  document.body.removeChild(holder);
  return canvas;
}

function pdfAddVectorText(doc, page, dims, bleedIn, monochrome){
  /* Draws each text box as native PDF text objects. jsPDF uses points (1pt = 1/72 in).
     We convert all positions/sizes from percentages of the page dimensions to inches,
     then to points. Text is NOT rasterised — it's actual searchable/selectable PDF text. */
  const PT = 72; // points per inch
  const pageWIn = dims.w, pageHIn = dims.h;
  const offX = bleedIn, offY = bleedIn; // bleed offset in inches

  (page.texts||[]).forEach(t => {
    const xIn  = offX + (t.x/100)*pageWIn;
    const yIn  = offY + (t.y/100)*pageHIn;
    const wIn  = ((t.w||100)/100)*pageWIn;
    const hIn  = ((t.h||100)/100)*pageHIn;

    // Colour
    const pct = t.blackPct ?? 100;
    if(monochrome){
      const k = 1 - pct/100; // CMYK K channel
      doc.setTextColor(0, 0, 0); // jsPDF text colour as RGB black, opacity via transparency
      doc.setDrawColor(0);
      // Use grayscale: 0=black 255=white
      const gray = Math.round((1-pct/100)*255);
      doc.setTextColor(gray, gray, gray);
    } else {
      const hex = t.color || '#1D1D1F';
      const r = parseInt(hex.slice(1,3),16)||0;
      const g = parseInt(hex.slice(3,5),16)||0;
      const b = parseInt(hex.slice(5,7),16)||0;
      doc.setTextColor(r, g, b);
    }

    // Font size: convert from the editor's CSS-px size to points
    // The editor renders at a CSS width of cfg.pageCssW (e.g. 420px for an 8.5in page)
    // So 1 CSS px = (pageWIn / pageCssWPx) inches = (pageWIn / pageCssWPx) * 72 points
    const pageCssPx = dims.ref || 420; // reference CSS width the editor uses
    let fontPt;
    if(t.unit === 'pt') {
      fontPt = t.size || 12; // already in points
    } else {
      fontPt = ((t.size||16) / pageCssPx) * pageWIn * PT;
    }
    fontPt = Math.max(4, Math.round(fontPt * 10) / 10);

    const lineHeightMult = t.lineHeight ?? 1.3;
    const align = t.align || 'left';
    const bold   = t.bold || (t.weight && t.weight >= 700);
    const italic = t.italic;
    const fontStyle = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal';

    // Map Google Font name → jsPDF built-in (jsPDF ships Helvetica, Times, Courier)
    // For anything else we fall back to Helvetica which is embedded in every PDF viewer
    const fontFamilyMap = {
      'Times New Roman':'times', 'Georgia':'times', 'Playfair Display':'times',
      'Courier New':'courier', 'Courier Prime':'courier',
    };
    const jsPDFFont = fontFamilyMap[t.font] || 'helvetica';
    doc.setFont(jsPDFFont, fontStyle);
    doc.setFontSize(fontPt);

    // Strip HTML tags to get plain text (the PDF text layer doesn't render HTML)
    const plainText = (t.html||t.text||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
    if(!plainText.trim()) return;

    // Word-wrap to fit the text box width
    const lines = doc.splitTextToSize(plainText, wIn * PT);
    const lineHeightPt = fontPt * lineHeightMult;

    // jsPDF y is baseline of the first line; adjust for top-alignment
    let curY = yIn * PT + fontPt * 0.8; // 0.8 ≈ cap height fraction
    const alignMap = { left:'left', center:'center', right:'right', justify:'left' };

    lines.forEach((line, idx) => {
      if(curY > (offY + pageHIn) * PT) return; // clip at page bottom
      let xPt = xIn * PT;
      if(align === 'center') xPt = (offX + (t.x/100 + (t.w||100)/200)*pageWIn) * PT;
      if(align === 'right')  xPt = (offX + (t.x/100 + (t.w||100)/100)*pageWIn) * PT;
      doc.text(line, xPt, curY, { align: alignMap[align] || 'left', maxWidth: wIn*PT });
      curY += lineHeightPt;
    });
  });

  // Reset text colour to black for next page
  doc.setTextColor(0, 0, 0);
}

function pdfAddVectorShapes(doc, page, dims, bleedIn, monochrome){
  /* Draws solid (non-photo) shapes as native PDF geometry. */
  const PT = 72;
  const pageWIn = dims.w, pageHIn = dims.h;
  const offX = bleedIn, offY = bleedIn;

  (page.shapes||[]).filter(sh => !sh.photo && !sh.hidden).forEach(sh => {
    const xPt = (offX + sh.x/100 * pageWIn) * PT;
    const yPt = (offY + sh.y/100 * pageHIn) * PT;
    const wPt = (sh.w/100 * pageWIn) * PT;
    const hPt = (sh.h/100 * pageHIn) * PT;
    const op  = (sh.op ?? 100) / 100;

    let r=0,g=0,b=0;
    if(monochrome){
      const gray = Math.round((1 - (sh.blackPct??100)/100) * 255);
      r=g=b=gray;
    } else {
      const fill = sh.fill || '#141414';
      r = parseInt(fill.slice(1,3)||'0',16);
      g = parseInt(fill.slice(3,5)||'0',16);
      b = parseInt(fill.slice(5,7)||'0',16);
    }
    doc.setFillColor(r, g, b);
    doc.setDrawColor(r, g, b);

    const key = sh.shapeKey || 'rect';
    if(key === 'circle' || key === 'ellipse'){
      doc.ellipse(xPt + wPt/2, yPt + hPt/2, wPt/2, hPt/2, 'F');
    } else {
      doc.rect(xPt, yPt, wPt, hPt, 'F');
    }
  });

  doc.setFillColor(0,0,0);
  doc.setDrawColor(0,0,0);
}

async function pdfPageHybrid(doc, page, dims, photoMap, dpi, monochrome, bleedIn, hardMono, xOffset, yOffset){
  /* Renders one page into an already-open jsPDF document at the given offset (inches).
     Layer order: background fill → photo canvas → vector shapes → vector text
     xOffset / yOffset allow placing a page within a larger spread (e.g. cover wrap). */
  const PT = 72;
  const totalW = dims.w + 2*bleedIn, totalH = dims.h + 2*bleedIn;
  const ox = (xOffset||0), oy = (yOffset||0);

  // 1. Background
  const bg = (page && page.bg) || '#FFFFFF';
  const bgR = parseInt(bg.slice(1,3)||'FF',16);
  const bgG = parseInt(bg.slice(3,5)||'FF',16);
  const bgB = parseInt(bg.slice(5,7)||'FF',16);
  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(ox, oy, totalW * PT, totalH * PT, 'F');

  // 2. Photo layer (raster, 300 DPI)
  const photoCanvas = await pdfRenderPhotoLayer(page, dims, photoMap, dpi, monochrome, bleedIn, hardMono);
  if(photoCanvas){
    const imgData = photoCanvas.toDataURL('image/jpeg', 0.93);
    doc.addImage(imgData, 'JPEG', ox, oy, totalW * PT, totalH * PT);
  }

  // 3. Vector solid shapes (rendered over photos, under text — matches editor layer order)
  pdfAddVectorShapes(doc, page, dims, bleedIn, monochrome);

  // 4. Vector text (topmost layer, always selectable)
  pdfAddVectorText(doc, page, dims, bleedIn, monochrome);
}

// Keep the old pdfPageCanvas for any legacy code paths still referencing it
async function pdfPageCanvas(page,dims,photoMap,dpi,monochrome,bleedIn,hardMono){
  const totalW=dims.w+2*bleedIn, totalH=dims.h+2*bleedIn;
  const wpx=Math.round(totalW*dpi), hpx=Math.round(totalH*dpi);
  const holder=document.createElement('div');
  holder.style.cssText=`position:fixed;left:-99999px;top:0;width:${wpx}px;height:${hpx}px;background:#fff`;
  // Same bleed-backdrop treatment as pdfRenderPhotoLayer — see that function's comment.
  const trimWpx=Math.round(dims.w*dpi), trimHpx=Math.round(dims.h*dpi), bleedPx=Math.round(bleedIn*dpi);
  (page.images||[]).filter(im=>im._fullBleed||im.x<0||im.y<0||im.x+im.w>100||im.y+im.h>100).forEach(im=>{
    const ph=photoMap[im.photo]; if(!ph)return;
    const bd=document.createElement('div');
    const leftPx=bleedPx+(im.x/100)*trimWpx, topPx=bleedPx+(im.y/100)*trimHpx;
    const wPx=(im.w/100)*trimWpx, hPx=(im.h/100)*trimHpx;
    bd.style.cssText=`position:absolute;left:${leftPx}px;top:${topPx}px;width:${wPx}px;height:${hPx}px;overflow:hidden`;
    const img=document.createElement('img'); img.crossOrigin='anonymous'; img.src=ph.url;
    const fit=im.fit||'contain';
    let tf=`rotate(${im.rot||0}deg)`; if(fit==='cover'&&(im.zoom||100)!==100)tf+=` scale(${(im.zoom/100).toFixed(2)})`;
    img.style.cssText=`width:100%;height:100%;object-fit:${fit};object-position:${im.fx??50}% ${im.fy??50}%;transform:${tf};filter:${monochrome||hardMono?'grayscale(100%)':'none'}`;
    bd.appendChild(img); holder.appendChild(bd);
  });
  const el=pdfBuildPage(page,dims,photoMap,dpi,monochrome);
  if(hardMono)el.style.filter='grayscale(100%)';
  el.style.position='absolute'; el.style.left=Math.round(bleedIn*dpi)+'px'; el.style.top=Math.round(bleedIn*dpi)+'px';
  holder.appendChild(el); document.body.appendChild(holder);
  await Promise.all([...holder.querySelectorAll('img')].map(img=>img.complete?null:new Promise(r=>{img.onload=img.onerror=r})));
  const canvas=await html2canvas(holder,{scale:1,useCORS:true,backgroundColor:'#ffffff'});
  document.body.removeChild(holder);
  return canvas;
}
function pdfTrimMarks(doc,totalWIn,totalHIn,bleedIn){
  const PT=72; const len=0.15*PT;
  const tw=totalWIn*PT, th=totalHIn*PT, bl=bleedIn*PT;
  doc.setDrawColor(0); doc.setLineWidth(0.4); // 0.4pt hairline
  [[bl,bl,1,1],[tw-bl,bl,-1,1],[bl,th-bl,1,-1],[tw-bl,th-bl,-1,-1]].forEach(([x,y,dx,dy])=>{
    doc.line(x,y,x+dx*len,y); doc.line(x,y,x,y+dy*len);
  });
}
function finalizePdf(pdfDoc,order,fileKey){
  const blob=pdfDoc.output('blob'); const url=URL.createObjectURL(blob);
  PDF_BLOBS[order.id+'|'+fileKey]=url;
  order.pdfFiles[fileKey]='Ready'; saveJSON('binder_orders',S.orders); renderPdfRows();
  toast('Rendered ✦ "'+fileKey+'" is ready to download — a high-resolution proof PDF.');
}
async function generatePdfForOrder(orderId,fileKey,btn){
  const o=S.orders.find(x=>x.id===orderId);
  if(!o||!o.snapshot)return toast('No design data was saved with this order — this can happen for orders placed before PDF rendering was added.');
  if(btn){btn.disabled=true;btn.textContent='Rendering…';}
  try{
    await ensurePdfLibs();
    const {jsPDF}=window.jspdf; const BLEED=0.2, DPI=300; const PT=72;

    // ── Art Prints ──────────────────────────────────────────────────────────
    if(o.product==='artprints'){
      const boardOrient=o.snapshot.orient||['landscape','landscape','landscape','landscape'];
      let doc=null;
      for(let i=0;i<o.snapshot.boards.length;i++){
        const orient=boardOrient[i]||'landscape';
        const dims=orient==='portrait'?{w:4,h:6,ref:4*DPI}:{w:6,h:4,ref:6*DPI};
        const tw=dims.w+2*BLEED, th=dims.h+2*BLEED;
        const pageOrientation=tw>th?'landscape':'portrait';
        if(!doc)doc=new jsPDF({orientation:pageOrientation,unit:'pt',format:[tw*PT,th*PT]});
        else doc.addPage([tw*PT,th*PT],pageOrientation);
        const b=o.snapshot.boards[i];
        const page={bg:'#FFFFFF',images:b?[{photo:b.photoId,x:b.x,y:b.y,w:b.w,h:b.h,b:100,c:100,sat:100,rot:0,fit:'cover',fx:50,fy:50}]:[],texts:[],shapes:[]};
        await pdfPageHybrid(doc,page,dims,o.snapshot.photoMap,DPI,false,BLEED,false,0,0);
        pdfTrimMarks(doc,tw,th,BLEED);
      }
      finalizePdf(doc,o,fileKey); return;
    }

    // ── Single Art Print (12×18 or 16×20) ────────────────────────────────────
    if(AP_SINGLE_VARIANTS[o.product]){
      const variant=AP_SINGLE_VARIANTS[o.product];
      const orient=o.snapshot.orient||'portrait';
      const wIn=orient==='portrait'?variant.wIn:variant.hIn, hIn=orient==='portrait'?variant.hIn:variant.wIn;
      const dims={w:wIn,h:hIn,ref:wIn*DPI};
      const tw=wIn+2*BLEED, th=hIn+2*BLEED;
      const doc=new jsPDF({orientation:th>tw?'portrait':'landscape',unit:'pt',format:[tw*PT,th*PT]});
      const b=o.snapshot.board;
      const page={bg:'#FFFFFF',images:b?[{photo:b.photoId,x:b.x,y:b.y,w:b.w,h:b.h,b:100,c:100,sat:100,rot:0,fit:'cover',fx:50,fy:50}]:[],texts:[],shapes:[]};
      await pdfPageHybrid(doc,page,dims,o.snapshot.photoMap,DPI,false,BLEED,false,0,0);
      pdfTrimMarks(doc,tw,th,BLEED);
      finalizePdf(doc,o,fileKey); return;
    }

    const ed=EDS[o.product];
    // Orientation-switchable editors (12×18 photobook) aren't in the static PAGE_DIMS table since
    // their trim size depends on the doc — derive it from the saved order snapshot's orientation
    // rather than the live editor's current cfg, since the two can differ (e.g. the customer opened
    // a different project in the same tab after ordering).
    let dims=PAGE_DIMS[o.product];
    if(!dims){
      const orient=(o.snapshot&&o.snapshot.doc&&o.snapshot.doc.orientation)||'portrait';
      const baseW=ed.cfg._baseW||ed.cfg.pageInW, baseH=ed.cfg._baseH||ed.cfg.pageInH;
      dims=orient==='landscape'?{w:baseH,h:baseW,ref:420}:{w:baseW,h:baseH,ref:420};
    }
    const mono=ed.cfg.monochrome;

    // ── Cover: three separate single pages (back, spine, front) ─────────────
    if(fileKey.indexOf('cover')===0){
      const spineIn=ed.cfg.hasSpine?+((o.snapshot.doc.pages.length)*(ed.cfg.spineCaliperIn||0.0035)).toFixed(3):0;

      // Page 1: Back cover
      const backW=dims.w+2*BLEED, backH=dims.h+2*BLEED;
      const doc=new jsPDF({orientation:backH>backW?'portrait':'landscape',unit:'pt',format:[backW*PT,backH*PT]});
      await pdfPageHybrid(doc,o.snapshot.doc.backCover||{},dims,o.snapshot.photoMap,DPI,mono,BLEED,false,0,0);
      pdfTrimMarks(doc,backW,backH,BLEED);

      // Page 2: Spine (only for books with a spine)
      if(ed.cfg.hasSpine&&spineIn>0){
        const spineW=spineIn+2*BLEED, spineH=dims.h+2*BLEED;
        doc.addPage([spineW*PT,spineH*PT],spineH>spineW?'portrait':'landscape');
        const spineDims={w:spineIn,h:dims.h,ref:spineIn*DPI};
        await pdfPageHybrid(doc,o.snapshot.doc.spine||{},spineDims,o.snapshot.photoMap,DPI,mono,BLEED,false,0,0);
        pdfTrimMarks(doc,spineW,spineH,BLEED);
      }

      // Page 3: Front cover
      doc.addPage([backW*PT,backH*PT],backH>backW?'portrait':'landscape');
      await pdfPageHybrid(doc,o.snapshot.doc.cover,dims,o.snapshot.photoMap,DPI,mono,BLEED,false,0,0);
      pdfTrimMarks(doc,backW,backH,BLEED);

      finalizePdf(doc,o,fileKey); return;
    }

    // ── Interior pages ────────────────────────────────────────────────────────
    const totalW=dims.w+2*BLEED, totalH=dims.h+2*BLEED;
    const doc=new jsPDF({orientation:totalH>totalW?'portrait':'landscape',unit:'pt',format:[totalW*PT,totalH*PT]});
    const pages=o.snapshot.doc.pages;
    for(let i=0;i<pages.length;i++){
      if(i>0)doc.addPage([totalW*PT,totalH*PT]);
      await pdfPageHybrid(doc,pages[i],dims,o.snapshot.photoMap,DPI,mono,BLEED,mono,0,0);
      pdfTrimMarks(doc,totalW,totalH,BLEED);
      if(btn&&i%5===0)btn.textContent=`Rendering… ${i+1}/${pages.length}`;
    }
    finalizePdf(doc,o,fileKey);
  }catch(e){console.error(e);toast('Render failed: '+(e.message||e));}
  if(btn){btn.disabled=false;btn.textContent='Re-render';}
}
function downloadPdf(orderId,fileKey){
  const order=S.orders.find(o=>o.id===orderId);
  if(!order||!order.paymentId){toast('A print order must be placed before downloading the PDF.');return;}
  const url=PDF_BLOBS[orderId+'|'+fileKey];
  if(!url)return toast('Render it first — the file lives in this browser session only.');
  const a=document.createElement('a'); a.href=url; a.download=orderId+' — '+fileKey+'.pdf'; a.click();
}

/* ---------- Preview ---------- */
let PV={key:null,idx:-1};
function openPreview(key){PV.key=key;PV.idx=(EDS[key]&&EDS[key].cfg.hasSpine)?'coverspread':'cover';pvRender();show('previewModal')}
function pvRender(){
  const st=$('pvStage');st.innerHTML='';
  if(PV.key==='artprints'){
    const grid=document.createElement('div');grid.className='artboard-grid';grid.style.cssText+='background:transparent;box-shadow:none;width:min(640px,80vw)';
    AP.boards.forEach((b,i)=>{
      const orient=(AP.orient&&AP.orient[i])||'landscape';
      const board=document.createElement('div');board.className='artboard';board.style.cssText=`width:100%;aspect-ratio:${orient==='portrait'?'4/6':'6/4'}`;
      if(b){const ph=AP.photos.find(p=>p.id===b.photoId);
        if(ph){const im=document.createElement('div');im.style.cssText=`position:absolute;left:${b.x??16.6}%;top:${b.y??16.6}%;width:${b.w??66.8}%;height:${b.h??66.8}%;overflow:hidden`;
          const img=document.createElement('img');img.src=ph.url;img.style.cssText='width:100%;height:100%;object-fit:contain';im.appendChild(img);board.appendChild(im);}
      }
      grid.appendChild(board);
    });
    st.appendChild(grid);
    $('pvLabel').textContent='4 artboards · 6″×4″ (or 4″×6″ portrait)';
    document.querySelectorAll('#previewModal .pv-navbtn').forEach(b=>b.style.display='none');
    return;
  }
  if(AP_SINGLE_VARIANTS[PV.key]){
    const variant=AP_SINGLE_VARIANTS[PV.key], stv=AP_SINGLE[PV.key];
    const dims=apSingleDims(PV.key,stv.orient);
    // Deliberately NOT using .artboard-grid here — that class lays out a 2-column grid meant for
    // the 4-print set's boards, so a single board dropped into it only ever occupied one column
    // (roughly half the intended width), rendering small and pushed to one side instead of
    // centered. Dimensions are computed explicitly in px (rather than aspect-ratio+auto sizing)
    // because auto-sizing collapses to 0×0 here — the board has no normal-flow content to anchor
    // an intrinsic size to, since its photo is positioned absolutely.
    const maxW=Math.min(560,window.innerWidth*0.8), maxH=window.innerHeight*0.6;
    let boardWpx=maxW, boardHpx=maxW*(dims.h/dims.w);
    if(boardHpx>maxH){boardHpx=maxH; boardWpx=maxH*(dims.w/dims.h);}
    const wrap=document.createElement('div');wrap.style.cssText='display:flex;justify-content:center;padding:20px';
    const board=document.createElement('div');board.className='artboard';
    board.style.cssText=`width:${Math.round(boardWpx)}px;height:${Math.round(boardHpx)}px;flex-shrink:0;background:#fff`;
    const b=stv.board;
    if(b){const ph=stv.photos.find(p=>p.id===b.photoId);
      if(ph){const im=document.createElement('div');im.style.cssText=`position:absolute;left:${b.x??8.3}%;top:${b.y??8.3}%;width:${b.w??83.4}%;height:${b.h??83.4}%;overflow:hidden`;
        const img=document.createElement('img');img.src=ph.url;img.style.cssText='width:100%;height:100%;object-fit:contain';im.appendChild(img);board.appendChild(im);}
    }
    wrap.appendChild(board);
    st.appendChild(wrap);
    $('pvLabel').textContent=`${variant.label} · ${dims.w}″×${dims.h}″`;
    document.querySelectorAll('#previewModal .pv-navbtn').forEach(b=>b.style.display='none');
    return;
  }
  document.querySelectorAll('#previewModal .pv-navbtn').forEach(b=>b.style.display='');
  const ed=EDS[PV.key];
  if(PV.idx==='coverspread'){
    const wrap=document.createElement('div');wrap.className='spread wrap-cover';
    const back=ed.buildPage(ed.doc.backCover,'back',null,null,false);
    const spineEl=ed.buildPage(ed.doc.spine,'spine',null,null,false);
    const spineWidthPx=Math.max(14,ed.spineWidthIn()*140);
    spineEl.style.width=spineWidthPx+'px';spineEl.style.aspectRatio='unset';spineEl.style.height='auto';spineEl.classList.add('spine-zone');
    const front=ed.buildPage(ed.doc.cover,'cover',null,null,false);
    wrap.append(back,spineEl,front);
    wrap.querySelectorAll('.book-page').forEach(p=>{if(!p.classList.contains('spine-zone'))p.style.width='200px'});
    st.appendChild(wrap);
    $('pvLabel').textContent=`Cover · Spine (${ed.spineWidthIn()}″) · Back`;
    return;
  }
  const spread=document.createElement('div');spread.className='spread';
  if(PV.idx==='cover'||PV.idx==='back'){spread.classList.add('single');spread.appendChild(ed.buildPage(PV.idx==='cover'?ed.doc.cover:ed.doc.backCover,PV.idx,null,null,false));$('pvLabel').textContent=PV.idx==='cover'?'Cover':'Back cover';}
  else{
    const item=ed.interiorLayout()[PV.idx];
    if(item.type==='single'){
      spread.classList.add('single');
      spread.appendChild(ed.buildPage(ed.doc.pages[item.idx],item.idx,null,null,false));
      $('pvLabel').textContent=`Page ${item.idx+1} of ${ed.pageCount()}`;
    }else{
      spread.appendChild(ed.buildPage(ed.doc.pages[item.l],item.l,null,null,false));
      spread.appendChild(ed.buildPage(ed.doc.pages[item.r],item.r,null,null,false));
      $('pvLabel').textContent=`Pages ${item.l+1}–${item.r+1} of ${ed.pageCount()}`;
    }
  }
  spread.querySelectorAll('.book-page').forEach(p=>{p.style.width='280px'});
  st.appendChild(spread);
}
function pvNav(d){if(PV.key==='artprints')return;const ed=EDS[PV.key];const max=ed.interiorLayout().length-1;
  if(ed.cfg.hasSpine){
    if(PV.idx==='coverspread')PV.idx=d>0?0:'coverspread';
    else{PV.idx+=d; if(PV.idx<0)PV.idx='coverspread'; if(PV.idx>max)PV.idx=max;}
  }else{
    if(PV.idx==='cover')PV.idx=d>0?0:'cover'; else if(PV.idx==='back')PV.idx=d<0?max:'back';
    else{PV.idx+=d; if(PV.idx<0)PV.idx='cover'; if(PV.idx>max)PV.idx='back';}
  }
  pvRender();}

/* ================= ART PRINTS EDITOR ================= */
const AP={title:'Untitled Art Print Set',photos:[],boards:[null,null,null,null],orient:['landscape','landscape','landscape','landscape']}; // each board: {photoId,x,y,w,h} or null
// Single art prints (12×18 and 16×20) — a separate, parameterized system so the existing 4-print
// AP object above (and everything checkout/PDF/admin code that hardcodes it) is never touched.
// Both new sizes share this one implementation, differing only by their config below.
const AP_SINGLE_VARIANTS={
  artprint12x18:{label:'12″×18″ Art Print',prefix:'ap12x18',wIn:12,hIn:18,price:280000},
  artprint16x20:{label:'16″×20″ Art Print',prefix:'ap16x20',wIn:16,hIn:20,price:420000},
};
const AP_SINGLE={
  artprint12x18:{title:'Untitled 12×18 Art Print',photos:[],board:null,orient:'portrait'},
  artprint16x20:{title:'Untitled 16×20 Art Print',photos:[],board:null,orient:'portrait'},
};
const AP_MARGIN=16.6, AP_INSET=66.8; // 1in margin on a 6x4in board — 16.6% each side
const boardRatio=orient=>orient==='portrait'?4/6:6/4; // board's own on-screen width/height ratio
function toggleBoardOrient(i){AP.orient[i]=(AP.orient[i]==='portrait')?'landscape':'portrait';
  const b=AP.boards[i];
  if(b){const ph=AP.photos.find(p=>p.id===b.photoId);if(ph)Object.assign(b,fitPhotoBox(ph,boardRatio(AP.orient[i]),AP_MARGIN,AP_MARGIN,AP_INSET,AP_INSET));}
  renderArtPrints();}
// Shared 8-handle resize (4 edges + 4 corners, with page/margin snapping) for a single Art Print
// board's photo — used by both the 4-print set (renderArtPrints) and the single 12×18/16×20
// variants (renderApSingle), which otherwise duplicate this exact board/image/snap-target setup.
// `targets` is {xs,ys} in board %, matching the {xs,ys} shape already built at each call site.
function wireArtBoardResize(im,board,b,targets,onResized){
  const clearG=()=>board.querySelectorAll('.snap-line').forEach(l=>l.style.display='none');
  const showG=(axis,pos)=>{let line=board.querySelector('.snap-line.'+axis);
    if(!line){line=document.createElement('div');line.className='snap-line '+axis;board.appendChild(line);}
    if(axis==='v')line.style.left=pos+'%';else line.style.top=pos+'%'; line.style.display='block';};
  const snap=(val,arr,axis)=>{let best=null,bestDelta=1.5;
    arr.forEach(t=>{const delta=Math.abs(val-t);if(delta<bestDelta){bestDelta=delta;best=t;}});
    if(best!==null)showG(axis,best); return best!==null?best:val;};
  ['n','s','e','w','ne','nw','se','sw'].forEach(dir=>{
    const rh=document.createElement('div'); rh.className='rh rh-'+dir; im.appendChild(rh);
    rh.onmousedown=e=>{
      e.preventDefault();e.stopPropagation();
      const rect=board.getBoundingClientRect();
      const sx=e.clientX, sy=e.clientY;
      const ox=b.x, oy=b.y, ow=b.w, oh=b.h, ratio=(oh||1)/(ow||1);
      const right=ox+ow, bottom=oy+oh;
      const MIN=10;
      const mv=ev=>{
        const dx=(ev.clientX-sx)/rect.width*100, dy=(ev.clientY-sy)/rect.height*100;
        clearG();
        let nx=ox, ny=oy, nw=ow, nh=oh;
        if(dir.includes('e')){let r=right+dx; if(!ev.altKey)r=snap(r,targets.xs,'v'); nw=Math.max(MIN,r-ox);}
        if(dir.includes('w')){let l=ox+dx; if(!ev.altKey)l=snap(l,targets.xs,'v'); l=Math.min(l,right-MIN); nx=l; nw=right-l;}
        if(dir.includes('s')){let bo=bottom+dy; if(!ev.altKey)bo=snap(bo,targets.ys,'h'); nh=Math.max(MIN,bo-oy);}
        if(dir.includes('n')){let t=oy+dy; if(!ev.altKey)t=snap(t,targets.ys,'h'); t=Math.min(t,bottom-MIN); ny=t; nh=bottom-t;}
        if(ev.shiftKey&&dir.length===2){ // corner handle — preserve original aspect ratio
          if(Math.abs(dx)>=Math.abs(dy)){nh=nw*ratio; if(dir.includes('n'))ny=bottom-nh;}
          else{nw=nh/ratio; if(dir.includes('w'))nx=right-nw;}
        }
        b.x=nx;b.y=ny;b.w=nw;b.h=nh;
        im.style.left=nx+'%';im.style.top=ny+'%';im.style.width=nw+'%';im.style.height=nh+'%';
      };
      const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);clearG();if(onResized)onResized();};
      window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);
    };
  });
}
function renderArtPrints(){
  renderApPhotoGrid();
  const dz=$('ap-dropUp');
  if(dz&&!dz._wired){dz._wired=true;
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};
    dz.ondragleave=()=>dz.classList.remove('over');
    dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');
      ingestFiles([...e.dataTransfer.files],1200).then(added=>{AP.photos.push(...added);renderApPhotoGrid()});};
  }
  const wrap=$('ap-boards'); wrap.innerHTML='';
  const MARGIN=16.6, INSET=66.8; // 1in margin on a 6x4in board ≈ 16.6% each side
  if(!AP.orient)AP.orient=['landscape','landscape','landscape','landscape'];
  AP.boards.forEach((b,i)=>{
    const orient=AP.orient[i]||'landscape';
    const board=document.createElement('div'); board.className='artboard'; board.style.cssText=`width:100%;aspect-ratio:${orient==='portrait'?'4/6':'6/4'};`;
    board.dataset.i=i;
    // Safe margin (0.5") + bleed (0.2") guides, sized to this board's orientation.
    const wIn=orient==='portrait'?4:6, hIn=orient==='portrait'?6:4, SM=0.5, BL=0.2;
    const smX=(SM/wIn)*100, smY=(SM/hIn)*100, blX=(BL/wIn)*100, blY=(BL/hIn)*100;
    board.innerHTML=`<div class="safe-area-guide" style="left:${smX}%;top:${smY}%;width:${100-2*smX}%;height:${100-2*smY}%"></div>`+
      `<div class="bleed-guide" style="left:${-blX}%;top:${-blY}%;right:${-blX}%;bottom:${-blY}%"></div>`;
    const rot=document.createElement('div');rot.className='obj-del';rot.title='Rotate orientation';rot.textContent='⟲';
    rot.style.cssText+='top:6px;left:6px;right:auto;';
    rot.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
    rot.onclick=e=>{e.stopPropagation();toggleBoardOrient(i)};
    board.appendChild(rot);
    if(b){
      const ph=AP.photos.find(p=>p.id===b.photoId);
      if(b.x===undefined)Object.assign(b,ph?fitPhotoBox(ph,boardRatio(orient),MARGIN,MARGIN,INSET,INSET):{x:MARGIN,y:MARGIN,w:INSET,h:INSET});
      const im=document.createElement('div');im.className='img-obj';im.style.cssText=`left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%`;
      if(ph){const img=document.createElement('img');img.src=ph.url;im.appendChild(img);}
      board.appendChild(im);
      const dpiEl=dpiWarningEl(computePrintDpi(ph,wIn,hIn,b)); if(dpiEl)board.appendChild(dpiEl);
      const del=document.createElement('div');del.className='obj-del';del.textContent='×';del.style.cssText+='top:6px;right:6px';
      del.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
      del.onclick=e=>{e.stopPropagation();AP.boards[i]=null;renderArtPrints()};board.appendChild(del);
      const targets={xs:[0,50,100,MARGIN,MARGIN+INSET],ys:[0,50,100,MARGIN,MARGIN+INSET]};
      const clearG=()=>board.querySelectorAll('.snap-line').forEach(l=>l.style.display='none');
      const showG=(axis,pos)=>{let line=board.querySelector('.snap-line.'+axis);
        if(!line){line=document.createElement('div');line.className='snap-line '+axis;board.appendChild(line);}
        if(axis==='v')line.style.left=pos+'%';else line.style.top=pos+'%'; line.style.display='block';};
      const snap=(val,size,arr,axis)=>{const edges=[val,val+size/2,val+size];let best=null,bestDelta=1.5,bestGuide=null;
        edges.forEach((edge,idx)=>{arr.forEach(t=>{const delta=Math.abs(edge-t);if(delta<bestDelta){bestDelta=delta;bestGuide=t;best=idx===0?t:idx===1?t-size/2:t-size;}});});
        if(best!==null)showG(axis,bestGuide); return best!==null?best:val;};
      im.onmousedown=e=>{if((e.target.classList&&e.target.classList.contains('rh'))||(e.target.classList&&e.target.classList.contains('obj-del')))return;
        e.preventDefault();e.stopPropagation();
        const rect=board.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=b.x,oy=b.y;
        const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;
          let nx=ox+dx,ny=oy+dy; clearG();
          if(!ev.altKey){nx=snap(nx,b.w,targets.xs,'v');ny=snap(ny,b.h,targets.ys,'h');}
          b.x=nx;b.y=ny;im.style.left=b.x+'%';im.style.top=b.y+'%';};
        const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);clearG();};
        window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);};
      wireArtBoardResize(im,board,b,targets,()=>renderArtPrints());
    }else{
      const ph=document.createElement('div');ph.style.cssText='position:absolute;inset:16.6%;display:flex;align-items:center;justify-content:center;color:var(--slate-l);font-size:12px;text-align:center;pointer-events:none';
      ph.textContent=`Drop a photo here — ${orient==='portrait'?'4″×6″':'6″×4″'} board, 0.5″ safe margin`;board.appendChild(ph);
    }
    board.ondragover=e=>e.preventDefault();
    board.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('photo');if(!id)return;
      const ph=AP.photos.find(p=>p.id===id);
      AP.boards[i]=Object.assign({photoId:id},ph?fitPhotoBox(ph,boardRatio(orient),MARGIN,MARGIN,INSET,INSET):{x:MARGIN,y:MARGIN,w:INSET,h:INSET});
      renderArtPrints()};
    board.onclick=()=>{if(window._apArmed){const id=window._apArmed;const ph=AP.photos.find(p=>p.id===id);
      AP.boards[i]=Object.assign({photoId:id},ph?fitPhotoBox(ph,boardRatio(orient),MARGIN,MARGIN,INSET,INSET):{x:MARGIN,y:MARGIN,w:INSET,h:INSET});
      window._apArmed=null;renderArtPrints();}};
    wrap.appendChild(board);
  });
}
// Single art prints (12×18, 16×20) — one board, real per-axis margins (unlike AP's board, which
// reuses one 16.6% margin for both axes since its board is a fixed 6×4). Shared by both sizes.
function apSingleDims(key,orient){
  const v=AP_SINGLE_VARIANTS[key];
  return orient==='portrait'?{w:v.wIn,h:v.hIn}:{w:v.hIn,h:v.wIn};
}
function toggleApSingleOrient(key){
  const st=AP_SINGLE[key];
  st.orient=(st.orient==='portrait')?'landscape':'portrait';
  const b=st.board;
  if(b){
    const ph=st.photos.find(p=>p.id===b.photoId);
    const dims=apSingleDims(key,st.orient);
    const marginIn=0.5;
    const mx=(marginIn/dims.w)*100, my=(marginIn/dims.h)*100;
    if(ph)Object.assign(b,fitPhotoBox(ph,dims.w/dims.h,mx,my,100-2*mx,100-2*my));
  }
  renderApSingle(key);
}
function renderApSingle(key){
  const variant=AP_SINGLE_VARIANTS[key], st=AP_SINGLE[key], px=variant.prefix;
  renderApSinglePhotoGrid(key);
  const dz=$(px+'-dropUp');
  if(dz&&!dz._wired){dz._wired=true;
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};
    dz.ondragleave=()=>dz.classList.remove('over');
    dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');
      ingestFiles([...e.dataTransfer.files],1200).then(added=>{st.photos.push(...added);renderApSinglePhotoGrid(key)});};
  }
  const wrap=$(px+'-boards'); if(!wrap)return; wrap.innerHTML='';
  const dims=apSingleDims(key,st.orient);
  const marginIn=0.5;
  const MX=(marginIn/dims.w)*100, MY=(marginIn/dims.h)*100;
  const INX=100-2*MX, INY=100-2*MY;
  const board=document.createElement('div'); board.className='artboard';
  board.style.cssText=`width:100%;aspect-ratio:${dims.w}/${dims.h};`;
  const SM=0.5, BL=0.2;
  const smX=(SM/dims.w)*100, smY=(SM/dims.h)*100, blX=(BL/dims.w)*100, blY=(BL/dims.h)*100;
  board.innerHTML=`<div class="safe-area-guide" style="left:${smX}%;top:${smY}%;width:${100-2*smX}%;height:${100-2*smY}%"></div>`+
    `<div class="bleed-guide" style="left:${-blX}%;top:${-blY}%;right:${-blX}%;bottom:${-blY}%"></div>`;
  const rot=document.createElement('div');rot.className='obj-del';rot.title='Rotate orientation';rot.textContent='⟲';
  rot.style.cssText+='top:6px;left:6px;right:auto;';
  rot.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
  rot.onclick=e=>{e.stopPropagation();toggleApSingleOrient(key)};
  board.appendChild(rot);
  const b=st.board;
  if(b){
    const ph=st.photos.find(p=>p.id===b.photoId);
    if(b.x===undefined)Object.assign(b,ph?fitPhotoBox(ph,dims.w/dims.h,MX,MY,INX,INY):{x:MX,y:MY,w:INX,h:INY});
    const im=document.createElement('div');im.className='img-obj';im.style.cssText=`left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%`;
    if(ph){const img=document.createElement('img');img.src=ph.url;im.appendChild(img);}
    board.appendChild(im);
    const dpiEl=dpiWarningEl(computePrintDpi(ph,dims.w,dims.h,b)); if(dpiEl)board.appendChild(dpiEl);
    const del=document.createElement('div');del.className='obj-del';del.textContent='×';del.style.cssText+='top:6px;right:6px';
    del.onmousedown=e=>{e.preventDefault();e.stopPropagation()};
    del.onclick=e=>{e.stopPropagation();st.board=null;renderApSingle(key)};board.appendChild(del);
    const targets={xs:[0,50,100,MX,MX+INX],ys:[0,50,100,MY,MY+INY]};
    const clearG=()=>board.querySelectorAll('.snap-line').forEach(l=>l.style.display='none');
    const showG=(axis,pos)=>{let line=board.querySelector('.snap-line.'+axis);
      if(!line){line=document.createElement('div');line.className='snap-line '+axis;board.appendChild(line);}
      if(axis==='v')line.style.left=pos+'%';else line.style.top=pos+'%'; line.style.display='block';};
    const snap=(val,size,arr,axis)=>{const edges=[val,val+size/2,val+size];let best=null,bestDelta=1.5,bestGuide=null;
      edges.forEach((edge,idx)=>{arr.forEach(t=>{const delta=Math.abs(edge-t);if(delta<bestDelta){bestDelta=delta;bestGuide=t;best=idx===0?t:idx===1?t-size/2:t-size;}});});
      if(best!==null)showG(axis,bestGuide); return best!==null?best:val;};
    im.onmousedown=e=>{if((e.target.classList&&e.target.classList.contains('rh'))||(e.target.classList&&e.target.classList.contains('obj-del')))return;
      e.preventDefault();e.stopPropagation();
      const rect=board.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=b.x,oy=b.y;
      const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;
        let nx=ox+dx,ny=oy+dy; clearG();
        if(!ev.altKey){nx=snap(nx,b.w,targets.xs,'v');ny=snap(ny,b.h,targets.ys,'h');}
        b.x=nx;b.y=ny;im.style.left=b.x+'%';im.style.top=b.y+'%';};
      const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);clearG();};
      window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);};
    wireArtBoardResize(im,board,b,targets,()=>renderApSingle(key));
  }else{
    const ph=document.createElement('div');ph.style.cssText='position:absolute;inset:'+MY+'% '+MX+'%;display:flex;align-items:center;justify-content:center;color:var(--slate-l);font-size:12px;text-align:center;pointer-events:none';
    ph.textContent=`Drop a photo here — ${dims.w}″×${dims.h}″, 0.5″ safe margin`;board.appendChild(ph);
  }
  board.ondragover=e=>e.preventDefault();
  board.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('photo');if(!id)return;
    const ph=st.photos.find(p=>p.id===id);
    st.board=Object.assign({photoId:id},ph?fitPhotoBox(ph,dims.w/dims.h,MX,MY,INX,INY):{x:MX,y:MY,w:INX,h:INY});
    renderApSingle(key)};
  board.onclick=()=>{if(window._apArmed){const id=window._apArmed;const ph=st.photos.find(p=>p.id===id);
    st.board=Object.assign({photoId:id},ph?fitPhotoBox(ph,dims.w/dims.h,MX,MY,INX,INY):{x:MX,y:MY,w:INX,h:INY});
    window._apArmed=null;renderApSingle(key);}};
  wrap.appendChild(board);
}
function renderApPhotoGrid(){
  const g=$('ap-photoGrid'); if(!g)return; g.innerHTML='';
  AP.photos.forEach(ph=>{const d=document.createElement('div');d.className='photo-th'+(window._apArmed===ph.id?' armed':'');
    d.style.backgroundImage=`url(${ph.url})`;d.draggable=true;
    d.ondragstart=e=>e.dataTransfer.setData('photo',ph.id);
    d.onclick=()=>{window._apArmed=window._apArmed===ph.id?null:ph.id;renderApPhotoGrid();if(window._apArmed)toast('Armed — click a board to place')};
    g.appendChild(d)});
}
function renderApSinglePhotoGrid(key){
  const variant=AP_SINGLE_VARIANTS[key], st=AP_SINGLE[key];
  const g=$(variant.prefix+'-photoGrid'); if(!g)return; g.innerHTML='';
  st.photos.forEach(ph=>{const d=document.createElement('div');d.className='photo-th'+(window._apArmed===ph.id?' armed':'');
    d.style.backgroundImage=`url(${ph.url})`;d.draggable=true;
    d.ondragstart=e=>e.dataTransfer.setData('photo',ph.id);
    d.onclick=()=>{window._apArmed=window._apArmed===ph.id?null:ph.id;renderApSinglePhotoGrid(key);if(window._apArmed)toast('Armed — click the board to place')};
    g.appendChild(d)});
}
/* ================= CMS — Supabase-backed content store =================
   All admin-editable content (copy, store products, blog posts, clients,
   site config) is saved to the public.cms table so every visitor sees
   the same content instantly, from any device.
   localStorage is kept as a fast local cache so pages load without
   waiting for a network round-trip.                                      */

async function cmsGet(key, fallback){
  // Try local cache first (instant)
  const cached = loadJSON('cms_'+key, null);
  if(cached !== null) return cached;
  // Fetch from Supabase
  try{
    const {data, error} = await sb.from('cms').select('value').eq('key', key).single();
    if(error || !data) return fallback;
    saveJSON('cms_'+key, data.value); // cache locally
    return data.value;
  } catch(e){ return fallback; }
}

// Tracks keys with a local change Supabase hasn't confirmed yet. As long as a key is "dirty",
// cmsLoadAll will never overwrite its local copy — even if Supabase returns something for that
// key — because that returned value could be stale (the write that should have updated it may
// have failed). This is what actually stops "publish a post, refresh, and it's gone": that
// symptom is stale cloud data clobbering a newer local copy on load, not the local copy itself
// being lost.
function cmsMarkDirty(key){ try{ localStorage.setItem('cms_dirty_'+key, String(Date.now())); localStorage.setItem('cms_lastwrite_'+key, String(Date.now())); }catch(e){} }
function cmsMarkClean(key){ try{ localStorage.removeItem('cms_dirty_'+key); }catch(e){} }
function cmsIsDirty(key){ try{ return !!localStorage.getItem('cms_dirty_'+key); }catch(e){ return false; } }
function cmsLastWrite(key){ try{ return parseInt(localStorage.getItem('cms_lastwrite_'+key)||'0',10); }catch(e){ return 0; } }
let CMS_LAST_ERROR={}; // key -> last real error message from Supabase, so it can be shown, not just logged
try{ CMS_LAST_ERROR=loadJSON('cms_last_error',{}); }catch(e){}
const _cmsSetPending={}; // key -> {value, resolvers:[], timer}
async function cmsSet(key, value){
  cmsMarkDirty(key);
  return new Promise(resolve=>{
    if(_cmsSetPending[key]){
      clearTimeout(_cmsSetPending[key].timer);
      _cmsSetPending[key].value=value;
      _cmsSetPending[key].resolvers.push(resolve);
    }else{
      _cmsSetPending[key]={value,resolvers:[resolve]};
    }
    _cmsSetPending[key].timer=setTimeout(async()=>{
      const {value:finalValue,resolvers}=_cmsSetPending[key];
      delete _cmsSetPending[key];
      const {error}=await sb.from('cms').upsert({key,value:finalValue},{onConflict:'key'});
      let ok;
      if(error){
        console.warn('CMS save failed:',error.message);
        CMS_LAST_ERROR[key]=error.message||String(error);
        saveJSON('cms_last_error',CMS_LAST_ERROR);
        ok=false;
      }else{
        saveJSON('cms_'+key,finalValue);
        cmsMarkClean(key);
        delete CMS_LAST_ERROR[key];
        saveJSON('cms_last_error',CMS_LAST_ERROR);
        ok=true;
      }
      refreshCmsSyncBanner();
      resolvers.forEach(r=>r(ok));
    },600);
  });
}
// Retries any key that failed to sync last time (or the browser closed before it finished),
// so a transient failure heals itself on the next visit instead of staying broken forever.
async function cmsRetryDirtyKeys(){
  for(const key of CMS_KNOWN_KEYS){
    if(!cmsIsDirty(key))continue;
    const local=loadJSON('cms_'+key,null); if(local==null)continue;
    console.warn(`Retrying previously-failed sync for "${key}"…`);
    await cmsSet(key, local);
  }
  refreshCmsSyncBanner();
}
const CMS_KEY_LABELS={content:'Site text/images',catalog:'Store products',posts:'Kagaz Journal posts',clients:'Clients list',site_cfg:'Site settings',faq:'FAQ'};
function refreshCmsSyncBanner(){
  const banner=$('cmsSyncBanner'); if(!banner)return;
  const stuck=CMS_KNOWN_KEYS.filter(k=>cmsIsDirty(k));
  if(!stuck.length){ banner.style.display='none'; return; }
  const names=stuck.map(k=>CMS_KEY_LABELS[k]||k).join(', ');
  const errs=stuck.filter(k=>CMS_LAST_ERROR[k]).map(k=>`${CMS_KEY_LABELS[k]||k}: ${CMS_LAST_ERROR[k]}`);
  const errLine=errs.length?`<br><span style="font-family:monospace;font-size:12px;opacity:.85">${esc(errs.join(' · '))}</span>`:'';
  $('cmsSyncBannerText').innerHTML=`⚠ ${esc(names)} — saved on this device only, hasn't reached the shared database yet. It will keep retrying automatically, or click Retry now.${errLine}`;
  const copyBtn=$('cmsSyncBannerCopy');
  if(copyBtn)copyBtn.style.display=errs.length?'inline-flex':'none';
  banner.style.display='flex';
}
function copyCmsSyncError(){
  const text=Object.entries(CMS_LAST_ERROR).map(([k,v])=>`${CMS_KEY_LABELS[k]||k}: ${v}`).join('\n')||'No error captured.';
  navigator.clipboard?.writeText(text).then(()=>toast('Error copied — paste it to Claude')).catch(()=>alert(text));
}

async function cmsClearCache(key){
  try{ localStorage.removeItem('cms_'+key); } catch(e){}
}

// Load ALL cms keys at startup in one query — fast, single round trip
const CMS_KNOWN_KEYS=['content','catalog','posts','clients','site_cfg','faq','photo_services','gallery'];
async function cmsLoadAll(){
  const fetchStartedAt = Date.now(); // captured BEFORE asking Supabase, so we can tell if a
  // local write happened while this request was in flight — see below.
  const fetched={}; // key -> value, straight from Supabase — the caller uses THIS directly,
  // never a re-read from localStorage. Local caching below is purely a speed optimization for
  // the next page load; if it silently fails (quota, private-browsing limits, anything), the
  // app still works correctly this session because it isn't depending on the cache round-trip
  // to know what Supabase actually has. That round-trip dependency was the real bug: previously,
  // if saveJSON() failed silently while writing the fetched data back to localStorage, the app
  // had no fallback and would keep showing old/empty data forever, even though the fetch itself
  // had succeeded moments earlier and the correct data was sitting right there in memory.
  try{
    const {data, error} = await sb.from('cms').select('key, value');
    if(error){
      console.warn('CMS load failed — is the `cms` table set up? (see cms-setup.sql)', error.message);
      window._cmsLoadFailed = error.message;
      return fetched;
    }
    if(!data) return fetched;
    // Only ever trust something Supabase actually confirms it has — and never let a key with a
    // local write newer than when THIS request started be overridden by this response. That
    // matters even when the key isn't currently "dirty": if a publish starts and finishes
    // entirely while this fetch is still in flight, the dirty flag gets cleared by that
    // successful publish — but the answer this slow, already-in-flight request eventually
    // delivers was still asked BEFORE that publish happened, so it can't possibly reflect it.
    // A key Supabase doesn't return at all (temporary hiccup, RLS blip, slow row) is likewise
    // never treated as "the local copy must be wrong" — that used to auto-delete local data for
    // any key missing from the response, which could permanently wipe out real content that
    // only ever existed safely in the browser.
    data.forEach(row => {
      if(cmsIsDirty(row.key)) return;
      if(cmsLastWrite(row.key) > fetchStartedAt) return; // a newer local write raced ahead of this fetch
      fetched[row.key]=row.value;
      if(!saveJSON('cms_'+row.key, row.value)){
        console.warn(`Couldn't cache "${row.key}" locally (storage full?) — using the fetched copy directly this session; this will keep re-fetching from the shared database until local caching succeeds.`);
      }
    });
    cmsRetryDirtyKeys();
  } catch(e){
    console.warn('CMS load failed (offline or unreachable) — local cache will be used:', e.message||e);
    window._cmsLoadFailed = e.message||String(e);
  }
  return fetched;
}

/* ================= CONTENT (editable homepage/publish copy) ================= */
const CONTENT_DEFAULTS={
  heroImageUrl:'',
  scanHeroImageUrl:'',
  storeHeroImageUrl:'',
  photographyHeading:'Photography Services',
  photographyIntro:'Specialist photography across four disciplines — browse a category to see the work.',
  photographyLeadImageUrl:'',
  photographyLeadCaption:'Recent work across architecture, editorial, and corporate photography',
  homeSecondaryImageUrl:'',
  photobookTileImageUrl:'',
  tradebookTileImageUrl:'',
  artprintsTileImageUrl:'',
  isbnImageUrl:'',
  photobookTileTitle:'Photobook',
  photobookTileDesc:'8.5″ × 8.5″ layflat books. Free-form layout, AI auto-arrange, rich text with any Google Font.',
  tradebookTileTitle:'Trade Book',
  tradebookTileDesc:'5.5″ × 8″ novel-format books. Monochrome imagery, vector text, classic serif typography.',
  artprintsTileTitle:'Art Prints',
  artprintsTileDesc:'6″ × 4″ gallery prints. Four museum-style prints on archival grade paper.',
  pricingHeading:'Simple Pricing',
  pricingLead:'Every price below already includes delivery anywhere in India. No hidden charges at checkout.',
  startPhotobookNeed:'Your photos — as many as you like; plan roughly 1–3 per page\nA rough sense of order (you can always rearrange later in the editor)\nOptional: a title and any captions',
  startPhotobookSteps:'Upload your photos | Drag them in, or let AI auto-arrange a first pass across every spread.\nDesign each spread | Rearrange, resize, and add text — free-form, page by page.\nChoose your cover | Pick a linen colour and set a foil-style title.\nOrder & print | We print and bind it layflat, then ship — 5–7 working days.',
  startTradebookNeed:'Your manuscript — paste or type it in; formatting carries over\nA working title (you can change it any time before ordering)\nOptional: cover art, or use one of the built-in cover styles',
  startTradebookSteps:'Add your manuscript | Paste your text in — chapters, headings, and paragraphs are detected automatically.\nSet your typography | Classic serif text, sized and spaced for a real paperback trim.\nDesign your cover | Full wraparound cover with a spine sized to your exact page count.\nOrder & print | We print and perfect-bind it, then ship — 5–7 working days.',
  startArtprintsNeed:'Four photos you want printed\nA preference for landscape framing — that\'s the print orientation',
  startArtprintsSteps:'Choose your 4 photos | Upload the images you want printed.\nSet the crop | Position and crop each one to fit the 6″ × 4″ frame.\nPreview your set | Check all four before confirming.\nOrder & print | We print on archival stock, then ship — 5–7 working days.',
  storeIntro:'The finishing pieces for your books and prints — made in-house, ready to ship.',
  startPhotobookIntro:'Everything worth knowing before you lay out your first spread — trim size, page limits, image resolution, and how the free-form editor works.',
  startTradebookIntro:'Everything worth knowing before you drop in your manuscript — trim size, page limits, typography, and how ISBN and cover design work.',
  startArtprintsIntro:'Everything worth knowing before you pick your four images — print size, paper, and how orientation and cropping work.',
  storeBooksTagline:'Linen covers, archival sleeves, and gifting editions — finishing touches for every Binder book.',
  storePhotoTagline:'Loose prints and framing-ready editions, pulled on 300gsm archival stock.',
  heroHeading:"It's your moment, live it.",
  heroBody:'A publishing platform for everyone. Publish photobooks, novel-grade trade books, and gallery art prints, all professional grade.',
  publishHeading:'The basics of Binder photobooks',
  publishBody:'<p>Every Binder book is printed on 250gsm matte art paper, bound layflat, and colour-checked before it ships. We work in small batches out of Delhi, so every order gets a proof review before it goes to press.</p>',
  scanHeading:'Professional image digitisation, delivered to your door',
  scanSubhead:'High-resolution scans of your prints, negatives, slides, and documents — 600 DPI archival quality, colour-calibrated, delivered as TIFF (Highest Resolution).',
  scanPickup:'We collect your prints or negatives from your home or office anywhere in Delhi NCR — including Delhi, Gurugram, Noida, Faridabad, and Ghaziabad. Every collection is logged, photographed, and handed back in the same condition.',
  isbnTitle:'Free ISBN | 5 easy steps',
  isbnBody:`<p>Securing an International Standard Book Number (ISBN) is a crucial step for any author looking to formally publish and distribute their work. If you are based in India, the government provides ISBNs completely free of charge through the Raja Rammohun Roy National Agency.</p>
<h2>Step 1: Register on the Portal</h2>
<p>Visit the official website at isbn.gov.in. Click on "Applicant registration." Choose whether you are applying as an individual (self-publishing author) or an institutional publisher.</p>
<h2>Step 2: Complete Your Profile</h2>
<p>Fill in your personal details and upload clear, scanned copies of your identity proof (such as a PAN or Aadhaar card) and address proof. Once submitted, you will receive your username and password via email.</p>
<h2>Step 3: Submit a New Application</h2>
<p>Log in to your new account and click "Apply for New Application." You will need to provide specific metadata about your upcoming book, including the title, author name, format (e.g., paperback, hardcover, or ebook), language, and page count.</p>
<h2>Step 4: Upload Book Documents</h2>
<p>You will be prompted to upload a draft of your book's title page and the verso (copyright) page. Make sure the publisher name on these pages matches your registration details exactly.</p>
<h2>Step 5: Submit and Track</h2>
<p>Save and submit your application. The manual verification process typically takes a few weeks. You can track your application status directly on the portal. Once approved, your unique 13-digit ISBN and official certificate will be ready to download!</p>`
};
let CONTENT={...CONTENT_DEFAULTS,...loadJSON('cms_content', loadJSON('binder_content',{}))};
function saveContent(){
  saveJSON('cms_content',CONTENT);
  cmsSet('content', CONTENT).then(ok => { toast(ok?'Content saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet'); });
}
// Scans rendered rich text for font-family declarations (from the RTE's font picker) and loads
// each one via Google Fonts — without this, a font chosen in the editor would only ever render
// correctly there, and fall back to the browser default for every actual site visitor.
function ensureFontsForHtml(html){
  if(!html)return;
  // The stored HTML has its style attribute quotes HTML-entity-encoded (browsers serialize
  // multi-word font-family values as "Font Name", and that " becomes &quot; once it's inside
  // an already-quote-delimited HTML attribute) — match &quot;, straight ", and ' so this works
  // regardless of which form ends up in the saved content.
  const re=/font-family:\s*(?:&quot;|['"])([^'"&]+?)(?:&quot;|['"])/g; let m;
  while((m=re.exec(html)))loadGoogleFont(m[1].trim());
}
function applyContent(){
  document.querySelectorAll('[data-c]').forEach(el=>{const k=el.dataset.c;if(!(k in CONTENT))return;
    if(el.dataset.cHtml){el.innerHTML=CONTENT[k];ensureFontsForHtml(CONTENT[k]);}else el.textContent=CONTENT[k];});
  // Images work the same way, via data-c-img="<CONTENT key>" — falls back to whatever src/background
  // is already in the markup until an admin uploads a replacement, so nothing breaks pre-upload.
  // If the stored URL is a video, and this element has an adjacent <video data-c-img-video="key">
  // sibling, that sibling is shown instead and the img is hidden — otherwise images-only elements
  // are left untouched so a video upload there simply doesn't change anything visible yet.
  document.querySelectorAll('[data-c-img]').forEach(el=>{const k=el.dataset.cImg;const url=CONTENT[k];if(!url)return;
    if(el.tagName==='IMG'){
      const vidSibling=document.querySelector(`video[data-c-img-video="${k}"]`);
      if(vidSibling&&isVideoUrl(url)){
        vidSibling.src=url;vidSibling.style.display='block';vidSibling.play().catch(()=>{});
        el.style.display='none';
      }else{
        if(vidSibling)vidSibling.style.display='none';
        el.src=url;el.style.display='';
      }
    }else el.style.backgroundImage=`url(${url})`;});
}

/* ---- Site Config (colours, contact, footer, social) ---- */
let SITE_CFG=loadJSON('cms_site_cfg',{accentColor:'#52B57D',siteFont:'',headingWeight:'300',contactEmail:'',contactPhone:'',instagram:'',twitter:'',facebook:'',whatsapp:'',footerTagline:'',address:''});
function saveSiteCfg(){
  SITE_CFG.contactEmail=($('cfgContactEmail')||{value:''}).value.trim();
  SITE_CFG.contactPhone=($('cfgContactPhone')||{value:''}).value.trim();
  SITE_CFG.instagram=($('cfgInstagram')||{value:''}).value.trim();
  SITE_CFG.twitter=($('cfgTwitter')||{value:''}).value.trim();
  SITE_CFG.facebook=($('cfgFacebook')||{value:''}).value.trim();
  SITE_CFG.whatsapp=($('cfgWhatsapp')||{value:''}).value.trim();
  SITE_CFG.footerTagline=($('cfgFooterTagline')||{value:''}).value.trim();
  SITE_CFG.address=($('cfgAddress')||{value:''}).value.trim();
  saveJSON('cms_site_cfg',SITE_CFG);
  applySiteCfgToPublicSite();
  cmsSet('site_cfg',SITE_CFG).then(ok=>{toast(ok?'Saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet');});
}
function applySiteColor(type,val){
  if(!val||!/^#[0-9a-fA-F]{3,6}$/.test(val.trim()))return;
  const hex=val.trim();
  if(type==='accent'){
    SITE_CFG.accentColor=hex;
    document.documentElement.style.setProperty('--accent',hex);
    // derive hover (darken ~15%)
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const dk=h=>('#'+[Math.max(0,Math.round(h[0]*0.85)),Math.max(0,Math.round(h[1]*0.85)),Math.max(0,Math.round(h[2]*0.85))].map(x=>x.toString(16).padStart(2,'0')).join(''));
    document.documentElement.style.setProperty('--accent-d',dk([r,g,b]));
    saveJSON('cms_site_cfg',SITE_CFG);
    cmsSet('site_cfg',SITE_CFG).then(ok=>{toast(ok?'Saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet');});
    if($('cfgAccentHex'))$('cfgAccentHex').value=hex;
    if($('cfgAccentColor'))$('cfgAccentColor').value=hex;
  }
}
function applySiteFont(family){
  SITE_CFG.siteFont=family;
  if(family){
    loadGoogleFont(family);
    document.body.style.fontFamily=`'${family}', sans-serif`;
  } else {
    document.body.style.fontFamily='';
  }
  saveJSON('cms_site_cfg',SITE_CFG);
  cmsSet('site_cfg',SITE_CFG).then(ok=>{toast(ok?'Saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet');});
}
function applyHeadingWeight(weight){
  SITE_CFG.headingWeight=weight;
  document.documentElement.style.setProperty('--h1-weight',weight||300);
  saveJSON('cms_site_cfg',SITE_CFG);
  cmsSet('site_cfg',SITE_CFG).then(ok=>{toast(ok?'Saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet');});
}
// Applies Site Config to the actual public-facing footer — previously the "Contact & Social"
// admin panel saved correctly but nothing on the live site ever read those values, so the footer
// showed permanently hardcoded text and no social links regardless of what was configured. Also
// keeps the LocalBusiness JSON-LD's sameAs array in sync with these same real URLs — Google's own
// guidance is that sameAs links should be genuinely present and crawlable on the page, not just
// claimed in structured data, so this and the visible footer links are deliberately the same data.
function applySiteCfgToPublicSite(){
  const copyEl=$('footerCopy');
  if(copyEl){
    const tagline=SITE_CFG.footerTagline||'© 2026 Binder. All rights reserved.';
    const address=SITE_CFG.address||'A291/1, Okhla Phase I, Delhi – 110020';
    const email=SITE_CFG.contactEmail||'info@binder.co.in';
    copyEl.textContent=`${tagline} · ${address} · ${email}`;
  }
  const socialWrap=$('footerSocial');
  if(socialWrap){
    const links=[];
    if(SITE_CFG.instagram)links.push(`<a href="${esc(SITE_CFG.instagram)}" target="_blank" rel="me noopener">Instagram</a>`);
    if(SITE_CFG.facebook)links.push(`<a href="${esc(SITE_CFG.facebook)}" target="_blank" rel="me noopener">Facebook</a>`);
    if(SITE_CFG.twitter)links.push(`<a href="${esc(SITE_CFG.twitter)}" target="_blank" rel="me noopener">X / Twitter</a>`);
    socialWrap.innerHTML=links.join('');
    socialWrap.style.display=links.length?'flex':'none';
  }
  const ld=$('ldBusiness');
  if(ld){
    try{
      const data=JSON.parse(ld.textContent);
      data.sameAs=[SITE_CFG.instagram,SITE_CFG.facebook,SITE_CFG.twitter].filter(Boolean);
      if(SITE_CFG.contactPhone)data.telephone=SITE_CFG.contactPhone;
      if(SITE_CFG.contactEmail)data.email=SITE_CFG.contactEmail;
      if(SITE_CFG.address)data.address.streetAddress=SITE_CFG.address;
      ld.textContent=JSON.stringify(data);
    }catch(e){console.warn('Could not update LocalBusiness schema:',e.message||e);}
  }
}
function loadSiteCfgIntoAdmin(){
  if($('cfgAccentColor'))$('cfgAccentColor').value=SITE_CFG.accentColor||'#52B57D';
  if($('cfgAccentHex'))$('cfgAccentHex').value=SITE_CFG.accentColor||'#52B57D';
  if($('cfgSiteFont'))$('cfgSiteFont').value=SITE_CFG.siteFont||'';
  if($('cfgHeadingWeight'))$('cfgHeadingWeight').value=SITE_CFG.headingWeight||'300';
  if($('cfgContactEmail'))$('cfgContactEmail').value=SITE_CFG.contactEmail||'';
  if($('cfgContactPhone'))$('cfgContactPhone').value=SITE_CFG.contactPhone||'';
  if($('cfgInstagram'))$('cfgInstagram').value=SITE_CFG.instagram||'';
  if($('cfgTwitter'))$('cfgTwitter').value=SITE_CFG.twitter||'';
  if($('cfgFacebook'))$('cfgFacebook').value=SITE_CFG.facebook||'';
  if($('cfgWhatsapp'))$('cfgWhatsapp').value=SITE_CFG.whatsapp||'';
  if($('cfgFooterTagline'))$('cfgFooterTagline').value=SITE_CFG.footerTagline||'';
  if($('cfgAddress'))$('cfgAddress').value=SITE_CFG.address||'';
}
// Apply saved config on load
(function initSiteCfg(){
  if(SITE_CFG.accentColor)applySiteColor('accent',SITE_CFG.accentColor);
  if(SITE_CFG.siteFont)applySiteFont(SITE_CFG.siteFont);
  if(SITE_CFG.headingWeight)applyHeadingWeight(SITE_CFG.headingWeight);
})();
let S={user:null,orders:loadJSON('binder_orders',[]),cart:loadJSON('binder_cart',[])};
async function restoreSession(){
  const {data:{session}}=await sb.auth.getSession();
  if(session&&session.user){
    S.user={id:session.user.id,name:session.user.user_metadata?.name||session.user.email.split('@')[0],email:session.user.email,since:session.user.created_at||null};
  }
  syncAuthLink();
}
sb.auth.onAuthStateChange((event,session)=>{
  if(session&&session.user){S.user={id:session.user.id,name:session.user.user_metadata?.name||session.user.email.split('@')[0],email:session.user.email,since:session.user.created_at||null};}
  else{S.user=null;}
  syncAuthLink();
});
function syncAuthLink(){
  const btn=$('authLink');
  const dd=$('userMenuDropdown');
  const wrap=$('userMenuWrap');
  if(!btn||!dd)return;
  if(S.user){
    btn.innerHTML=`${S.user.name.split(' ')[0]} ▾`;
    btn.classList.add('signed-in');
    if(wrap)wrap.classList.add('signed-in');
    dd.innerHTML=`
      <div class="user-menu-head">
        <b>${esc(S.user.name)}</b>
        <span>${esc(S.user.email)}</span>
      </div>
      <button class="user-menu-item" onclick="closeUserMenu();openMyDashboard()">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="#52B57D" stroke-width="1.5"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="#52B57D" stroke-width="1.5"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="#52B57D" stroke-width="1.5"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="#52B57D" stroke-width="1.5"/></svg> My Dashboard
      </button>
      <button class="user-menu-item" onclick="closeUserMenu();go('dashboard');dashGo('orders')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="1" width="11" height="13" rx="1.5" stroke="#52B57D" stroke-width="1.5"/><path d="M5 5h5M5 7.5h5M5 10h3" stroke="#52B57D" stroke-width="1.4" stroke-linecap="round"/></svg> My Orders
      </button>
      <button class="user-menu-item" onclick="closeUserMenu();go('dashboard');dashGo('projects')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5.5V12a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 13.5 12V5.5h-12z" stroke="#52B57D" stroke-width="1.5"/><path d="M1.5 5.5V4a1.5 1.5 0 0 1 1.5-1.5H6L7.5 4H13a.5.5 0 0 1 .5.5v1h-12z" stroke="#52B57D" stroke-width="1.5" stroke-linejoin="round"/></svg> My Projects
      </button>
      <button class="user-menu-item" onclick="closeUserMenu();openCart()">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5h2l2 7h6.5l1.5-5H5" stroke="#52B57D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="12.5" r="1" fill="#52B57D"/><circle cx="11" cy="12.5" r="1" fill="#52B57D"/></svg> Cart
      </button>
      <div class="user-menu-sep"></div>
      <button class="user-menu-item" onclick="closeUserMenu();go('dashboard');dashGo('account')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7.5" cy="7.5" r="2" stroke="#52B57D" stroke-width="1.5"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M3.2 11.8l1-1M10.8 4.2l1-1" stroke="#52B57D" stroke-width="1.4" stroke-linecap="round"/></svg> Account settings
      </button>
      <button class="user-menu-item danger" onclick="closeUserMenu();doLogout()">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 5l3 2.5L10 10M13 7.5H6M6 2H3a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 3 13h3" stroke="#52B57D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Log out
      </button>`;
  } else {
    btn.innerHTML='Sign in';
    btn.classList.remove('signed-in');
    if(wrap)wrap.classList.remove('signed-in');
    dd.innerHTML=`
      <button class="user-menu-item" onclick="closeUserMenu();openAuth()">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7.5" cy="5" r="2.5" stroke="#52B57D" stroke-width="1.5"/><path d="M2.5 13.5a5 5 0 0 1 10 0" stroke="#52B57D" stroke-width="1.5" stroke-linecap="round"/></svg> Sign in
      </button>
      <button class="user-menu-item" onclick="closeUserMenu();authGo('signup');show('authModal')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1.5l1.6 4.9H14l-4 2.9 1.5 4.7-4-2.9-4 2.9 1.5-4.7-4-2.9h4.9z" stroke="#52B57D" stroke-width="1.4" stroke-linejoin="round"/></svg> Create account
      </button>`;
  }
}
function toggleUserMenu(){
  const dd=$('userMenuDropdown');
  if(!dd)return;
  if(S.user===null){ openAuth(); return; } // not signed in — open auth modal directly
  dd.classList.toggle('open');
}
function closeUserMenu(){const dd=$('userMenuDropdown');if(dd)dd.classList.remove('open');}
// Close on outside click
document.addEventListener('click',e=>{
  const wrap=$('userMenuWrap');
  if(wrap&&!wrap.contains(e.target))closeUserMenu();
});
const NAV_ICON_HAMBURGER='<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h12M3 9h12M3 13h12" stroke="#52B57D" stroke-width="1.7" stroke-linecap="round"/></svg>';
const NAV_ICON_CLOSE='<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4l10 10M14 4L4 14" stroke="#52B57D" stroke-width="1.7" stroke-linecap="round"/></svg>';
function toggleNavMenu(){
  const m=$('navMenu'),btn=$('navToggleBtn');
  const open=m.classList.toggle('open');
  // innerHTML (not textContent) — swapping to plain text here would permanently replace
  // the branded SVG hamburger icon with a generic Unicode glyph after the first tap.
  if(btn)btn.innerHTML=open?NAV_ICON_CLOSE:NAV_ICON_HAMBURGER;
}
(()=>{const m=document.getElementById('navMenu');if(!m)return;
  m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    m.classList.remove('open');
    const btn=document.getElementById('navToggleBtn'); if(btn)btn.innerHTML=NAV_ICON_HAMBURGER;
  }));
  // Tapping anywhere outside the open mobile menu closes it too, not just picking a link.
  document.addEventListener('click',(e)=>{
    if(!m.classList.contains('open'))return;
    const btn=document.getElementById('navToggleBtn');
    if(m.contains(e.target)||(btn&&btn.contains(e.target)))return;
    m.classList.remove('open'); if(btn)btn.innerHTML=NAV_ICON_HAMBURGER;
  });
})();
function navHome(){
  if(ACTIVE_EDITOR){
    if(!S.user){
      // Not logged in — prompt to sign in to save
      if(confirm('Sign in to save your project before leaving?\n\nClick OK to sign in, Cancel to leave without saving.')){
        authGo('login'); show('authModal'); return;
      }
      exitEditor(); go('home'); return;
    }
    // Logged in — auto-save then go home
    saveCurrentProject().then(()=>{ exitEditor(); go('home'); }).catch(()=>{ exitEditor(); go('home'); });
    return;
  }
  go('home');
}
function openAuth(){if(S.user){go('dashboard');return}authGo('login');show('authModal');}
function openMyDashboard(){
  if(!S.user){authGo('login');show('authModal');toast('Sign in to view your dashboard');return}
  ACTIVE_EDITOR=null;
  go('dashboard');
}
function authGo(v){['login','signup','reset','newpass'].forEach(x=>$('authView-'+x).style.display=x===v?'block':'none');}
async function doSignup(){
  const name=$('suName').value.trim(),email=$('suEmail').value.trim(),pass=$('suPass').value;
  if(!name)return toast('Enter your name'); if(!/.+@.+\..+/.test(email))return toast('Enter a valid email');
  if(pass.length<6)return toast('Password needs 6+ characters');
  const {data,error}=await sb.auth.signUp({email,password:pass,options:{data:{name}}});
  if(error){toast(error.message);return}
  if(data.user){
    S.user={id:data.user.id,name,email,since:data.user.created_at||new Date().toISOString()};
    sb.from('profiles').upsert({id:data.user.id,name,email,created_at:new Date().toISOString()}).then(()=>{});
  }
  syncAuthLink();hide('authModal');
  toast(data.session?('Welcome to Binder, '+name.split(' ')[0]):'Check your email to confirm your account.');
  resumePendingEditor();
}
async function doLogin(){
  const email=$('loginEmail').value.trim(),pass=$('loginPass').value;
  const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){toast(error.message);return}
  S.user={id:data.user.id,name:data.user.user_metadata?.name||email.split('@')[0],email,since:data.user.created_at||null};
  syncAuthLink();hide('authModal');toast('Welcome back, '+S.user.name.split(' ')[0]);
  resumePendingEditor();
}
function resumePendingEditor(){
  if(window._pendingSave){window._pendingSave=null;saveCurrentProject();return;}
  if(window._pendingEditor){const k=window._pendingEditor;window._pendingEditor=null;openEditor(k);}
}

/* ---------- Per-user saved projects (Photobook / Trade Book / Art Prints) — stored in Supabase ---------- */
function projectLabel(type){return{photobook:'Photobook',photobook12:'Photobook (12×12)',photobook18:'Photobook (12×18)',tradebook:'Trade Book',artprints:'Art Prints',artprint12x18:'Art Print (12×18)',artprint16x20:'Art Print (16×20)'}[type]||type}
function collectUsedPhotoIds(doc){
  const ids=new Set();
  [doc.cover,doc.backCover,doc.spine,...(doc.pages||[])].forEach(p=>{if(!p)return;
    p.images.forEach(im=>ids.add(im.photo));
    (p.shapes||[]).forEach(sh=>{if(sh.photo)ids.add(sh.photo)});
  });
  return ids;
}
/* ---------- Project thumbnails ----------
   Books/photobooks: a real render of the front cover via the same pipeline the
   PDF proofs use. Art prints: the first placed board drawn onto a mini canvas.
   Stored as a small JPEG data URL inside the project row (doc._thumb), so no
   database schema change is needed and it travels with the project. */
function loadImageEl(url){return new Promise((res)=>{const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>res(im);im.onerror=()=>res(null);im.src=url;});}
function downscaleCanvas(src,maxW){
  const scale=Math.min(1,maxW/src.width);
  const c=document.createElement('canvas');c.width=Math.round(src.width*scale);c.height=Math.round(src.height*scale);
  c.getContext('2d').drawImage(src,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',0.78);
}
async function makeProjectThumb(type){
  try{
    if(type==='artprints'){
      const i=AP.boards.findIndex(Boolean);
      if(i<0)return null;
      const b=AP.boards[i], portrait=(AP.orient[i]==='portrait');
      const W=portrait?240:360, H=portrait?360:240;
      const c=document.createElement('canvas');c.width=W;c.height=H;
      const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,W,H);
      const ph=AP.photos.find(p=>p.id===b.photoId);
      if(ph){const img=await loadImageEl(ph.url);
        if(img)x.drawImage(img,b.x/100*W,b.y/100*H,b.w/100*W,b.h/100*H);}
      x.strokeStyle='#E5E5E3';x.strokeRect(0.5,0.5,W-1,H-1);
      return c.toDataURL('image/jpeg',0.8);
    }
    if(AP_SINGLE_VARIANTS[type]){
      const st=AP_SINGLE[type]; const b=st.board;
      if(!b)return null;
      const portrait=st.orient==='portrait';
      const W=portrait?240:360, H=portrait?360:240;
      const c=document.createElement('canvas');c.width=W;c.height=H;
      const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,W,H);
      const ph=st.photos.find(p=>p.id===b.photoId);
      if(ph){const img=await loadImageEl(ph.url);
        if(img)x.drawImage(img,b.x/100*W,b.y/100*H,b.w/100*W,b.h/100*H);}
      x.strokeStyle='#E5E5E3';x.strokeRect(0.5,0.5,W-1,H-1);
      return c.toDataURL('image/jpeg',0.8);
    }
    const ed=EDS[type]; if(!ed||!ed.doc||!ed.doc.cover)return null;
    await ensurePdfLibs();
    const dims=PAGE_DIMS[type]||{w:ed.cfg.pageInW,h:ed.cfg.pageInH,ref:420};
    const map={}; const add=pid=>{if(!pid||map[pid])return;const ph=ed.photos.find(p=>p.id===pid);
      if(ph)map[pid]={url:ph.url,w:ph.w,h:ph.h};};
    (ed.doc.cover.images||[]).forEach(im=>add(im.photo));
    (ed.doc.cover.shapes||[]).forEach(sh=>add(sh.photo));
    const dpi=Math.max(24,Math.round(420/dims.w)); // ~420px wide render, cheap
    const canvas=await pdfPageCanvas(ed.doc.cover,dims,map,dpi,ed.cfg.monochrome,0);
    return downscaleCanvas(canvas,360);
  }catch(e){console.warn('Thumbnail generation failed (saving without one):',e);return null}
}
async function saveCurrentProject(){
  if(!S.user){window._pendingSave=true;window._pendingEditor=ACTIVE_EDITOR;authGo('login');show('authModal');toast('Create a free account to save your project');return}
  const type=ACTIVE_EDITOR; if(!type)return;
  if(PENDING_UPLOADS>0){toast('Still uploading your photos — try Save again in a few seconds.');return}

  let title, doc, photoIds;
  if(type==='artprints'){
    title=AP.title||'Untitled Art Print Set';
    photoIds=new Set(AP.boards.filter(Boolean).map(b=>b.photoId));
    doc={boards:AP.boards,orient:AP.orient};
  }else if(AP_SINGLE_VARIANTS[type]){
    const st=AP_SINGLE[type];
    title=st.title||AP_SINGLE_VARIANTS[type].label;
    photoIds=new Set(st.board?[st.board.photoId]:[]);
    doc={board:st.board,orient:st.orient};
  }else{
    const ed=EDS[type]; title=ed.doc.title; doc=ed.doc; photoIds=collectUsedPhotoIds(doc);
  }
  // Embed a permanent-URL photo map so the project can be rebuilt in a brand new browser session.
  const photoMap={};
  let missing=0;
  photoIds.forEach(pid=>{
    if(!pid)return;
    const permUrl=PHOTO_PERMANENT_URLS[pid];
    const ph=(type==='artprints'?AP.photos:AP_SINGLE_VARIANTS[type]?AP_SINGLE[type].photos:EDS[type].photos).find(p=>p.id===pid);
    if(permUrl)photoMap[pid]={url:permUrl,w:ph?ph.w:0,h:ph?ph.h:0,name:ph?ph.name:''};
    else missing++;
  });
  if(missing>0)toast(missing+' photo(s) haven\'t finished uploading yet — save again shortly to include them.');

  toast('Saving…');
  const thumb=await makeProjectThumb(type);
  const rowDoc=Object.assign({},doc,thumb?{_thumb:thumb}:{});
  const existingId=(type==='artprints'?AP._savedId:AP_SINGLE_VARIANTS[type]?AP_SINGLE[type]._savedId:EDS[type]._savedId);
  const now=new Date();
  const expiresAt=new Date(now.getTime()+45*24*60*60*1000).toISOString();
  const row={user_id:S.user.id,type,title,doc:rowDoc,photo_map:photoMap,updated_at:now.toISOString(),expires_at:expiresAt};
  let error;
  if(existingId){({error}=await sb.from('projects').update(row).eq('id',existingId));}
  else{const {data,error:err}=await sb.from('projects').insert(row).select().single();error=err;
    if(data){if(type==='artprints')AP._savedId=data.id; else if(AP_SINGLE_VARIANTS[type])AP_SINGLE[type]._savedId=data.id; else EDS[type]._savedId=data.id;}}
  if(error){toast('Could not save: '+error.message);return}
  toast('Saved! Your project is stored for 45 days.');
  if(type!=='artprints'&&EDS[type])EDS[type]._dirty=false;
}
async function myProjects(){
  if(!S.user)return[];
  const {data,error}=await sb.from('projects').select('*').eq('user_id',S.user.id).order('updated_at',{ascending:false});
  if(error){console.warn(error);return[]}
  return data||[];
}
async function openSavedProject(id){
  const {data:p,error}=await sb.from('projects').select('*').eq('id',id).single();
  if(error||!p){toast('Could not load that project.');return}
  // Rebuild the photo library for this session from the saved permanent URLs.
  if(p.doc)delete p.doc._thumb; // presentation-only — keep the editor doc clean
  const rebuilt=Object.entries(p.photo_map||{}).map(([pid,info])=>({id:pid,name:info.name,url:info.url,w:info.w,h:info.h,lowRes:false}));
  if(p.type==='artprints'){
    AP.title=p.title; AP.boards=p.doc.boards; AP.orient=p.doc.orient||['landscape','landscape','landscape','landscape']; AP.photos=rebuilt; AP._savedId=p.id; openEditor('artprints');
  }else if(AP_SINGLE_VARIANTS[p.type]){
    const st=AP_SINGLE[p.type];
    st.title=p.title; st.board=p.doc.board||null; st.orient=p.doc.orient||'portrait'; st.photos=rebuilt; st._savedId=p.id; openEditor(p.type);
  }else{
    const ed=EDS[p.type]; ed.doc=p.doc; ed.photos=rebuilt; ed._savedId=p.id;
    if(ed.cfg.hasOrientation)ed.applyOrientation(ed.doc.orientation||ed.cfg.defaultOrientation||'portrait');
    ed.cur=ed.cfg.hasSpine?'coverspread':'cover'; ed.sel=null; openEditor(p.type);
  }
  toast('Reopened "'+p.title+'"');
}
async function deleteSavedProject(id){
  if(!S.user)return; if(!confirm('Remove this project from your account?'))return;
  const {error}=await sb.from('projects').delete().eq('id',id);
  if(error){toast('Could not remove: '+error.message);return}
  renderCustomerDashboard();
}
async function saveAccountInfo(){
  const data={
    name:$('acctName')?.value.trim()||'',
    phone:$('acctPhone')?.value.trim()||'',
    address1:$('acctAddr1')?.value.trim()||'',
    address2:$('acctAddr2')?.value.trim()||'',
    city:$('acctCity')?.value.trim()||'',
    pin:$('acctPin')?.value.trim()||'',
    state:$('acctState')?.value||'',
    gstin:($('acctGstin')?.value.trim()||'').toUpperCase(),
    bizName:$('acctBizName')?.value.trim()||''
  };
  const {error}=await sb.auth.updateUser({data});
  if(error)return toast('Could not save: '+error.message);
  if(S.user)S.user.name=data.name||S.user.name;
  syncAuthLink();
  toast('Account details saved ✓');
}

function loadAccountInfo(){
  if(!S.user)return;
  sb.auth.getUser().then(({data})=>{
    if(!data.user)return;
    const m=data.user.user_metadata||{};
    if($('acctName'))$('acctName').value=m.name||S.user.name||'';
    if($('acctPhone'))$('acctPhone').value=m.phone||'';
    if($('acctAddr1'))$('acctAddr1').value=m.address1||'';
    if($('acctAddr2'))$('acctAddr2').value=m.address2||'';
    if($('acctCity'))$('acctCity').value=m.city||'';
    if($('acctPin'))$('acctPin').value=m.pin||'';
    if($('acctState'))$('acctState').value=m.state||'';
    if($('acctGstin'))$('acctGstin').value=m.gstin||'';
    if($('acctBizName'))$('acctBizName').value=m.bizName||'';
  });
}
async function doChangePassword(){
  const np=$('cpNew').value;
  if(np.length<6)return toast('New password needs 6+ characters');
  const {error}=await sb.auth.updateUser({password:np});
  if(error){toast('Could not change password: '+error.message);return}
  $('cpNew').value='';toast('Password changed.');
}
async function doLogout(){await sb.auth.signOut();S.user=null;syncAuthLink();toast('Signed out');go('home');}
async function doGoogleLogin(){
  const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
  if(error)toast(error.message);
}
/* ---------- Dashboard: tab switching ---------- */
function dashGo(panel){
  document.querySelectorAll('#dashNav a').forEach(a=>a.classList.toggle('active',a.dataset.panel===panel));
  document.querySelectorAll('.dash-panel').forEach(p=>p.classList.toggle('active',p.id==='dashPanel-'+panel));
  if(panel==='account')loadAccountInfo();
  window.scrollTo(0,0);
}

/* ---------- Dashboard: shared renderers ---------- */
function statusPillHTML(status){
  const key=(status||'received').toLowerCase();
  return `<span class="status-pill status-${key}">${esc(status||'Received')}</span>`;
}
const ORDER_ICON={photobook:{bg:'#141414',glyph:'◙'},photobook12:{bg:'#141414',glyph:'◙'},photobook18:{bg:'#141414',glyph:'◙'},tradebook:{bg:'#1B4332',glyph:'◙'},artprints:{bg:'#B0432E',glyph:'▦'},artprint12x18:{bg:'#B0432E',glyph:'▦'},artprint16x20:{bg:'#B0432E',glyph:'▦'},Store:{bg:'#3A3A3C',glyph:'🛍'}};
function orderIconHTML(o){
  const k=ORDER_ICON[o.product]||ORDER_ICON.Store;
  return `<div class="order-icon" style="background:${k.bg}">${k.glyph}</div>`;
}
const PDF_FILE_LABELS={cover:'Cover + spine + back (wrap)',interior:'Book block (interior pages)',artboard:'Artboards (4-up, trim marks)',print:'Print (single sheet, trim marks)'};
function orderCardHTML(o,compact){
  const canReorder=o.product==='photobook'||o.product==='photobook12'||o.product==='photobook18'||o.product==='tradebook'||o.product==='artprints'||o.product==='artprint12x18'||o.product==='artprint16x20';
  const filesHTML=o.pdfFiles?`<ul class="order-files">${Object.entries(o.pdfFiles).map(([name,st])=>`<li><span>${esc(PDF_FILE_LABELS[name]||name)}</span><span>${esc(st)}</span></li>`).join('')}</ul>`:'<p style="font-size:13px;color:var(--slate-l)">No print files on this order.</p>';
  const addonsHTML=(o.addons&&o.addons.length)?`<div class="order-detail-row"><span>Add-ons</span><span>${o.addons.map(a=>esc(a.name)).join(', ')}</span></div>`:'';
  const coupon=o.couponCode||o.coupon_code;
  const couponHTML=coupon?`<div class="order-detail-row"><span>Coupon</span><span>${esc(coupon)} — ₹${(o.discountAmount!=null?o.discountAmount:o.discount_amount)||0} off</span></div>`:'';
  const giftHTML=o.gift?`<div class="order-detail-row" style="align-items:flex-start"><span>🎁 Ships as a gift to</span><span>${esc(o.gift.recipientName)}${o.gift.recipientPhone?' · '+esc(o.gift.recipientPhone):''}<br>${esc(o.gift.address.line1)}${o.gift.address.line2?', '+esc(o.gift.address.line2):''}, ${esc(o.gift.address.city)} ${esc(o.gift.address.pin)}${o.gift.note?'<br><i>"'+esc(o.gift.note)+'"</i>':''}</span></div>`:'';
  const detail=compact?'':`
    <div class="order-card-detail">
      <div class="order-detail-row"><span>Quantity</span><span>${o.qty||1}</span></div>
      <div class="order-detail-row"><span>Print file version</span><span>v${o.pdf_version||1}${(o.pdf_version||1)>1?' · Updated by studio':''}</span></div>
      <div class="order-detail-row"><span>Payment method</span><span>${esc(o.payMethod||o.pay_method||'—')}${(o.paymentId||o.payment_id)?(( o.verified||o.verified)?' · ✓ Verified':' · Unverified'):''}</span></div>
      ${addonsHTML}
      ${couponHTML}
      ${giftHTML}
      <div class="order-detail-row"><span>Print files</span></div>
      ${filesHTML}
      <div class="order-card-actions">
        ${canReorder?`<button class="btn btn-accent xs" onclick="event.stopPropagation();openCheckout('${o.product}')">Reorder</button>`:`<button class="btn btn-accent xs" onclick="event.stopPropagation();go('store')">Shop again</button>`}
      </div>
    </div>`;
  return `<div class="order-card" id="order-${o.id}" ${compact?'':`onclick="toggleOrderCard('${o.id}')"`}>
    <div class="order-card-head">
      ${orderIconHTML(o)}
      <div class="order-card-body"><b>${esc(o.title)}</b>
        <div class="order-card-meta"><span>${esc(o.id)}</span><span>${esc(o.date)}</span>${statusPillHTML(o.status)}</div>
      </div>
      <div class="order-amount">₹${o.amount.toLocaleString('en-IN')}</div>
      ${compact?'':'<span class="order-caret">▾</span>'}
    </div>
    ${detail}
  </div>`;
}
function toggleOrderCard(id){$('order-'+id).classList.toggle('open')}
function projectCardHTML(p){
  const thumb=p.doc&&p.doc._thumb;
  const bg={photobook:'#141414',tradebook:'#1B4332',artprints:'#B0432E'}[p.type]||'var(--cream)';
  const cover=thumb
    ?`<img src="${thumb}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid var(--line);flex:0 0 auto;background:#fff">`
    :`<div style="width:64px;height:64px;background:${bg};flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px">${p.type==='artprints'?'▦':'◙'}</div>`;
  const expDate=p.expires_at?new Date(p.expires_at):null;
  const daysLeft=expDate?Math.ceil((expDate-Date.now())/(1000*60*60*24)):null;
  const expWarning=daysLeft!==null&&daysLeft<=10?`<span style="color:#B0432E;font-size:11.5px;font-weight:600">⚠ Deletes in ${daysLeft} day${daysLeft===1?'':'s'}</span>`:
    daysLeft!==null&&daysLeft<=35?`<span style="color:#E08600;font-size:11.5px">Expires in ${daysLeft} days</span>`:
    daysLeft!==null?`<span style="font-size:11.5px;color:var(--slate-l)">${daysLeft} days left</span>`:'';
  return `<div style="display:flex;align-items:center;gap:14px;border:1px solid ${daysLeft!==null&&daysLeft<=10?'#B0432E':daysLeft!==null&&daysLeft<=35?'#E08600':'var(--line)'};border-radius:12px;padding:12px 14px">
    ${cover}
    <div style="flex:1;min-width:0"><b style="font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</b><div style="font-size:12px;color:var(--slate-l);display:flex;gap:10px;align-items:center;flex-wrap:wrap">${projectLabel(p.type)} · saved ${new Date(p.updated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} ${expWarning}</div></div>
  </div>
  <div style="display:flex;gap:8px;margin-top:10px">
    <button class="btn btn-accent xs" onclick="openSavedProject('${p.id}')">Open &amp; edit</button>
    <button class="btn btn-ghost xs" onclick="openCheckout('${p.type}')">Order print</button>
    <button class="btn btn-ghost xs" onclick="deleteSavedProject('${p.id}')">Remove</button>
  </div>`;
}

/* ---------- Dashboard: main render ---------- */
async function renderCustomerDashboard(){
  if(!S.user)return;
  $('dashGreeting').textContent='Hi, '+S.user.name.split(' ')[0];
  $('dashAvatar').textContent=(S.user.name||'B').trim().charAt(0).toUpperCase();
  $('dashName').textContent=S.user.name; $('dashEmail').textContent=S.user.email;
  $('dashMemberSince').textContent=S.user.since?new Date(S.user.since).toLocaleDateString('en-IN',{month:'short',year:'numeric'}):'—';

  const mine=S.orders.filter(o=>o.customer===S.user.email);
  $('dashMyOrders').textContent=mine.length;
  $('dashMySpend').textContent='₹'+mine.reduce((a,o)=>a+o.amount,0).toLocaleString('en-IN');

  // Full order list
  $('dashOrdersList').innerHTML=mine.length
    ?mine.map(o=>orderCardHTML(o,false)).join('')
    :'<div class="dash-empty">No orders yet — place one from any editor and it\'ll show up here.</div>';
  // Recent orders preview (overview tab)
  $('dashRecentOrders').innerHTML=mine.length
    ?mine.slice(0,3).map(o=>orderCardHTML(o,true)).join('')
    :'<div class="dash-empty">No orders yet.</div>';

  // Projects
  const pw=$('dashProjectRows'); pw.innerHTML='<p style="color:var(--slate-l);font-size:13px;grid-column:1/-1">Loading your projects…</p>';
  const rp=$('dashRecentProjects'); rp.innerHTML='<p style="color:var(--slate-l);font-size:13px">Loading…</p>';
  const list=await myProjects(); $('dashMyProjects').textContent=list.length;
  pw.innerHTML=list.length?list.map(p=>`<div>${projectCardHTML(p)}</div>`).join(''):'<div class="dash-empty" style="grid-column:1/-1">No saved projects yet — open an editor and hit "Save."</div>';
  rp.innerHTML=list.length?list.slice(0,2).map(p=>`<div style="margin-bottom:10px">${projectCardHTML(p)}</div>`).join(''):'<div class="dash-empty">No saved projects yet.</div>';
}

async function doResetStep1(){
  const email=$('resetEmail').value.trim();
  if(!/.+@.+\..+/.test(email))return toast('Enter a valid email');
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  if(error){toast(error.message);return}
  toast('Check your email for a reset link.');
  authGo('login');
}
async function doSetNewPasswordAfterReset(){
  const np=$('newPassAfterReset').value;
  if(np.length<6)return toast('Password needs 6+ characters');
  const {error}=await sb.auth.updateUser({password:np});
  if(error){toast(error.message);return}
  toast('Password updated.'); hide('authModal'); $('newPassAfterReset').value='';
}
// When someone arrives via the emailed reset link, Supabase fires this event — surface the "set new password" form.
sb.auth.onAuthStateChange((event)=>{ if(event==='PASSWORD_RECOVERY'){authGo('newpass');show('authModal');} });

/* ================= STORE ================= */
const CATALOG_DEFAULTS=[
 {id:'edition',name:'Signature Edition Photobook Cover',blurb:'Linen-wrapped hardcover upgrade for any Binder photobook.',details:'A linen-wrapped hardcover upgrade that replaces the standard cover on any Binder photobook. Foil-debossed title on the spine and front, with a choice of five linen colours. Adds structural rigidity for books that will be handled often or passed around.',price:349900,badge:null,grad:['#141414','#52B57D'],img:null,category:'Books',slug:'signature-edition-photobook-cover'},
 {id:'sleeve',name:'Protective Book Sleeve',blurb:'Archival cotton sleeve, fits all Binder formats.',details:'An archival, acid-free cotton sleeve sized to fit every Binder book format — photobook, trade book, and gallery print sizes. Protects against dust, light, and shelf wear during storage or shipping.',price:129900,badge:null,grad:['#2C2C2E','#86868B'],img:null,category:'Books',slug:'protective-book-sleeve'},
 {id:'giftbox',name:'Gifting Box',blurb:'Rigid presentation box with ribbon pull.',details:'A rigid, magnet-closure presentation box lined in matte black with a satin ribbon pull. Built for one book plus a card insert — ideal for weddings, anniversaries, and client gifting.',price:99900,badge:null,grad:['#52B57D','#141414'],img:null,category:'Books',slug:'gifting-box'},
 {id:'printset',name:'Loose Art Print Set of 4',blurb:'6″×4″ prints on 300gsm archival stock.',details:'Four loose prints at 6″×4″, produced on 300gsm archival matte stock with pigment inks rated for 75+ years of fade resistance. Choose any four images from your project at checkout notes.',price:159900,badge:null,grad:['#3A3A3C','#52B57D'],img:null,category:'Photographs & Fine Art',slug:'loose-art-print-set-of-4'},
];
let CATALOG=loadJSON('cms_catalog', loadJSON('binder_catalog',CATALOG_DEFAULTS));
function uniqueProductSlug(base,excludeId){
  let slug=base,n=2;
  while(CATALOG.some(p=>p.slug===slug&&p.id!==excludeId)){slug=base+'-'+n;n++;}
  return slug;
}
function backfillProductSlugs(){
  let changed=false;
  CATALOG.forEach(p=>{ if(!p.slug){ p.slug=uniqueProductSlug(slugify(p.name),p.id); changed=true; } });
  if(changed){ saveJSON('cms_catalog',CATALOG); cmsSet('catalog',CATALOG); } // quiet — no toast, this runs on every page load
}
function saveCatalog(){
  saveJSON('cms_catalog',CATALOG);
  cmsSet('catalog', CATALOG).then(ok => { toast(ok?'Store updated ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed, other visitors won\'t see this yet'); });
}
function inr(p){return '₹'+(p/100).toLocaleString('en-IN')}
function productVisual(p){return p.img?`background-image:url(${p.img})`:`background:#8A8A87`}
const STORE_CATEGORIES=[
  {name:'Books',contentKey:'storeBooksTagline'},
  {name:'Photographs & Fine Art',contentKey:'storePhotoTagline'},
];
function seededOffset(id){let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;return (Math.abs(h)%21)-10;}
let _openStoreDrawers=new Set(); // closed by default — pieces only reveal once a drawer is opened
function toggleStoreDrawer(cat,drawerEl,headEl){
  const isOpen=drawerEl.classList.toggle('open');
  if(isOpen)_openStoreDrawers.add(cat); else _openStoreDrawers.delete(cat);
  headEl.setAttribute('aria-expanded',isOpen?'true':'false');
}
function productCardEl(p,i){
  const c=document.createElement('div');c.className='pcard';
  c.style.setProperty('--sy',seededOffset(p.id)+'px');
  c.style.setProperty('--sd',(i*70)+'ms');
  c.style.cursor='pointer';
  c.onclick=()=>openProductDetail(p.id);
  c.innerHTML=`<div class="pv" style="${p.img?'':productVisual(p)}">
      ${p.img?mediaTagHtml(p.img,p.name,'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"'):''}
      <button class="pv-add" title="Add to cart" aria-label="Add ${esc(p.name)} to cart" onclick="event.stopPropagation();addToCart('${p.id}')">+</button>
    </div>
    <div class="pb"><h3>${esc(p.name)}</h3>
      ${p.blurb?`<p class="pdesc">${esc(p.blurb)}</p>`:''}
      <div class="prow"><b>${inr(p.price)}</b><span class="padd-link" onclick="event.stopPropagation();addToCart('${p.id}')">Add to cart</span></div>
    </div>`;
  return c;
}
function renderStore(){
  const wrap=$('storeDrawers'); if(!wrap)return;
  wrap.innerHTML='';
  STORE_CATEGORIES.forEach(catDef=>{
    const cat=catDef.name;
    const items=CATALOG.filter(p=>(p.category||'Books')===cat);
    const isOpen=_openStoreDrawers.has(cat);
    const drawer=document.createElement('div');
    drawer.className='store-drawer'+(isOpen?' open':'');
    const head=document.createElement('button');
    head.className='store-drawer-head';
    head.setAttribute('aria-expanded',isOpen?'true':'false');
    const tagline=CONTENT[catDef.contentKey]||'';
    head.innerHTML=`<span class="sdh-text"><span class="sdh-title">${esc(cat)}</span>${tagline?`<span class="sdh-tagline">${esc(tagline)}</span>`:''}</span>
      <span class="sdh-chev"></span>`;
    head.onclick=()=>toggleStoreDrawer(cat,drawer,head);
    const body=document.createElement('div');
    body.className='store-drawer-body';
    const inner=document.createElement('div');
    inner.className='store-drawer-inner';
    const grid=document.createElement('div');
    grid.className='store-grid';
    if(items.length){
      items.forEach((p,i)=>grid.appendChild(productCardEl(p,i)));
    }else{
      grid.innerHTML=`<p style="color:var(--slate-l);font-size:14px;padding:4px 0 20px">No pieces here yet.</p>`;
    }
    inner.appendChild(grid);
    body.appendChild(inner);
    drawer.appendChild(head);
    drawer.appendChild(body);
    wrap.appendChild(drawer);
  });
}
function openProductDetail(id,push){
  const p=CATALOG.find(x=>x.id===id||x.slug===id); if(!p)return;
  if(!p.slug){p.slug=uniqueProductSlug(slugify(p.name),p.id);saveJSON('cms_catalog',CATALOG);cmsSet('catalog',CATALOG);}
  const slugPath=p.slug;
  $('pdImg').style.cssText='width:100%;aspect-ratio:4/3;overflow:hidden;'+(p.img?'':'background:#8A8A87');
  $('pdImg').innerHTML=p.img?mediaTagHtml(p.img,p.name,'style="width:100%;height:100%;object-fit:cover;display:block"'):'';
  $('pdName').textContent=p.name;
  $('pdPrice').textContent=inr(p.price);
  const badgeEl=$('pdBadge');
  if(p.badge){badgeEl.textContent=p.badge;badgeEl.style.display='inline-block';}else{badgeEl.style.display='none';}
  $('pdBlurb').textContent=p.blurb||'';
  const detailsEl=$('pdDetails');
  detailsEl.textContent=p.details||'';
  detailsEl.style.display=p.details?'block':'none';
  $('pdAddBtn').setAttribute('onclick',`closeProductDetail();addToCart('${p.id}')`);
  show('productDetailModal');
  if($('view-store')&&!$('view-store').classList.contains('active')){ // deep link landed here before store view was shown
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    document.querySelector('.site-nav').style.display='flex';
  if($('siteFooter'))$('siteFooter').style.display='block';
    $('view-store').classList.add('active'); renderStore();
  }
  if(push!==false)setPath('/store/'+slugPath);
  else if(location.pathname!=='/store/'+slugPath){history.replaceState({},'','/store/'+slugPath);} // old id-based link → canonical slug URL
  const pageTitle=p.name+' — Binder Store';
  const pageDesc=(p.blurb||p.details||'').trim().slice(0,155)||('Order '+p.name+' from Binder, a premium printer in Delhi, India.');
  const pageImg=p.img||DEFAULT_OG_IMAGE;
  document.title=pageTitle;
  const desc=document.querySelector('meta[name="description"]'); if(desc)desc.setAttribute('content',pageDesc);
  updateSeoKeywords(p.name+', Binder store, photobook accessories India');
  const og=document.querySelector('meta[property="og:title"]'); if(og)og.setAttribute('content',pageTitle);
  const ogd=document.querySelector('meta[property="og:description"]'); if(ogd)ogd.setAttribute('content',pageDesc);
  const ogi=document.querySelector('meta[property="og:image"]'); if(ogi)ogi.setAttribute('content',pageImg);
  const ogtype=document.querySelector('meta[property="og:type"]'); if(ogtype)ogtype.setAttribute('content','product');
  const ogp=document.querySelector('meta[property="product:price:amount"]'); if(ogp)ogp.setAttribute('content',(p.price/100).toString());
  const tt=document.querySelector('meta[name="twitter:title"]'); if(tt)tt.setAttribute('content',pageTitle);
  const td=document.querySelector('meta[name="twitter:description"]'); if(td)td.setAttribute('content',pageDesc);
  const ti=document.querySelector('meta[name="twitter:image"]'); if(ti)ti.setAttribute('content',pageImg);
  const canon=document.querySelector('link[rel="canonical"]'); if(canon)canon.setAttribute('href','https://www.binder.co.in/store/'+slugPath);
  setPageSchema([buildProductSchema(p,slugPath),buildBreadcrumbSchema([{name:'Home',url:'https://www.binder.co.in/'},{name:'Store',url:'https://www.binder.co.in/store'},{name:p.name,url:'https://www.binder.co.in/store/'+slugPath}])]);
}
function closeProductDetail(){
  hide('productDetailModal');
  setPath('/store');
  updateSeoMeta('store');
}
function addToCart(id){const it=S.cart.find(x=>x.id===id);if(it)it.qty++;else S.cart.push({id,qty:1});saveJSON('binder_cart',S.cart);syncCartBadge();renderCart();openCart();}
function changeQty(id,d){const it=S.cart.find(x=>x.id===id);if(!it)return;it.qty+=d;if(it.qty<=0)S.cart=S.cart.filter(x=>x.id!==id);saveJSON('binder_cart',S.cart);syncCartBadge();renderCart();}
function cartTotal(){return S.cart.reduce((s,it)=>{const p=CATALOG.find(c=>c.id===it.id);return s+(p?p.price*it.qty:0)},0)}
function syncCartBadge(){const n=S.cart.reduce((a,c)=>a+c.qty,0);const el=$('cartCount');if(el){el.textContent=n;el.style.display=n?'flex':'none';}}
function pruneInvalidCartItems(){
  const before=S.cart.length;
  S.cart=S.cart.filter(it=>CATALOG.find(c=>c.id===it.id));
  if(S.cart.length!==before){saveJSON('binder_cart',S.cart);syncCartBadge();}
}
function renderCart(){pruneInvalidCartItems();const wrap=$('cartItems'),foot=$('cartFoot');
  if(!S.cart.length){wrap.innerHTML='<p style="color:#86868B;font-size:13px;padding:40px 0;text-align:center">Your cart is empty.</p>';foot.innerHTML='';return}
  wrap.innerHTML=S.cart.map(it=>{const p=CATALOG.find(c=>c.id===it.id);if(!p)return'';
    return `<div class="cart-item"><div class="sw" style="overflow:hidden;${p.img?'':'background:#8A8A87'}">${p.img?mediaTagHtml(p.img,p.name,'style="width:100%;height:100%;object-fit:cover;display:block"'):''}</div><div style="flex:1"><h4 style="font-size:13.5px">${esc(p.name)}</h4>
      <div style="font-size:12px;color:#86868B;margin:2px 0 6px">${inr(p.price)} each</div>
      <div class="qty"><button onclick="changeQty('${p.id}',-1)">−</button><span>${it.qty}</span><button onclick="changeQty('${p.id}',1)">+</button></div></div></div>`;}).join('');
  foot.innerHTML=`<div class="sum-row total"><span>Subtotal</span><span>${inr(cartTotal())}</span></div><button class="btn btn-accent" style="width:100%;justify-content:center;margin-top:10px" onclick="openStoreCheckout()">Checkout →</button>`;}
function openCart(){renderCart();$('cartDrawer').classList.add('open');$('cartOverlay').classList.add('show')}
function closeCart(){$('cartDrawer').classList.remove('open');$('cartOverlay').classList.remove('show')}
let CHECKOUT_CTX=null;
function openStoreCheckout(){pruneInvalidCartItems();if(!S.cart.length)return toast('Cart is empty');if(!S.user){authGo('login');show('authModal');toast('Sign in to check out');return}
  closeCart();CHECKOUT_CTX={type:'store',addons:[],gift:null,couponCode:null,couponPercent:0};
  $('coSub').textContent=S.cart.reduce((a,c)=>a+c.qty,0)+' item(s)';
  $('coAddonsRow').style.display='none';
  $('coGiftRow').style.display='block'; resetGiftForm();
  resetCoupon();
  recalcStoreCheckout();
  primeCheckoutModal();show('checkoutModal');}
// Checkout upsells — offers products that already exist in the Store (Protective Sleeve, Gifting
// Box) at the exact moment someone has just finished a book and is about to pay, instead of only
// ever surfacing them if a customer independently stumbles onto the Store page. Reads live from
// CATALOG so the price and description here can never drift out of sync with the Store itself.
const UPSELL_ADDON_IDS=['sleeve','giftbox'];
function renderCheckoutAddons(){
  const wrap=$('coAddonsList'); if(!wrap)return;
  const items=UPSELL_ADDON_IDS.map(id=>CATALOG.find(p=>p.id===id)).filter(Boolean);
  if(!items.length){$('coAddonsRow').style.display='none';return;}
  $('coAddonsRow').style.display='block';
  wrap.innerHTML=items.map(p=>{
    const on=(CHECKOUT_CTX.addons||[]).includes(p.id);
    return `<label class="finish-opt">
      <input type="checkbox" ${on?'checked':''} onchange="toggleCheckoutAddon('${p.id}')">
      <span><b>${esc(p.name)} — ${inr(p.price)}</b><span>${esc(p.blurb||'')}</span></span>
    </label>`;
  }).join('');
}
function toggleCheckoutAddon(id){
  if(!CHECKOUT_CTX.addons)CHECKOUT_CTX.addons=[];
  const i=CHECKOUT_CTX.addons.indexOf(id);
  if(i===-1)CHECKOUT_CTX.addons.push(id); else CHECKOUT_CTX.addons.splice(i,1);
  renderCheckoutAddons();
  recalcCheckout();
}
function resetGiftForm(){
  CHECKOUT_CTX.gift=null;
  const cb=$('coIsGift'); if(cb)cb.checked=false;
  $('coGiftFields').style.display='none';
  ['giftName','giftPhone','giftNote','giftAddr1','giftAddr2','giftCity','giftPin'].forEach(id=>{if($(id))$(id).value='';});
}
function toggleGiftFields(){
  const on=$('coIsGift').checked;
  $('coGiftFields').style.display=on?'block':'none';
}
// Pulled at pay-time (not on every keystroke) so a half-filled form never silently ships as a
// non-gift order. Returns null if the checkbox is off, or if it's on but the essentials are missing.
function readGiftFromForm(){
  if(!$('coIsGift')||!$('coIsGift').checked)return null;
  const name=($('giftName').value||'').trim(), addr1=($('giftAddr1').value||'').trim(),
    city=($('giftCity').value||'').trim(), pin=($('giftPin').value||'').trim();
  if(!name||!addr1||!city||!pin){toast('Add the recipient\'s name and full address to ship this as a gift.');return undefined;}
  return {isGift:true,recipientName:name,recipientPhone:($('giftPhone').value||'').trim()||null,
    note:($('giftNote').value||'').trim()||null,
    address:{line1:addr1,line2:($('giftAddr2').value||'').trim()||null,city,pin}};
}
function updatePhotobookPrice(key){
  key=key||'photobook';
  const rule=PRICING_RULES[key];
  const ed=EDS[key];
  if(!rule||!ed)return;
  const prefix=ed.cfg.prefix;
  const pages=ed.pageCount();
  const extra=Math.max(0,pages-rule.basePages);
  const extraCost=extra*rule.perPage; // paise
  const total=rule.perCopyLow+extraCost; // paise
  const fmt=p=>'₹'+Math.round(p/100).toLocaleString('en-IN');
  const mainEl=$(prefix+'-priceMain');
  const subEl=$(prefix+'-priceSub');
  if(!mainEl)return;
  mainEl.textContent=fmt(total)+'/copy';
  if(extra>0){
    mainEl.style.color='var(--accent)';
    subEl.textContent=pages+' pages · base '+fmt(rule.perCopyLow)+' + '+fmt(extraCost)+' extra';
  } else {
    mainEl.style.color='var(--text)';
    subEl.textContent=pages+' pages · base price';
  }
}
// Art print prices are flat (don't vary with content), so this just syncs the top-bar tag from
// the actual pricing constants — single source of truth, rather than leaving it as static HTML
// text that could silently drift out of sync if the price ever changes.
function updateArtPrintPrice(key){
  const fmt=p=>'₹'+Math.round(p/100).toLocaleString('en-IN');
  if(key==='artprints'){
    const mainEl=$('ap-priceMain'), subEl=$('ap-priceSub');
    if(!mainEl)return;
    mainEl.textContent=fmt(20000*4); subEl.textContent='set of 4 · 6″×4″';
    return;
  }
  const variant=AP_SINGLE_VARIANTS[key]; if(!variant)return;
  const mainEl=$(variant.prefix+'-priceMain'), subEl=$(variant.prefix+'-priceSub');
  if(!mainEl)return;
  mainEl.textContent=fmt(variant.price); subEl.textContent=variant.wIn+'″×'+variant.hIn+'″ print';
}
const PRICING_RULES={
  tradebook:{basePages:100, perCopyLow:100000, perCopyBulk:60000, perPage:400, bulkFrom:10},
  photobook:{basePages:20,  perCopyLow:220000, perCopyBulk:110000, perPage:5000, bulkFrom:10},
  photobook12:{basePages:20, perCopyLow:420000, perCopyBulk:294000, perPage:10000, bulkFrom:10}, // 30% off at 10+ copies
  photobook18:{basePages:20, perCopyLow:630000, perCopyBulk:441000, perPage:15000, bulkFrom:10}, // 30% off at 10+ copies — placeholder pricing, adjust to your real cost
};
function quoteEditorOrder(editorKey,qty){
  const rule=PRICING_RULES[editorKey];
  if(!rule)return{perCopy:99900,extraPages:0,extraCost:0,total:99900*(qty||1)};
  const ed=EDS[editorKey];
  const extraPages=Math.max(0,ed.pageCount()-rule.basePages);
  const extraCost=extraPages*rule.perPage;
  const perCopyBase=(qty>=rule.bulkFrom)?rule.perCopyBulk:rule.perCopyLow;
  const perCopy=perCopyBase+extraCost;
  return{perCopy,extraPages,extraCost,perCopyBase,total:perCopy*qty};
}
// Shared by every checkout total (editor + store): applies whatever coupon is currently on
// CHECKOUT_CTX to a pre-discount subtotal, writes the summary + total into #coRows, and records
// the actual chargeable amount back onto CHECKOUT_CTX for doPay() to use.
function finalizeCheckoutRows(itemRowsHtml,subtotal){
  const pct=CHECKOUT_CTX.couponPercent||0;
  const discount=pct?Math.round(subtotal*pct/100):0;
  const total=subtotal-discount;
  CHECKOUT_CTX.price=total; CHECKOUT_CTX.discountAmount=discount;
  const discountRow=discount>0?`<div class="sum-row" style="color:var(--accent-d)"><span>Discount — ${esc(CHECKOUT_CTX.couponCode)} (${pct}% off)</span><span>−${inr(discount)}</span></div>`:'';
  $('coRows').innerHTML=itemRowsHtml+discountRow+`<div class="sum-row total"><span>Total</span><span>${inr(total)}</span></div>`;
  $('payAmt').textContent=inr(total);
}
function resetCoupon(){
  if(CHECKOUT_CTX){CHECKOUT_CTX.couponCode=null;CHECKOUT_CTX.couponPercent=0;CHECKOUT_CTX.discountAmount=0;}
  if($('coCouponInput'))$('coCouponInput').value='';
  const msg=$('coCouponMsg'); if(msg)msg.style.display='none';
}
async function applyCoupon(ev){
  const raw=($('coCouponInput').value||'').trim();
  if(!raw)return toast('Enter a code first.');
  const btn=(ev&&ev.target&&ev.target.tagName==='BUTTON')?ev.target:null;
  if(btn){btn.disabled=true;btn.textContent='Checking…';}
  const {data,error}=await sb.rpc('validate_coupon',{p_code:raw});
  if(btn){btn.disabled=false;btn.textContent='Apply';}
  const msg=$('coCouponMsg');
  const row=(data&&data[0])||null;
  if(error||!row||!row.valid){
    CHECKOUT_CTX.couponCode=null;CHECKOUT_CTX.couponPercent=0;
    msg.style.display='block';msg.style.color='#B0432E';
    msg.textContent=(row&&row.reason)?row.reason:'Could not check that code — try again.';
  }else{
    CHECKOUT_CTX.couponCode=raw.toUpperCase();CHECKOUT_CTX.couponPercent=row.percent_off;
    msg.style.display='block';msg.style.color='var(--accent-d)';
    msg.textContent=row.percent_off+'% off applied ✓';
  }
  if(CHECKOUT_CTX.type==='store')recalcStoreCheckout(); else recalcCheckout();
}
function recalcStoreCheckout(){
  if(!CHECKOUT_CTX||CHECKOUT_CTX.type!=='store')return;
  const subtotal=cartTotal();
  const itemRows=S.cart.map(it=>{const p=CATALOG.find(c=>c.id===it.id);if(!p)return'';return `<div class="sum-row"><span>${esc(p.name)} × ${it.qty}</span><span>${inr(p.price*it.qty)}</span></div>`}).join('');
  finalizeCheckoutRows(itemRows,subtotal);
}
function recalcCheckout(){
  if(!CHECKOUT_CTX||CHECKOUT_CTX.type!=='editor')return;
  const editorKey=CHECKOUT_CTX.key;
  const rule=PRICING_RULES[editorKey];
  const qtyInput=$('coQty'); let qty=qtyInput?Math.max(1,Math.min(50,parseInt(qtyInput.value)||1)):1;
  if(qtyInput)qtyInput.value=qty;
  const addonItems=(CHECKOUT_CTX.addons||[]).map(id=>CATALOG.find(p=>p.id===id)).filter(Boolean);
  const addonsTotal=addonItems.reduce((s,p)=>s+p.price,0);
  const addonRows=addonItems.map(p=>`<div class="sum-row"><span>${esc(p.name)}</span><span>${inr(p.price)}</span></div>`).join('');
  const deliveryRow=`<div class="sum-row"><span>Delivery (India)</span><span>Included</span></div>`;
  if(AP_SINGLE_VARIANTS[editorKey]){
    const variant=AP_SINGLE_VARIANTS[editorKey], subtotal=variant.price+addonsTotal;
    const rows=`<div class="sum-row"><span>${esc(variant.label)}</span><span>${inr(variant.price)}</span></div>`+addonRows+deliveryRow;
    finalizeCheckoutRows(rows,subtotal); return;
  }
  if(!rule){ // Art Prints — flat set pricing: ₹200 per print × 4 prints
    const perPrint=20000, setSize=4, subtotal=perPrint*setSize+addonsTotal;
    const rows=`<div class="sum-row"><span>${setSize} art prints × ${inr(perPrint)}</span><span>${inr(perPrint*setSize)}</span></div>`+addonRows+deliveryRow;
    finalizeCheckoutRows(rows,subtotal); return;
  }
  const q=quoteEditorOrder(editorKey,qty);
  const subtotal=q.total+addonsTotal;
  CHECKOUT_CTX.qty=qty;
  const label=editorKey==='tradebook'?'Trade Book':editorKey==='photobook12'?'Photobook (12″×12″)':editorKey==='photobook18'?'Photobook (12″×18″)':'Photobook';
  const bulkNote=qty>=rule.bulkFrom?` (bulk rate, ${rule.bulkFrom}+ copies)`:'';
  const rows=`<div class="sum-row"><span>${label} · ${qty} ${qty===1?'copy':'copies'}${bulkNote}</span><span>${inr(q.perCopyBase*qty)}</span></div>`+
    (q.extraPages>0?`<div class="sum-row"><span>+${q.extraPages} extra pages × ₹${rule.perPage/100} × ${qty} ${qty===1?'copy':'copies'}</span><span>${inr(q.extraCost*qty)}</span></div>`:'')+
    addonRows+deliveryRow;
  finalizeCheckoutRows(rows,subtotal);
}
function openCheckout(editorKey){
  if(!S.user){authGo('login');show('authModal');toast('Sign in to place your order');return}
  const ed=EDS[editorKey];
  CHECKOUT_CTX={type:'editor',key:editorKey,price:0,qty:1,addons:[],gift:null,couponCode:null,couponPercent:0};
  const title=ed?ed.doc.title:(AP_SINGLE_VARIANTS[editorKey]?AP_SINGLE[editorKey].title:AP.title);
  $('coSub').textContent=title+' · print order';
  const showQty=(editorKey==='photobook'||editorKey==='photobook12'||editorKey==='photobook18'||editorKey==='tradebook');
  $('coQtyRow').style.display=showQty?'block':'none';
  $('coQtyNudge').style.display=showQty?'block':'none';
  $('coBindingRow').style.display=(editorKey==='photobook12'||editorKey==='photobook18')?'block':'none';
  if($('coQty'))$('coQty').value=1;
  renderCheckoutAddons();
  $('coGiftRow').style.display='block'; resetGiftForm();
  resetCoupon();
  recalcCheckout();
  primeCheckoutModal();
  show('checkoutModal');
}
/* ---------- Payment methods (real Razorpay gateway) ----------
   The chip the customer picks is passed to Razorpay Checkout via its
   config.display API, so the chosen method opens first — every other method
   stays one tap away inside the Razorpay sheet. */
const PAY_METHODS=[
  {id:'upi',       icon:'▲', name:'UPI',        sub:'GPay · PhonePe · Paytm'},
  {id:'card',      icon:'▭', name:'Card',       sub:'Credit & debit'},
  {id:'netbanking',icon:'🏦',name:'Netbanking',sub:'All major banks'},
  {id:'wallet',    icon:'👛',name:'Wallet',    sub:'Paytm · Mobikwik'},
  {id:'emi',       icon:'◔', name:'EMI',        sub:'Cards & Cardless'},
  {id:'all',       icon:'✚', name:'All options',sub:'Choose in gateway'}
];
let PAY_METHOD='upi';
function renderPayMethods(){
  const wrap=$('payMethods');if(!wrap)return;
  wrap.innerHTML=PAY_METHODS.map(m=>`<div class="paym ${PAY_METHOD===m.id?'on':''}" onclick="setPayMethod('${m.id}')">
    <span>${m.icon}</span><b>${m.name}</b><small>${m.sub}</small></div>`).join('');
}
function setPayMethod(id){PAY_METHOD=id;renderPayMethods();}
function isTestKey(){return /^rzp_test_/.test(PAYCFG.razorpayKeyId||'')}
// "God account" — a single internal email that can place real orders without going through
// Razorpay at all. Used for comp orders, print-testing, and staff samples. Gated purely by
// email match (same trust model the rest of this app already uses client-side for admin), so
// there's nothing to configure server-side beyond the account itself existing in Supabase Auth.
const GOD_ACCOUNT_EMAIL='info@binder.co.in';
function isGodAccount(){return !!(S.user&&S.user.email&&S.user.email.toLowerCase()===GOD_ACCOUNT_EMAIL);}
function primeCheckoutModal(){
  renderPayMethods();
  $('payTestBanner').style.display=isTestKey()&&!isGodAccount()?'block':'none';
  const saved=loadJSON('binder_phone','');if(saved&&!$('coPhone').value)$('coPhone').value=saved;
  if(S.user&&!$('coPhone').value){sb.auth.getUser().then(({data})=>{if(data.user?.user_metadata?.phone)$('coPhone').value=data.user.user_metadata.phone;});}
  const godBanner=$('payGodBanner'), payMethodsRow=$('payMethods'), payMethodsLabel=payMethodsRow?payMethodsRow.previousElementSibling:null;
  const lbl=$('payBtnLabel');
  if(isGodAccount()){
    if(godBanner)godBanner.style.display='block';
    if(payMethodsRow)payMethodsRow.style.display='none';
    if(payMethodsLabel)payMethodsLabel.style.display='none';
    if(lbl)lbl.textContent='Place order — no payment';
  }else{
    if(godBanner)godBanner.style.display='none';
    if(payMethodsRow)payMethodsRow.style.display='';
    if(payMethodsLabel)payMethodsLabel.style.display='';
    if(lbl)lbl.textContent='Pay';
  }
}
function doPay(){
  const phone=($('coPhone').value||'').replace(/\D/g,'');
  if(phone&&phone.length!==10)return toast('Mobile number should be 10 digits');
  if(phone)saveJSON('binder_phone',phone);
  const gift=readGiftFromForm();
  if(gift===undefined)return; // "This is a gift" is checked but the form's incomplete — readGiftFromForm already toasted why
  if(gift)CHECKOUT_CTX.gift=gift;
  const god=isGodAccount();
  if(!god&&!PAYCFG.razorpayKeyId)return toast('Payment gateway is not configured — add a Razorpay Key ID in Admin → Payments.');
  const btn=$('payBtn');btn.disabled=true;$('payBtnLabel').textContent=god?'Placing order…':'Opening secure gateway…';
  const amt=CHECKOUT_CTX.type==='store'?cartTotal():CHECKOUT_CTX.price;
  const finish=(resp)=>{btn.disabled=false;$('payBtnLabel').textContent=god?'Place order — no payment':'Pay';
    const product=CHECKOUT_CTX.type==='store'?'Store':CHECKOUT_CTX.key;
    const pdfFiles=product==='photobook'||product==='photobook12'||product==='photobook18'||product==='tradebook'?{'cover':'Queued','interior':'Queued'}
      :product==='artprints'?{'artboard':'Queued'}
      :AP_SINGLE_VARIANTS[product]?{'print':'Queued'}:null;
    const qty=CHECKOUT_CTX.qty||1;
    let snapshot=null;
    if(product==='photobook'||product==='photobook12'||product==='photobook18'||product==='tradebook'){
      const ed=EDS[product];
      snapshot={doc:JSON.parse(JSON.stringify(ed.doc)),photoMap:snapshotPhotoMap(ed.doc,ed.photos)};
    }else if(product==='artprints'){
      snapshot={boards:JSON.parse(JSON.stringify(AP.boards)),orient:[...AP.orient],photoMap:snapshotApPhotoMap()};
    }else if(AP_SINGLE_VARIANTS[product]){
      const st=AP_SINGLE[product];
      snapshot={board:JSON.parse(JSON.stringify(st.board)),orient:st.orient,photoMap:snapshotApSinglePhotoMap(product)};
    }
    const finishEl=document.querySelector('input[name="coFinish"]:checked');
    const paperFinish=finishEl?finishEl.value:'matte';
    const bindingEl=document.querySelector('input[name="coBinding"]:checked');
    const bindingType=((product==='photobook12'||product==='photobook18')&&bindingEl)?bindingEl.value:null;
    const orderTitle=CHECKOUT_CTX.type==='store'?S.cart.map(it=>CATALOG.find(c=>c.id===it.id)?.name).join(', ')
      :(EDS[CHECKOUT_CTX.key]?EDS[CHECKOUT_CTX.key].doc.title:(AP_SINGLE_VARIANTS[CHECKOUT_CTX.key]?AP_SINGLE[CHECKOUT_CTX.key].title:AP.title));
    const addons=(CHECKOUT_CTX.addons||[]).map(id=>CATALOG.find(p=>p.id===id)).filter(Boolean).map(p=>({id:p.id,name:p.name,price:p.price}));
    const couponCode=CHECKOUT_CTX.couponCode||null, discountAmount=(CHECKOUT_CTX.discountAmount||0)/100;
    const order={id:'BDR-'+String(3001+S.orders.length),customer:S.user.email,
      title:orderTitle+(qty>1?' × '+qty+' copies':''),
      product,qty,amount:amt/100,date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}),status:'Received',pdfFiles,snapshot,paperFinish,bindingType,
      paymentId:(resp&&resp.razorpay_payment_id)||null,razorpayOrderId:(resp&&resp.razorpay_order_id)||null,verified:(resp&&resp._verified)||false,
      payMethod:god?'No payment (house account)':PAY_METHOD,phone:phone||null,addons,gift:CHECKOUT_CTX.gift||null,couponCode,discountAmount};
    S.orders.unshift(order); saveJSON('binder_orders',S.orders);
    // Persist order to Supabase
    sb.from('orders').insert({
      id:order.id, customer_email:order.customer, customer_name:S.user?.name||null,
      customer_id:S.user?.id||null, title:order.title, product:order.product,
      qty:order.qty, amount:order.amount, status:order.status,
      pay_method:order.payMethod||null, payment_id:order.paymentId||null,
      razorpay_order_id:order.razorpayOrderId||null, verified:order.verified||false,
      phone:order.phone||null, snapshot:order.snapshot, pdf_files:{},
      render_status:'pending', addons:order.addons, gift:order.gift,
      coupon_code:order.couponCode, discount_amount:order.discountAmount
    }).then(({error})=>{ if(error)console.warn('Order DB save:',error.message); });
    // The discount was already priced into `amt` at checkout time (see applyCoupon()/recalcCheckout())
    // — this just marks the coupon's one use as consumed, now that the order is actually placed. If
    // it fails (e.g. someone else used the last slot moments earlier), the order still goes through
    // exactly as priced rather than leaving a paid customer with nothing — this is bookkeeping, not a gate.
    if(couponCode){
      sb.rpc('redeem_coupon',{p_code:couponCode}).then(({data,error})=>{
        if(error)console.warn('Coupon redeem failed:',error.message);
        else if(data&&data[0]&&!data[0].success)console.warn('Coupon redeem returned unsuccessful:',data[0].reason);
      });
    }
    // Trigger server-side PDF render for each file
    triggerServerRender(order);
    if(CHECKOUT_CTX.type==='store'){S.cart=[];saveJSON('binder_cart',S.cart);syncCartBadge();}
    hide('checkoutModal');toast(god?'Order placed 🎉 No payment required — house account.':(order.gift?'Order placed 🎉 It\'ll ship straight to '+order.gift.recipientName+'.':'Order placed 🎉 Your print-ready files will appear in Admin → PDF Manager.'));};
  if(god){
    finish({razorpay_payment_id:'HOUSE-'+uid().toUpperCase(),razorpay_order_id:null,_verified:false});
    return;
  }
  const cancel=()=>{btn.disabled=false;$('payBtnLabel').textContent='Pay';$('payAmt').textContent=inr(amt);};
  openRazorpay(amt/100,'Binder order',finish,cancel,phone);
}
let PAYCFG=loadJSON('binder_pay',{razorpayKeyId:'rzp_live_glQFciELiCuURl'});
function savePayCfg(){saveJSON('binder_pay',PAYCFG)}
function loadRazorpayScript(){return new Promise((res,rej)=>{if(window.Razorpay)return res();const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=res;s.onerror=()=>rej(new Error('x'));document.head.appendChild(s);});}
/* Server-side order creation (locks the amount) — falls back to client-only checkout
   (no order_id, no verification) if the Edge Function isn't deployed yet, so checkout
   never breaks outright, but the admin gets a clear signal in the console + a toast. */
async function createServerOrder(amountPaise,receipt){
  try{
    const {data,error}=await sb.functions.invoke('create-razorpay-order',{body:{amount:Math.round(amountPaise),currency:'INR',receipt}});
    if(error)throw error;
    if(!data||!data.order||!data.order.id)throw new Error('Malformed response from create-razorpay-order');
    return data.order.id;
  }catch(e){
    console.warn('create-razorpay-order unavailable, falling back to unverified checkout:',e);
    toast('⚠ Running without server-side order verification — deploy the Edge Functions to secure checkout.');
    return null;
  }
}
async function verifyServerPayment(razorpay_order_id,razorpay_payment_id,razorpay_signature){
  if(!razorpay_order_id)return false; // no server order was created this session — nothing to verify against
  try{
    const {data,error}=await sb.functions.invoke('verify-razorpay-payment',{body:{razorpay_order_id,razorpay_payment_id,razorpay_signature}});
    if(error)throw error;
    return !!(data&&data.verified);
  }catch(e){console.warn('verify-razorpay-payment unavailable:',e);return false;}
}
/* Builds Razorpay Checkout's config.display object so the method the customer
   picked on our page opens first; all other methods remain available below it. */
function payDisplayConfig(method){
  if(!method||method==='all')return undefined;
  const names={upi:'UPI — GPay, PhonePe, Paytm & more',card:'Credit / Debit card',netbanking:'Netbanking',wallet:'Wallets',emi:'EMI'};
  return {display:{
    blocks:{chosen:{name:names[method]||'Preferred',instruments:[{method}]}},
    sequence:['block.chosen'],
    preferences:{show_default_blocks:true}
  }};
}
async function openRazorpay(amountRupees,desc,onSuccess,onCancel,phone){try{await loadRazorpayScript();
  const amountPaise=Math.round(amountRupees*100);
  const orderId=await createServerOrder(amountPaise,'bdr_'+Date.now());
  const cfg={key:PAYCFG.razorpayKeyId,amount:amountPaise,currency:'INR',name:'Binder',description:desc,
    prefill:{email:S.user?S.user.email:'',name:S.user?S.user.name:'',contact:phone||loadJSON('binder_phone','')||''},
    notes:{platform:'binder-web',product:desc},
    theme:{color:'#52B57D'},
    retry:{enabled:true,max_count:3},
    remember_customer:true,
    handler:async r=>{
      const verified=await verifyServerPayment(orderId,r.razorpay_payment_id,r.razorpay_signature);
      if(orderId&&!verified){toast('⚠ Payment could not be verified — contact support before treating this order as paid.');if(onCancel)onCancel();return;}
      onSuccess({...r,razorpay_order_id:orderId||r.razorpay_order_id,_verified:!!orderId&&verified});
    },
    modal:{ondismiss:()=>{toast('Payment cancelled');if(onCancel)onCancel()},confirm_close:true}};
  const dc=payDisplayConfig(PAY_METHOD); if(dc)cfg.config=dc;
  if(orderId)cfg.order_id=orderId;
  const rzp=new Razorpay(cfg);
  rzp.on('payment.failed',resp=>{
    const why=resp&&resp.error&&(resp.error.description||resp.error.reason)||'';
    toast('Payment failed'+(why?': '+why:'')+' — you can retry with any method.');
  });
  rzp.open();
}catch(e){toast('Could not load the payment gateway — check your connection and try again.');if(onCancel)onCancel();}}
/* ================= ADMIN =================
   Admin access is a real Supabase Auth identity, not a hardcoded client-side
   password — the browser check below is only for UI convenience (hiding/showing
   the panel instantly); the actual enforcement happens in Postgres via the
   is_admin() function and RLS policies (see cms-setup.sql / supabase-setup.sql).
   A hardcoded JS password can never protect data — anyone can read it out of the
   page source — so writes to `cms`, `orders`, and the `cms-images` bucket are now
   only accepted by the database when the signed-in user's profile has
   is_admin = true, regardless of what the browser lets you click. */
let _isAdmin=false;
async function doAdminLogin(){
  const email=$('adminUser').value.trim(),pass=$('adminPass').value;
  if(!email||!pass)return;
  const btn=$('adminLoginBtn'); btn.disabled=true; btn.textContent='Signing in…';
  $('adminGateErr').style.display='none';
  const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error||!data.user){
    btn.disabled=false; btn.textContent='Sign in';
    // Show Supabase's actual reason (e.g. "Email not confirmed") instead of a
    // generic message, so login problems are self-diagnosable without guesswork.
    $('adminGateErr').textContent=error?error.message:'Sign-in failed.'; $('adminGateErr').style.display='block';
    return;
  }
  const {data:profile}=await sb.from('profiles').select('is_admin').eq('id',data.user.id).single();
  btn.disabled=false; btn.textContent='Sign in';
  if(!profile||!profile.is_admin){
    $('adminGateErr').textContent="This account isn't set up as an admin. Ask whoever set up the site to run: update public.profiles set is_admin = true where email = '"+email.replace(/'/g,"")+"';";
    $('adminGateErr').style.display='block';
    await sb.auth.signOut();
    return;
  }
  _isAdmin=true;
  $('adminGate').style.display='none';$('adminPanel').style.display='grid';adminTab('dashboard');refreshCmsSyncBanner();
  if(window._cmsLoadFailed)toast('⚠ CMS cloud sync is not working: '+window._cmsLoadFailed+' — edits will only save on this device until fixed (run cms-setup.sql in Supabase).');
}
async function doAdminLogout(){_isAdmin=false;await sb.auth.signOut();$('adminPanel').style.display='none';$('adminGate').style.display='flex';}
async function checkAdminGate(){
  const {data:{session}}=await sb.auth.getSession();
  if(session&&session.user){
    const {data:profile}=await sb.from('profiles').select('is_admin').eq('id',session.user.id).single();
    _isAdmin=!!(profile&&profile.is_admin);
  } else { _isAdmin=false; }
  $('adminGate').style.display=_isAdmin?'none':'flex';$('adminPanel').style.display=_isAdmin?'grid':'none';
  if(_isAdmin)adminTab('dashboard');
}
/* ================= SEO · Content Moat panel =================
   A durable competitive-advantage tracker, not a live rank checker. Real DA/PA/backlink numbers
   need a paid Moz/Majestic/Ahrefs API — Mangools itself doesn't calculate its own version of these;
   it licenses Moz's DA/PA and Majestic's CF/TF and displays them under one dashboard alongside its
   own proprietary aggregate metrics (Link Profile Strength, Dominance Index / Share of Search).
   Nothing free or embeddable exists for any of that, so those sections here are a clean manual log
   with trend history instead of a fake live feed. Everything else — topical coverage, unique-data
   assets, technical SEO, network scale — is computed for real, live, from Binder's own CMS content
   and Supabase data. No invented numbers anywhere in this panel. */
const SEOMOAT_TOPICS_DEFAULT=[
  {key:'photobook',label:'Photobook Printing',keywords:['photobook','photo book','layflat','coffee table book','wedding album','12×12','12×18']},
  {key:'tradebook',label:'Trade Books & Self-Publishing',keywords:['trade book','self-publish','self publish','isbn','manuscript','novel','author']},
  {key:'artprints',label:'Art Prints',keywords:['art print','giclee','fine art','canvas print','archival print']},
  {key:'scanning',label:'Scanning & Digitisation',keywords:['scan','digitis','negative','archival scan','600 dpi']},
  {key:'gifting',label:'Gifting & Occasions',keywords:['gift','wedding','anniversary','new baby','memorial','retirement','tribute']},
];
function seomoatDefaults(){
  return {
    topics:JSON.parse(JSON.stringify(SEOMOAT_TOPICS_DEFAULT)),
    authorityLog:[], backlinkLog:[], brandLog:[],
    uniqueDataLog:[{id:uid(),date:new Date().toISOString().slice(0,10),label:'Books printed & published (lifetime)',value:'390,000+',note:'Homepage hero stat — keep this in sync if it changes.'}],
    brandNote:'Found while researching this panel: your brand name "Binder" collides heavily with an unrelated, much larger, older company — BINDER GmbH (binder-world.com), a German lab-equipment and industrial-connector manufacturer with a long SEO history and many country subdomains. This dilutes branded search share: generic "binder" searches skew toward them, not you. Worth actively differentiating in outreach and citations — "Binder Delhi", "Binder photobooks", "binder.co.in" — rather than the bare word "Binder".'
  };
}
let SEOMOAT=loadJSON('cms_seomoat',null)||seomoatDefaults();
if(!Array.isArray(SEOMOAT.topics)||!SEOMOAT.topics.length)SEOMOAT.topics=JSON.parse(JSON.stringify(SEOMOAT_TOPICS_DEFAULT));
if(!Array.isArray(SEOMOAT.authorityLog))SEOMOAT.authorityLog=[];
if(!Array.isArray(SEOMOAT.backlinkLog))SEOMOAT.backlinkLog=[];
if(!Array.isArray(SEOMOAT.brandLog))SEOMOAT.brandLog=[];
if(!Array.isArray(SEOMOAT.uniqueDataLog))SEOMOAT.uniqueDataLog=[];
if(typeof SEOMOAT.brandNote!=='string')SEOMOAT.brandNote=seomoatDefaults().brandNote;
function saveSeoMoat(silent){
  saveJSON('cms_seomoat',SEOMOAT);
  cmsSet('seomoat',SEOMOAT).then(ok=>{if(!silent)toast(ok?'Saved ✓ — visible to all admins':'⚠ Saved on this device only — cloud sync failed');});
}
const SEOMOAT_TECH_CHECKLIST=[
  {label:'Unique title + meta description on every page',done:true},
  {label:'Meta keywords tag',done:true},
  {label:'Canonical URL, kept in sync per page',done:true},
  {label:'Open Graph + Twitter Card tags, synced per page (incl. og:url)',done:true},
  {label:'Organization / LocalBusiness schema',done:true},
  {label:'Product schema (Store)',done:true},
  {label:'Article schema (Kagaz Journal posts)',done:true},
  {label:'FAQPage schema (homepage)',done:true},
  {label:'Service schema (Photobooks / Trade Books / Art Prints)',done:true},
  {label:'BreadcrumbList schema (start pages, store, journal)',done:true},
  {label:'XML sitemap + robots.txt',done:true},
  {label:'noindex on editor / admin / dashboard routes',done:true},
];
// Real count: how many published Kagaz Journal posts mention each topic cluster's keywords, in the
// title or body, and how many words that represents. This is the actual signal search engines use
// to judge topical depth and breadth — not a guess or a vanity number.
function seomoatTopicCoverage(){
  return SEOMOAT.topics.map(t=>{
    const kws=(t.keywords||[]).map(k=>k.toLowerCase()).filter(Boolean);
    let posts=0,words=0;
    (POSTS||[]).forEach(p=>{
      const hay=((p.title||'')+' '+(p.html||'')).toLowerCase();
      if(kws.some(k=>hay.includes(k))){posts++;words+=(p.html||'').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;}
    });
    return {...t,posts,words};
  });
}
async function seomoatUniqueDataAuto(){
  const out={orders:0,customers:0,clientNames:0,journalPosts:(POSTS||[]).length,galleryProjects:GALLERY.filter(g=>g.url).length,storeProducts:CATALOG.length};
  try{const {count}=await sb.from('orders').select('*',{count:'exact',head:true});out.orders=count||0;}catch(e){}
  try{const {count}=await sb.from('profiles').select('*',{count:'exact',head:true});out.customers=count||0;}catch(e){}
  out.clientNames=(CLIENTS||[]).reduce((s,sec)=>s+((sec.names&&sec.names.length)||0),0);
  return out;
}
function seomoatScore(coverage,uniq){
  const topicPct=coverage.map(t=>Math.min(100,t.posts*25));
  const topicalScore=Math.round(topicPct.reduce((a,b)=>a+b,0)/Math.max(1,topicPct.length));
  const techScore=Math.round(SEOMOAT_TECH_CHECKLIST.filter(c=>c.done).length/SEOMOAT_TECH_CHECKLIST.length*100);
  const scaleScore=Math.min(100,Math.round((Math.min(uniq.orders,500)/500*40)+(Math.min(uniq.clientNames,200)/200*30)+(Math.min(uniq.journalPosts,30)/30*30)));
  const lastAuth=SEOMOAT.authorityLog.length?SEOMOAT.authorityLog[SEOMOAT.authorityLog.length-1]:null;
  const authorityScore=(lastAuth&&lastAuth.da!=null)?Math.min(100,Math.round(lastAuth.da/40*100)):null; // DA 40 treated as a strong ceiling for a niche local business
  const parts=[topicalScore,techScore,scaleScore]; if(authorityScore!=null)parts.push(authorityScore);
  const overall=Math.round(parts.reduce((a,b)=>a+b,0)/parts.length);
  return {overall,topicalScore,techScore,scaleScore,authorityScore};
}
function seomoatSparkline(points,color){
  if(!points||points.length<2)return '<span style="font-size:11px;color:var(--slate-l)">Log at least two checks to see a trend line.</span>';
  const w=260,h=54,pad=4,max=Math.max(...points),min=Math.min(...points),range=(max-min)||1;
  const step=(w-pad*2)/(points.length-1);
  const pts=points.map((p,i)=>`${(pad+i*step).toFixed(1)},${(h-pad-((p-min)/range)*(h-pad*2)).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color||'#52B57D'}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function seomoatLogTable(entries,cols,onRemove){
  if(!entries.length)return '<p style="font-size:12px;color:var(--slate-l)">No checks logged yet.</p>';
  const rows=entries.slice().reverse().map(e=>`<tr>
    <td style="padding:5px 8px;font-size:12px;color:var(--slate-l);white-space:nowrap">${esc(e.date)}</td>
    ${cols.map(c=>`<td style="padding:5px 8px;font-size:12.5px">${esc(e[c.key]==null?'—':String(e[c.key]))}</td>`).join('')}
    <td style="padding:5px 8px;font-size:12px;color:var(--slate-l)">${esc(e.note||e.source||'')}</td>
    <td style="padding:5px 8px"><button onclick="${onRemove}('${e.id}')" style="background:none;border:none;color:var(--slate-l);cursor:pointer;font-size:12px" title="Remove">×</button></td>
  </tr>`).join('');
  return `<table style="width:100%;border-collapse:collapse"><thead><tr>
    <th style="text-align:left;padding:5px 8px;font-size:10.5px;color:var(--slate-l);text-transform:uppercase;letter-spacing:.04em">Date</th>
    ${cols.map(c=>`<th style="text-align:left;padding:5px 8px;font-size:10.5px;color:var(--slate-l);text-transform:uppercase;letter-spacing:.04em">${esc(c.label)}</th>`).join('')}
    <th></th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}
function addAuthorityEntry(){
  const da=parseFloat($('moatDaInput').value);
  if(isNaN(da)){toast('Enter at least a DA value first — check it free at moz.com/domain-analysis.');return;}
  const pa=parseFloat($('moatPaInput').value),cf=parseFloat($('moatCfInput').value),tf=parseFloat($('moatTfInput').value);
  SEOMOAT.authorityLog.push({id:uid(),date:new Date().toISOString().slice(0,10),da,pa:isNaN(pa)?null:pa,cf:isNaN(cf)?null:cf,tf:isNaN(tf)?null:tf,note:($('moatAuthorityNote').value||'').trim()});
  SEOMOAT.authorityLog.sort((a,b)=>a.date.localeCompare(b.date));
  ['moatDaInput','moatPaInput','moatCfInput','moatTfInput','moatAuthorityNote'].forEach(id=>$(id).value='');
  saveSeoMoat(); renderSeoMoat();
}
function removeAuthorityEntry(id){SEOMOAT.authorityLog=SEOMOAT.authorityLog.filter(e=>e.id!==id);saveSeoMoat();renderSeoMoat();}
function addBacklinkEntry(){
  const rd=parseInt($('moatRdInput').value),tb=parseInt($('moatTbInput').value);
  if(isNaN(rd)&&isNaN(tb)){toast('Enter referring domains or total backlinks first.');return;}
  SEOMOAT.backlinkLog.push({id:uid(),date:new Date().toISOString().slice(0,10),referringDomains:isNaN(rd)?null:rd,totalBacklinks:isNaN(tb)?null:tb,source:($('moatBlSource').value||'').trim(),note:($('moatBlNote').value||'').trim()});
  SEOMOAT.backlinkLog.sort((a,b)=>a.date.localeCompare(b.date));
  ['moatRdInput','moatTbInput','moatBlSource','moatBlNote'].forEach(id=>$(id).value='');
  saveSeoMoat(); renderSeoMoat();
}
function removeBacklinkEntry(id){SEOMOAT.backlinkLog=SEOMOAT.backlinkLog.filter(e=>e.id!==id);saveSeoMoat();renderSeoMoat();}
function addBrandEntry(){
  const bs=parseInt($('moatBrandSearches').value);
  if(isNaN(bs)){toast('Enter a branded-search number first — Google Search Console → Performance → query contains "binder".');return;}
  SEOMOAT.brandLog.push({id:uid(),date:new Date().toISOString().slice(0,10),brandedSearches:bs,note:($('moatBrandNote').value||'').trim()});
  SEOMOAT.brandLog.sort((a,b)=>a.date.localeCompare(b.date));
  $('moatBrandSearches').value='';$('moatBrandNote').value='';
  saveSeoMoat(); renderSeoMoat();
}
function removeBrandEntry(id){SEOMOAT.brandLog=SEOMOAT.brandLog.filter(e=>e.id!==id);saveSeoMoat();renderSeoMoat();}
function saveBrandNote(){SEOMOAT.brandNote=$('moatBrandNoteText').value;saveSeoMoat(true);}
function addUniqueDataEntry(){
  const label=($('moatUdLabel').value||'').trim(),value=($('moatUdValue').value||'').trim();
  if(!label||!value){toast('Add both a label and a value.');return;}
  SEOMOAT.uniqueDataLog.push({id:uid(),date:new Date().toISOString().slice(0,10),label,value,note:($('moatUdNote').value||'').trim()});
  $('moatUdLabel').value='';$('moatUdValue').value='';$('moatUdNote').value='';
  saveSeoMoat(); renderSeoMoat();
}
function removeUniqueDataEntry(id){SEOMOAT.uniqueDataLog=SEOMOAT.uniqueDataLog.filter(e=>e.id!==id);saveSeoMoat();renderSeoMoat();}
function updateTopicKeywords(key,value){
  const t=SEOMOAT.topics.find(x=>x.key===key); if(!t)return;
  t.keywords=value.split(',').map(s=>s.trim()).filter(Boolean);
  saveSeoMoat(true); renderSeoMoat();
}
async function renderSeoMoat(){
  const coverage=seomoatTopicCoverage();
  const uniq=await seomoatUniqueDataAuto();
  const score=seomoatScore(coverage,uniq);

  $('moatScoreRow').innerHTML=`
    <div class="stat"><b style="color:var(--accent)">${score.overall}</b><span>Content Moat Score</span></div>
    <div class="stat"><b>${score.topicalScore}</b><span>Topical coverage</span></div>
    <div class="stat"><b>${score.techScore}</b><span>Technical SEO</span></div>
    <div class="stat"><b>${score.scaleScore}</b><span>Scale &amp; network</span></div>
    <div class="stat"><b>${score.authorityScore==null?'—':score.authorityScore}</b><span>Authority (from DA)</span></div>`;

  $('moatTopics').innerHTML=coverage.map(t=>{
    const pct=Math.min(100,t.posts*25);
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
        <b style="font-size:13.5px">${esc(t.label)}</b>
        <span style="font-size:12px;color:var(--slate-l)">${t.posts} post${t.posts===1?'':'s'} · ${t.words.toLocaleString('en-IN')} words</span>
      </div>
      <div style="height:6px;border-radius:4px;background:var(--line);overflow:hidden;margin-bottom:6px"><div style="height:100%;width:${pct}%;background:var(--accent)"></div></div>
      <input class="field" style="font-size:11.5px;padding:5px 8px;margin:0" value="${esc((t.keywords||[]).join(', '))}" placeholder="Keywords, comma separated" onchange="updateTopicKeywords('${t.key}',this.value)">
    </div>`;
  }).join('');

  $('moatUniqueAuto').innerHTML=`
    <div class="stat"><b>${uniq.orders.toLocaleString('en-IN')}</b><span>Orders placed</span></div>
    <div class="stat"><b>${uniq.customers.toLocaleString('en-IN')}</b><span>Customers</span></div>
    <div class="stat"><b>${uniq.clientNames.toLocaleString('en-IN')}</b><span>Clients listed</span></div>
    <div class="stat"><b>${uniq.journalPosts}</b><span>Journal posts</span></div>`;
  $('moatUniqueLog').innerHTML=seomoatLogTable(SEOMOAT.uniqueDataLog,[{key:'label',label:'What'},{key:'value',label:'Value'}],'removeUniqueDataEntry');

  $('moatBrandNoteWrap').innerHTML=`<textarea class="field" id="moatBrandNoteText" rows="3" style="font-size:12.5px" onchange="saveBrandNote()">${esc(SEOMOAT.brandNote)}</textarea>`;
  $('moatBrandChart').innerHTML=seomoatSparkline(SEOMOAT.brandLog.map(e=>e.brandedSearches));
  $('moatBrandLog').innerHTML=seomoatLogTable(SEOMOAT.brandLog,[{key:'brandedSearches',label:'Branded searches/mo'}],'removeBrandEntry');

  $('moatScaleAuto').innerHTML=`
    <div class="stat"><b>${uniq.journalPosts}</b><span>Journal posts</span></div>
    <div class="stat"><b>${uniq.galleryProjects}</b><span>Gallery projects</span></div>
    <div class="stat"><b>${uniq.storeProducts}</b><span>Store products</span></div>
    <div class="stat"><b>${uniq.clientNames.toLocaleString('en-IN')}</b><span>Client network</span></div>`;
  $('moatBacklinkChart').innerHTML=seomoatSparkline(SEOMOAT.backlinkLog.map(e=>e.referringDomains).filter(v=>v!=null));
  $('moatBacklinkLog').innerHTML=seomoatLogTable(SEOMOAT.backlinkLog,[{key:'referringDomains',label:'Ref. domains'},{key:'totalBacklinks',label:'Total backlinks'}],'removeBacklinkEntry');

  $('moatAuthorityChart').innerHTML=seomoatSparkline(SEOMOAT.authorityLog.map(e=>e.da));
  $('moatAuthorityLog').innerHTML=seomoatLogTable(SEOMOAT.authorityLog,[{key:'da',label:'DA'},{key:'pa',label:'PA'},{key:'cf',label:'CF'},{key:'tf',label:'TF'}],'removeAuthorityEntry');

  $('moatTechChecklist').innerHTML=SEOMOAT_TECH_CHECKLIST.map(c=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px">
    <span style="color:${c.done?'var(--accent)':'var(--slate-l)'}">${c.done?'✓':'○'}</span>${esc(c.label)}</div>`).join('');
}
/* ================= Discount Coupons (admin-generated, percentage off) =================
   The `coupons` table has no public SELECT policy at all — the code, percentage, and admin note
   are never fetchable directly from the browser. validate_coupon()/redeem_coupon() are Postgres
   functions (SECURITY DEFINER) that answer exactly "does this code work, and what's it worth"
   without ever exposing the underlying table — see the checkout-side applyCoupon()/doPay(). */
function genCouponCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let s=''; for(let i=0;i<6;i++)s+=chars[Math.floor(Math.random()*chars.length)];
  return 'BINDER-'+s;
}
async function createCoupon(){
  const percent=parseFloat($('cpnPercent').value);
  if(isNaN(percent)||percent<=0||percent>100)return toast('Enter a valid percentage between 1 and 100.');
  let code=($('cpnCode').value||'').trim().toUpperCase();
  if(!code)code=genCouponCode();
  const maxUsesRaw=$('cpnMaxUses').value;
  const maxUses=maxUsesRaw?parseInt(maxUsesRaw):1; // defaults to one-time use — matches "generated on a user's demand"
  const expiryRaw=$('cpnExpiry').value;
  const note=($('cpnNote').value||'').trim();
  const {error}=await sb.from('coupons').insert({code,percent_off:percent,max_uses:isNaN(maxUses)?null:maxUses,expires_at:expiryRaw||null,note:note||null,created_by:(S.user&&S.user.email)||null});
  if(error){
    if(error.message&&error.message.toLowerCase().includes('duplicate'))return toast('That code already exists — try a different one, or leave it blank to auto-generate.');
    return toast('⚠ Could not create coupon: '+error.message);
  }
  toast('Coupon '+code+' created ✓');
  ['cpnCode','cpnPercent','cpnMaxUses','cpnExpiry','cpnNote'].forEach(id=>{if($(id))$(id).value='';});
  renderCouponRows();
}
async function renderCouponRows(){
  const tb=$('couponRows'); if(!tb)return;
  tb.innerHTML='<tr><td colspan="7" style="padding:10px 8px;font-size:12.5px;color:var(--slate-l)">Loading…</td></tr>';
  const {data,error}=await sb.from('coupons').select('*').order('created_at',{ascending:false});
  if(error){tb.innerHTML=`<tr><td colspan="7" style="padding:10px 8px;font-size:12.5px;color:var(--slate-l)">⚠ Could not load coupons: ${esc(error.message)}</td></tr>`;return;}
  if(!data||!data.length){tb.innerHTML='<tr><td colspan="7" style="padding:10px 8px;font-size:12.5px;color:var(--slate-l)">No coupons yet — create one above.</td></tr>';return;}
  const now=new Date();
  tb.innerHTML=data.map(c=>{
    const expired=c.expires_at&&new Date(c.expires_at)<now;
    const usedUp=c.max_uses!=null&&c.used_count>=c.max_uses;
    const status=!c.active?{label:'Deactivated',color:'var(--slate-l)'}:expired?{label:'Expired',color:'#B0432E'}:usedUp?{label:'Used up',color:'var(--slate-l)'}:{label:'Active',color:'var(--accent)'};
    return `<tr style="border-top:1px solid var(--line)">
      <td style="padding:8px;font-family:monospace;font-size:12.5px;font-weight:600">${esc(c.code)}</td>
      <td style="padding:8px;font-size:12.5px">${c.percent_off}%</td>
      <td style="padding:8px;font-size:12.5px">${c.used_count}${c.max_uses!=null?' / '+c.max_uses:' / ∞'}</td>
      <td style="padding:8px;font-size:12.5px">${c.expires_at?esc(new Date(c.expires_at).toLocaleDateString('en-IN')):'—'}</td>
      <td style="padding:8px;font-size:12px;color:var(--slate-l);max-width:220px">${esc(c.note||'')}</td>
      <td style="padding:8px;font-size:12px;font-weight:600;color:${status.color}">${status.label}</td>
      <td style="padding:8px;white-space:nowrap">
        ${c.active?`<button onclick="toggleCouponActive('${c.id}',false)" class="btn btn-ghost xs">Deactivate</button>`:`<button onclick="toggleCouponActive('${c.id}',true)" class="btn btn-ghost xs">Reactivate</button>`}
        <button onclick="deleteCoupon('${c.id}')" style="background:none;border:none;color:var(--slate-l);cursor:pointer;font-size:12px;margin-left:6px" title="Delete">×</button>
      </td>
    </tr>`;
  }).join('');
}
async function toggleCouponActive(id,active){
  const {error}=await sb.from('coupons').update({active}).eq('id',id);
  if(error)return toast('⚠ '+error.message);
  renderCouponRows();
}
async function deleteCoupon(id){
  if(!confirm("Delete this coupon permanently? This can't be undone."))return;
  const {error}=await sb.from('coupons').delete().eq('id',id);
  if(error)return toast('⚠ '+error.message);
  toast('Coupon deleted');
  renderCouponRows();
}
function adminTab(t){document.querySelectorAll('.admin-side button[data-ap]').forEach(b=>b.classList.toggle('on',b.dataset.ap===t));
  ['dashboard','orders','pdf','fonts','content','gallery-edit','products','journal','customers','payments','seomoat','coupons'].forEach(x=>{const el=$('ap-'+x);if(el)el.style.display=x===t?'block':'none'});
  if(t==='dashboard')renderDashboard(); if(t==='orders')renderOrderRows(); if(t==='pdf')renderPdfRows();
  if(t==='fonts')renderFontRows();
  if(t==='gallery-edit'){renderGalAdmin();migrateOversizedGalleryImages();} if(t==='products'){renderProductRows();migrateOversizedProductImages();}
  if(t==='content'){renderContentFields();loadSiteCfgIntoAdmin();renderClientsAdmin();renderPhotoServicesAdmin();migrateOversizedContentImages();migrateOversizedPhotoServiceImages();}
  if(t==='journal'){renderJournalAdmin();migrateOversizedHeroImages();}
  if(t==='customers')renderCustomerRows(); if(t==='payments')renderPaymentsForm();
  if(t==='seomoat')renderSeoMoat();
  if(t==='coupons')renderCouponRows();
}
async function renderDashboard(){$('dashOrders').textContent=S.orders.length;$('dashRevenue').textContent='₹'+S.orders.reduce((a,o)=>a+o.amount,0).toLocaleString('en-IN');
  $('dashProducts').textContent=CATALOG.length;
  const {count}=await sb.from('profiles').select('*',{count:'exact',head:true});
  $('dashCustomers').textContent=count??0;}
function renderOrderRows(){const tb=$('orderRows');
  tb.innerHTML=S.orders.length?S.orders.map(o=>{
    const vTag=(o.paymentId?(o.verified?'<span style="color:var(--accent);font-weight:700">✓ Verified</span>':'<span style="color:#B0432E;font-weight:700">Unverified</span>'):'<span style="color:var(--slate-l)">—</span>')
      +(o.payMethod&&o.payMethod!=='all'?' <span style="font-size:11px;color:var(--slate-l)">· '+esc(o.payMethod)+'</span>':'');
    return `<tr><td>${o.id}</td><td>${esc(o.customer)}</td><td>${esc(o.title)}</td><td>₹${o.amount.toLocaleString('en-IN')}</td><td>${o.date}</td><td>${o.status}</td><td style="font-size:12px">${esc(o.paperFinish||'matte')}</td><td>${vTag}</td></tr>`;
  }).join('')
    :'<tr><td colspan="7" style="color:#86868B;padding:24px">No orders yet.</td></tr>';}
/* ── Admin order editor ─────────────────────────────────────────────────────
   Loads an order's snapshot into the real editor so the admin can make
   changes, then re-renders all PDFs with an incremented version number.
   The customer's own saved project is NOT touched — only the order's snapshot
   and rendered PDFs are updated.                                             */

let ADMIN_EDIT_ORDER = null; // the order currently being edited by admin

async function openAdminEditor(orderId){
  // Fetch latest order data from Supabase
  let order = S.orders.find(o => o.id === orderId);
  const {data: dbOrder} = await sb.from('orders').select('*').eq('id', orderId).single();
  if(dbOrder) order = {...order, ...dbOrder};
  if(!order || !order.snapshot) return toast('No snapshot — order was placed before design saving was added.');

  ADMIN_EDIT_ORDER = JSON.parse(JSON.stringify(order)); // deep clone so changes are isolated

  // Show the editor mode panel, hide the table
  $('pdfManagerMain').style.display = 'none';
  $('pdfEditorMode').style.display = 'block';
  $('adminEditorTitle').textContent = order.title || order.id;
  $('adminEditorMeta').textContent = `${order.id} · ${order.customer_email || order.customer} · ${order.product} · v${order.pdf_version || 1}`;
  $('adminEditorOrderId').textContent = order.id;

  const snap = order.snapshot;
  const product = order.product;

  // Load the snapshot into the matching editor
  if(product === 'artprints'){
    AP.title = order.title;
    AP.boards = JSON.parse(JSON.stringify(snap.boards || []));
    AP.orient = [...(snap.orient || ['landscape','landscape','landscape','landscape'])];
    AP.photos = Object.entries(snap.photoMap || {}).map(([pid,info]) => ({
      id:pid, name:info.name||pid, url:info.url, w:info.w, h:info.h, lowRes:false
    }));
    AP._savedId = null; // not a project — an order
    // Rebuild PHOTO_PERMANENT_URLS so saves work
    Object.entries(snap.photoMap || {}).forEach(([pid,info]) => { PHOTO_PERMANENT_URLS[pid] = info.url; });
    openEditor('artprints');
  } else if(AP_SINGLE_VARIANTS[product]){
    const st = AP_SINGLE[product];
    st.title = order.title;
    st.board = JSON.parse(JSON.stringify(snap.board || null));
    st.orient = snap.orient || 'portrait';
    st.photos = Object.entries(snap.photoMap || {}).map(([pid,info]) => ({
      id:pid, name:info.name||pid, url:info.url, w:info.w, h:info.h, lowRes:false
    }));
    st._savedId = null;
    Object.entries(snap.photoMap || {}).forEach(([pid,info]) => { PHOTO_PERMANENT_URLS[pid] = info.url; });
    openEditor(product);
  } else {
    const ed = EDS[product];
    ed.doc = JSON.parse(JSON.stringify(snap.doc));
    ed.photos = Object.entries(snap.photoMap || {}).map(([pid,info]) => ({
      id:pid, name:info.name||pid, url:info.url, w:info.w, h:info.h, lowRes:false
    }));
    ed._savedId = null;
    ed._adminEdit = true; // flag so Save doesn't write to customer projects
    Object.entries(snap.photoMap || {}).forEach(([pid,info]) => { PHOTO_PERMANENT_URLS[pid] = info.url; });
    openEditor(product);
  }

  // Override the editor toolbar Save button behaviour for admin mode
  document.querySelectorAll('.ed-top .btn-ghost').forEach(btn => {
    if(btn.textContent.trim() === 'Save') btn.onclick = () => toast('Use "Save & Re-render" in the PDF Manager panel to save admin edits.');
  });
}

function exitAdminEditor(andReload){
  ADMIN_EDIT_ORDER = null;
  $('pdfEditorMode').style.display = 'none';
  $('pdfManagerMain').style.display = 'block';
  ACTIVE_EDITOR = null;
  document.querySelectorAll('.ed-root').forEach(x => x.classList.remove('active'));
  document.querySelector('.site-nav').style.display = '';
  if($('siteFooter'))$('siteFooter').style.display='block';
  go('admin');
  adminTab('pdf');
  if(andReload) renderPdfRows();
}

function adminEditorPreview(){
  const key = ACTIVE_EDITOR || (ADMIN_EDIT_ORDER?.product);
  if(!key) return;
  openPreview(key);
}

async function adminSaveAndRerender(){
  if(!ADMIN_EDIT_ORDER) return toast('No order being edited.');
  const btn = $('adminSaveRerenderBtn');
  btn.disabled = true; btn.textContent = 'Saving…';

  const order = ADMIN_EDIT_ORDER;
  const product = order.product;
  const newVersion = (order.pdf_version || 1) + 1;

  // Capture the current editor state as the new snapshot
  let newSnapshot;
  if(product === 'artprints'){
    newSnapshot = {
      boards: JSON.parse(JSON.stringify(AP.boards)),
      orient: [...AP.orient],
      photoMap: snapshotApPhotoMap()
    };
  } else if(AP_SINGLE_VARIANTS[product]){
    const st = AP_SINGLE[product];
    newSnapshot = {
      board: JSON.parse(JSON.stringify(st.board)),
      orient: st.orient,
      photoMap: snapshotApSinglePhotoMap(product)
    };
  } else {
    const ed = EDS[product];
    newSnapshot = {
      doc: JSON.parse(JSON.stringify(ed.doc)),
      photoMap: snapshotPhotoMap(ed.doc, ed.photos)
    };
  }

  // Build edit history entry
  const historyEntry = {
    version: newVersion,
    edited_by: S.user?.email || 'admin',
    edited_at: new Date().toISOString(),
    note: `Admin edit v${newVersion}`
  };

  // Persist updated snapshot + new version to Supabase
  const {error: upErr} = await sb.from('orders').update({
    snapshot: newSnapshot,
    pdf_version: newVersion,
    pdf_files: {}, // clear old PDFs — new ones are about to be generated
    render_status: 'pending',
    render_error: null,
    edit_history: [...(order.edit_history || []), historyEntry]
  }).eq('id', order.id);

  if(upErr){ toast('Could not save: ' + upErr.message); btn.disabled=false; btn.textContent='Save & Re-render →'; return; }

  // Update local orders array so the dashboard reflects it immediately
  const localIdx = S.orders.findIndex(o => o.id === order.id);
  if(localIdx >= 0){
    S.orders[localIdx].snapshot = newSnapshot;
    S.orders[localIdx].pdf_version = newVersion;
    S.orders[localIdx].pdfFiles = {}; // mirror the Supabase-side clear (pdf_files:{} above) so stale Ready/Queued state and old keys from the original order can't linger locally
    saveJSON('binder_orders', S.orders);
  }

  toast(`v${newVersion} saved — rendering PDFs…`);
  btn.textContent = 'Re-rendering…';

  // Trigger server-side re-render for all file keys
  const fileKeys = product === 'artprints' ? ['artboard'] : (AP_SINGLE_VARIANTS[product] ? ['print'] : ['cover', 'interior']);

  // Render PDFs directly in the browser. generatePdfForOrder looks the order up in S.orders by
  // id and reads its .snapshot directly — since the real order object was already updated above,
  // it's used as-is here. (This used to inject a temporary synthetic duplicate of the order via
  // S.orders.unshift()/.shift() to smuggle the new snapshot in — if a render ever failed partway
  // through this loop, the shift() that was supposed to clean it up never ran, permanently
  // leaving a duplicate "ghost" order sitting in the array.)
  for(const fk of fileKeys){
    try{
      await generatePdfForOrder(order.id, fk, null);
    } catch(e){ toast('Render failed for '+fk+': '+(e.message||e)); }
  }

  btn.disabled = false; btn.textContent = 'Save & Re-render →';
  toast(`✅ v${newVersion} rendered — PDF Manager updated`);
  exitAdminEditor(true);
}

async function renderPdfRows(){
  const tb=$('pdfRows');
  const bookOrders=S.orders.filter(o=>o.pdfFiles||o.product);
  if(!bookOrders.length){tb.innerHTML='<tr><td colspan="6" style="color:#86868B;padding:24px">No orders queued.</td></tr>';return;}
  const ids=bookOrders.map(o=>o.id);
  const {data:dbOrders}=await sb.from('orders').select('id,render_status,pdf_files,render_error,pdf_version,edit_history,customer_email').in('id',ids);
  const dbMap=Object.fromEntries((dbOrders||[]).map(o=>[o.id,o]));
  tb.innerHTML=bookOrders.map(o=>{
    const db=dbMap[o.id]||{};
    const renderStatus=db.render_status||'pending';
    const pdfFiles=db.pdf_files||{};
    const spec=(o.product==='tradebook'?'5.5″×8″ · monochrome · 300dpi':
      o.product==='artprints'?'6″×4″ boards · 4-up artboard':
      o.product==='artprint12x18'?'12″×18″ · full colour · 300dpi':
      o.product==='artprint16x20'?'16″×20″ · full colour · 300dpi':
      o.product==='photobook12'?'12″×12″ · full colour · 300dpi':
      o.product==='photobook18'?'12″×18″ · full colour · 300dpi (or 18″×12″ landscape)':'8.5″×8.5″ · full colour · 300dpi')
      +(o.qty>1?` · ${o.qty} copies`:'');
    const statusIcon={pending:'⏳',rendering:'⚙️ Rendering…',done:'✅',failed:'❌'}[renderStatus]||'⏳';
    const statusLabel=renderStatus==='failed'?`❌ Failed${db.render_error?' — '+db.render_error.slice(0,60):''}`:statusIcon+' '+renderStatus;
    const keys=o.product==='artprints'?['artboard']:(o.product==='artprint12x18'||o.product==='artprint16x20')?['print']:['cover','interior'];
    return keys.map(file=>{
      const pdfUrl=pdfFiles[file]||PDF_BLOBS[o.id+'|'+file]||null;
      const dlBtn=pdfUrl?`<a class="btn btn-dark xs" href="${pdfUrl}" target="_blank" download="binder-${o.id}-${file}-v${db.pdf_version||1}.pdf">⬇ v${db.pdf_version||1}</a>`:'';
      const renderBtn=`<button class="btn btn-ghost xs" onclick="reRenderOrder('${o.id}','${file}',this)" ${o.snapshot?'':'disabled title="No snapshot"'}>${pdfUrl?'Re-render':'Render'}</button>`;
      const editBtn=`<button class="btn btn-ghost xs" onclick="openAdminEditor('${o.id}')" title="Open in editor to make changes, then re-render"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="#52B57D" stroke-width="1.5" stroke-linejoin="round"/></svg> Edit Design</button>`;
      return `<tr>
        <td>${o.id}</td>
        <td style="font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis">${esc(o.customer_email||o.customer||'—')}</td>
        <td>${esc(o.product)}</td>
        <td>${esc(file)}</td>
        <td style="white-space:nowrap">${statusLabel}</td>
        <td style="white-space:nowrap;font-size:12px;color:var(--slate)">v${db.pdf_version||1}${(db.edit_history||[]).length>0?' ·  '+db.edit_history.length+' edit'+(db.edit_history.length>1?'s':''):''}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 6px">${editBtn}${renderBtn}${dlBtn}</td>
      </tr>`;
    }).join('');
  }).join('');
}

async function reRenderOrder(orderId,fileKey,btn){
  btn.disabled=true;btn.textContent='Triggering…';
  const local=S.orders.find(o=>o.id===orderId);
  if(local){
    await sb.from('orders').upsert({
      id:local.id,customer_email:local.customer,customer_name:S.user?.name||null,
      customer_id:S.user?.id||null,title:local.title,product:local.product,
      qty:local.qty,amount:local.amount,status:local.status,
      pay_method:local.payMethod||null,payment_id:local.paymentId||null,
      snapshot:local.snapshot,pdf_files:{},render_status:'pending'
    },{onConflict:'id'}).then(({error})=>{if(error)console.warn('upsert:',error.message)});
  }
  await sb.from('orders').update({render_status:'pending',render_error:null}).eq('id',orderId);
  try{
    btn.textContent='Rendering…';
    await generatePdfForOrder(orderId, fileKey, null);
    await sb.from('orders').update({render_status:'done'}).eq('id',orderId);
    toast('✅ PDF rendered — click Download');
  }catch(e){
    toast('❌ Render failed: '+(e.message||e));
    await sb.from('orders').update({render_status:'failed',render_error:e.message||String(e)}).eq('id',orderId);
  }
  btn.disabled=false;btn.textContent='Re-render';
  renderPdfRows();
}

function renderFontRows(){const wrap=$('fontRows');wrap.innerHTML='';
  Object.entries(FONT_CATS).forEach(([cat,list])=>{
    const h=document.createElement('div');h.style.cssText='margin:14px 0 8px;font-weight:700;font-size:13px;text-transform:capitalize';h.textContent=cat;wrap.appendChild(h);
    list.forEach(f=>{const row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)';
      row.innerHTML=`<span style="font-size:14px">${esc(f)}</span><button class="btn btn-ghost xs" onclick="removeFont('${cat}','${esc(f)}')">Remove</button>`;wrap.appendChild(row);});
  });}
function addCustomFont(){const name=$('newFontName').value.trim(),cat=$('newFontCat').value;if(!name)return toast('Enter a font name');
  if(!FONT_CATS[cat].includes(name))FONT_CATS[cat].push(name); saveFonts();$('newFontName').value='';renderFontRows();toast('Font added');}
function removeFont(cat,name){FONT_CATS[cat]=FONT_CATS[cat].filter(f=>f!==name);saveFonts();renderFontRows();}
const CONTENT_LABELS={
  heroHeading:'Homepage — Hero headline',heroBody:'Homepage — Hero body copy',
  photographyHeading:'Photography Services — headline',photographyIntro:'Photography Services — intro copy',photographyLeadCaption:'Photography Services — lead image caption',
  photobookTileTitle:'Homepage tile — Photobook title',photobookTileDesc:'Homepage tile — Photobook description',
  tradebookTileTitle:'Homepage tile — Trade Book title',tradebookTileDesc:'Homepage tile — Trade Book description',
  artprintsTileTitle:'Homepage tile — Art Prints title',artprintsTileDesc:'Homepage tile — Art Prints description',
  pricingHeading:'Pricing — headline',pricingLead:'Pricing — intro copy',
  storeIntro:'Store — intro copy',storeBooksTagline:'Store — Books tagline',storePhotoTagline:'Store — Photographs & Fine Art tagline',
  startPhotobookIntro:'Start a Photobook — intro copy',
  startPhotobookNeed:'Start a Photobook — "What you\'ll need" (one item per line)',
  startPhotobookSteps:'Start a Photobook — "How it works" (Title | Description, one step per line)',
  startTradebookIntro:'Start a Trade Book — intro copy',
  startTradebookNeed:'Start a Trade Book — "What you\'ll need" (one item per line)',
  startTradebookSteps:'Start a Trade Book — "How it works" (Title | Description, one step per line)',
  startArtprintsIntro:'Start Art Prints — intro copy',
  startArtprintsNeed:'Start Art Prints — "What you\'ll need" (one item per line)',
  startArtprintsSteps:'Start Art Prints — "How it works" (Title | Description, one step per line)',
};
// Multi-line fields (checklists / step lists) get a taller textarea than a one-line headline does.
const CONTENT_WIDE_FIELDS=new Set(['startPhotobookNeed','startPhotobookSteps','startTradebookNeed','startTradebookSteps','startArtprintsNeed','startArtprintsSteps','publishBody']);
// Every CMS-editable image on the site, in one registry — add a row here and it appears in
// Admin → Content Manager → Site Images automatically, uploading to the same "cms-images"
// Supabase Storage bucket as the hero images, synced through CONTENT/cmsSet('content', CONTENT).
const CONTENT_IMAGE_LABELS={
  photobookTileImageUrl:'Photobook — homepage tile & page hero (image or video)',
  tradebookTileImageUrl:'Trade Book — tile & page image',
  artprintsTileImageUrl:'Art Prints — tile & page image',
  isbnImageUrl:'ISBN page — image',
  photographyLeadImageUrl:'Photography Services — lead image (top of page)',
};
async function uploadCmsImage(key,file){
  if(!file)return;
  const row=document.querySelector(`[data-cimg-row="${key}"]`);
  const previewWrap=row?row.querySelector('[data-cimg-preview]'):null;
  const fileIsVideo=isVideoFile(file);
  function setPreview(url,isVideo){
    if(!previewWrap)return;
    previewWrap.innerHTML='';
    const mediaEl=document.createElement(isVideo?'video':'img');
    if(isVideo){mediaEl.muted=true;mediaEl.loop=true;mediaEl.playsInline=true;mediaEl.autoplay=true;}
    mediaEl.src=url;
    mediaEl.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
    previewWrap.appendChild(mediaEl);
    previewWrap.style.display='block';
  }
  const localPreview=URL.createObjectURL(file);
  setPreview(localPreview,fileIsVideo);
  toast('Uploading image…');
  try{
    const path=`site/${key}-${uid()}`;
    const {error,url}=await uploadWebImage(path,file,HERO_STYLE_CONTENT_KEYS.has(key)?HERO_IMAGE_MAX_PX:1600);
    if(error)throw error;
    CONTENT[key]=url;
    setPreview(url,fileIsVideo);
    saveContent();
    applyContent();
    if(ACTIVE_START_KEY)renderStartPage(ACTIVE_START_KEY);
    toast('Image updated ✓');
  }catch(e){
    console.warn('CMS image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
  }
}
function renderContentImageFields(){
  const wrap=$('contentImageFields'); if(!wrap)return; wrap.innerHTML='';
  Object.keys(CONTENT_IMAGE_LABELS).forEach(k=>{
    const row=document.createElement('div');
    row.style.cssText='display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:18px';
    row.setAttribute('data-cimg-row',k);
    const hasMedia=!!CONTENT[k];
    const previewWrap=document.createElement('div');
    previewWrap.setAttribute('data-cimg-preview','');
    previewWrap.style.cssText=`height:70px;width:100px;border-radius:8px;border:1px solid var(--line);overflow:hidden;background:var(--cream);display:${hasMedia?'block':'none'}`;
    if(hasMedia){
      const mediaEl=createMediaEl(CONTENT[k],'');
      mediaEl.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
      previewWrap.appendChild(mediaEl);
    }
    const controls=document.createElement('div');
    controls.innerHTML=`<input type="file" accept="image/*,video/*" id="cimg-input-${k}" style="display:none" onchange="uploadCmsImage('${k}',this.files[0])">
      <button class="btn btn-ghost sm" onclick="$('cimg-input-${k}').click()">Upload</button>
      <p style="font-size:12.5px;color:#6E6E73;margin-top:6px;max-width:360px">${CONTENT_IMAGE_LABELS[k]}</p>`;
    row.appendChild(previewWrap); row.appendChild(controls);
    wrap.appendChild(row);
  });
}
function renderContentFields(){const wrap=$('contentFields');wrap.innerHTML='';
  renderFaqAdmin();
  Object.keys(CONTENT_LABELS).forEach(k=>{const row=document.createElement('div');row.style.marginBottom='14px';
    const rows=CONTENT_WIDE_FIELDS.has(k)?6:2;
    row.innerHTML=`<label style="font-size:12.5px;color:#6E6E73;display:block;margin-bottom:4px">${CONTENT_LABELS[k]}</label><textarea class="field" rows="${rows}" data-ck="${k}">${esc(CONTENT[k])}</textarea>`;wrap.appendChild(row);});
  wrap.querySelectorAll('[data-ck]').forEach(el=>el.addEventListener('input',()=>{CONTENT[el.dataset.ck]=el.value;saveContent();applyContent();if(ACTIVE_START_KEY)renderStartPage(ACTIVE_START_KEY);}));
  renderContentImageFields();
  $('rte-publish').innerHTML=CONTENT.publishBody;ensureFontsForHtml(CONTENT.publishBody);
  $('rte-isbn').innerHTML=CONTENT.isbnBody; $('isbnTitleField').value=CONTENT.isbnTitle;ensureFontsForHtml(CONTENT.isbnBody);
}
/* ---------- Rich text editors (fixed) ----------
   Fixes for wonky formatting:
   1. Toolbar buttons use mousedown+preventDefault so the text selection in the
      editor is never lost when clicking a button (the old onclick blurred the
      editor first, so bold/H2/list often did nothing or hit the wrong text).
   2. formatBlock values are passed as '<h2>' (Firefox requires the brackets)
      and toggle back to a paragraph when the block is already that heading.
   3. Inserted images are stored as data URLs (the old blob: URLs died on
      refresh, leaving broken images in published posts).
   4. Pasted content is sanitised — only basic tags survive, so Word/Docs
      paste no longer injects broken spans, fonts and inline colors.
   5. New editors get p-tags as the default paragraph separator so headings
      and lists don't glue themselves to surrounding text. */
const RTE_TOOLS=[
  {cmd:'bold',label:'<b>B</b>',title:'Bold'},
  {cmd:'italic',label:'<i>I</i>',title:'Italic'},
  {cmd:'underline',label:'<u>U</u>',title:'Underline'},
  {sep:1},
  {select:'fontFamily',title:'Font',placeholder:'Font'},
  {select:'fontSize',title:'Size',placeholder:'Size',
    options:[['','Size'],['13px','13'],['15px','15'],['17px','17 (default)'],['19px','19'],['22px','22'],['26px','26'],['32px','32'],['40px','40']]},
  {sep:1},
  {cmd:'formatBlock',val:'h2',label:'H2',title:'Heading 2'},
  {cmd:'formatBlock',val:'h3',label:'H3',title:'Heading 3'},
  {cmd:'formatBlock',val:'blockquote',label:'❝',title:'Quote'},
  {sep:1},
  {cmd:'justifyLeft',label:'⟵',title:'Align left'},
  {cmd:'justifyCenter',label:'↔',title:'Align center'},
  {cmd:'justifyRight',label:'⟶',title:'Align right'},
  {cmd:'justifyFull',label:'☰',title:'Justify'},
  {sep:1},
  {cmd:'insertUnorderedList',label:'• List',title:'Bullet list'},
  {cmd:'insertOrderedList',label:'1. List',title:'Numbered list'},
  {sep:1},
  {cmd:'link',label:'🔗',title:'Insert link'},
  {cmd:'image',label:'▣ Image',title:'Insert image'},
  {cmd:'removeFormat',label:'⌫ Clear',title:'Clear formatting'}
];
// Font dropdown pulls from the same curated font list the book editor's Font Manager uses
// (FONT_CATS), grouped the same way, so Journal/Publish/ISBN typography stays consistent with
// the rest of the site's font system rather than inventing a separate list.
function rteFontOptionsHtml(){
  const cats=[['Sans',FONT_CATS.sans],['Serif',FONT_CATS.serif],['Decorative',FONT_CATS.decorative]];
  let html='<option value="">Font</option>';
  cats.forEach(([label,fonts])=>{
    html+=`<optgroup label="${esc(label)}">`+fonts.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('')+'</optgroup>';
  });
  return html;
}
// execCommand's fontName/fontSize are legacy and limited (fontSize only takes 1–7, not real px).
// Wrapping the current selection in a styled <span> directly gives real font-family/font-size
// control and survives sanitizeRteHtml's whitelist (font-family/font-size/text-align only).
function wrapSelectionStyle(prop,value){
  const sel=window.getSelection(); if(!sel.rangeCount)return;
  const range=sel.getRangeAt(0); if(range.collapsed)return;
  const span=document.createElement('span'); span.style[prop]=value;
  try{ range.surroundContents(span); }
  catch(e){ const frag=range.extractContents(); span.appendChild(frag); range.insertNode(span); }
  sel.removeAllRanges();
  const newRange=document.createRange(); newRange.selectNodeContents(span);
  sel.addRange(newRange);
}
function buildRteToolbars(){
  document.querySelectorAll('.rte-tools[data-rte-for]').forEach(bar=>{
    const target=bar.dataset.rteFor; bar.innerHTML='';
    RTE_TOOLS.forEach(t=>{
      if(t.sep){const s=document.createElement('span');s.className='rte-sep';bar.appendChild(s);return}
      if(t.select){
        const s=document.createElement('select'); s.className='rte-select'; s.title=t.title;
        s.innerHTML=t.select==='fontFamily'?rteFontOptionsHtml():t.options.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
        s.addEventListener('mousedown',e=>e.stopPropagation()); // keep selection alive while opening the dropdown
        s.addEventListener('change',()=>{ if(s.value)rte(target,t.select,s.value); s.selectedIndex=0; });
        bar.appendChild(s); return;
      }
      const b=document.createElement('button');b.type='button';b.innerHTML=t.label;b.title=t.title;
      /* mousedown+preventDefault keeps the editor's selection alive */
      b.addEventListener('mousedown',e=>e.preventDefault());
      b.addEventListener('click',()=>rte(target,t.cmd,t.val));
      bar.appendChild(b);
    });
    const ed=$('rte-'+target); if(ed&&!ed._rteWired)wireRteEditor(ed);
  });
}
function wireRteEditor(ed){
  ed._rteWired=true;
  try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
  /* placeholder handling — never publish "Start writing…" */
  ed.addEventListener('focus',()=>{if(ed.innerText.trim()==='Start writing…')ed.innerHTML='<p><br></p>'});
  /* sanitise pastes */
  ed.addEventListener('paste',e=>{
    e.preventDefault();
    const html=e.clipboardData.getData('text/html');
    if(html)document.execCommand('insertHTML',false,sanitizeRteHtml(html));
    else document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));
  });
}
const RTE_ALLOWED={P:1,BR:1,B:1,STRONG:1,I:1,EM:1,U:1,H2:1,H3:1,UL:1,OL:1,LI:1,BLOCKQUOTE:1,A:1,IMG:1,SPAN:1};
// Only these three CSS properties are ever allowed through — enough for font choice, size, and
// alignment, nothing that could carry an XSS payload or break the page's own layout.
function sanitizeRteStyle(el){
  const allowed=['font-family','font-size','text-align'];
  const kept=[];
  allowed.forEach(prop=>{ const v=el.style.getPropertyValue(prop); if(v)kept.push(`${prop}:${v}`); });
  if(kept.length)el.setAttribute('style',kept.join(';'));
  else el.removeAttribute('style');
}
function sanitizeRteHtml(html){
  const tpl=document.createElement('template'); tpl.innerHTML=html;
  (function walk(node){
    [...node.children].forEach(el=>{
      walk(el);
      const tag=el.tagName;
      if(tag==='SCRIPT'||tag==='STYLE'){el.remove();return}
      if(!RTE_ALLOWED[tag]){ // unwrap unknown tags, keep their children
        while(el.firstChild)node.insertBefore(el.firstChild,el);
        el.remove();return}
      // strip all attributes except the safe essentials
      [...el.attributes].forEach(a=>{
        if(a.name==='style')return; // handled separately below, whitelist-only
        const keep=(tag==='A'&&a.name==='href'&&/^https?:|^mailto:/i.test(el.getAttribute('href')||''))||
                   (tag==='IMG'&&a.name==='src'&&/^https?:|^data:image\//i.test(el.getAttribute('src')||''))||
                   (tag==='IMG'&&a.name==='alt');
        if(!keep)el.removeAttribute(a.name);
      });
      sanitizeRteStyle(el);
      if(tag==='SPAN'&&!el.getAttribute('style')&&!el.attributes.length){ // empty leftover span — unwrap
        while(el.firstChild)node.insertBefore(el.firstChild,el);
        el.remove();return;
      }
      if(tag==='A')el.setAttribute('target','_blank');
    });
  })(tpl.content);
  return tpl.innerHTML;
}
function rte(target,cmd,val){
  const ed=$('rte-'+target); ed.focus();
  if(cmd==='image')return rteImage(target);
  if(cmd==='link'){
    const url=prompt('Link URL (https://…)'); if(!url)return;
    if(!/^https?:\/\//i.test(url))return toast('Link must start with http(s)://');
    document.execCommand('createLink',false,url); return;
  }
  if(cmd==='formatBlock'){
    /* toggle: if the caret is already in that block, revert to a paragraph */
    let cur=''; try{cur=(document.queryCommandValue('formatBlock')||'').toLowerCase()}catch(e){}
    document.execCommand('formatBlock',false,cur===val?'<p>':'<'+val+'>');
    return;
  }
  if(cmd==='fontFamily'){ loadGoogleFont(val); wrapSelectionStyle('fontFamily',`'${val}'`); return; }
  if(cmd==='fontSize'){ wrapSelectionStyle('fontSize',val); return; }
  document.execCommand(cmd,false,val||null);
}
function rteImage(target){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=async()=>{const f=inp.files[0];if(!f)return;
    const ed=$('rte-'+target); ed.focus();
    // Insert a temporary placeholder immediately so the editor doesn't feel stuck, then swap
    // it for the real Storage URL once the upload finishes.
    const tempId='rte-img-'+uid();
    document.execCommand('insertHTML',false,`<img id="${tempId}" src="${URL.createObjectURL(f)}" style="opacity:.5">`);
    try{
      const path=`site/rte-${uid()}`;
      const {error,url}=await uploadWebImage(path,f);
      if(error)throw error;
      const placed=document.getElementById(tempId);
      if(placed){placed.src=url;placed.style.opacity='';placed.removeAttribute('id');}
    }catch(e){
      console.warn('RTE image upload failed:',e.message||e);
      toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
      const placed=document.getElementById(tempId); if(placed)placed.remove();
    }
  };
  inp.click();}
async function saveRte(target){
  let html=$('rte-'+target).innerHTML;
  if(html.includes('data:image/')){toast('Uploading pasted images…');html=await convertBodyImagesToStorage(html);$('rte-'+target).innerHTML=html;}
  if(target==='publish')CONTENT.publishBody=html;
  if(target==='isbn')CONTENT.isbnBody=html;
  saveContent();applyContent();}
/* Homepage hero and Scanning hero images are uploaded to Supabase Storage (not
   embedded as base64) and synced through CONTENT/cmsSet('content', CONTENT) —
   same fix as product images and Journal post heroes. The old versions of these
   two functions saved straight to localStorage with no cmsSet call at all, so
   a new hero image only ever showed up in the browser that uploaded it — every
   other visitor (and the same admin after a cache clear) kept seeing whatever
   was hardcoded in index.html. Needs the public "cms-images" storage bucket —
   see cms-setup.sql. */
let _heroImgUploading=false;
// The homepage hero image block was removed from index.html (there's nothing left in the admin
// panel to upload it from either) — these two functions are kept as harmless no-ops rather than
// deleted outright, since they're still referenced from a couple of startup/load call sites below
// and this avoids having to hunt down every one of those to keep things working.
async function uploadHeroImage(file){
  if(!file)return;
  const img=$('heroImage'); if(!img)return; // element no longer exists — hero image block was removed
  const hp=$('heroPreviewAdmin');
  const localPreview=URL.createObjectURL(file);
  img.src=localPreview; if(hp)hp.src=localPreview;
  _heroImgUploading=true; toast('Uploading image…');
  try{
    const path=`site/hero-${uid()}`;
    const {error,url}=await uploadWebImage(path,file,HERO_IMAGE_MAX_PX);
    if(error)throw error;
    CONTENT.heroImageUrl=url;
    loadHeroImage(); if(hp)hp.src=url;
    saveContent();
  }catch(e){
    console.warn('Hero image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
  }finally{
    _heroImgUploading=false;
  }
}
function loadHeroImage(){
  const img=$('heroImage'); if(!img)return; // element no longer exists — hero image block was removed
  if(!CONTENT.heroImageUrl)return;
  const vid=$('heroVideo');
  if(isVideoUrl(CONTENT.heroImageUrl)){
    if(vid){vid.src=CONTENT.heroImageUrl;vid.style.display='block';vid.play().catch(()=>{});}
    img.style.display='none';
  }else{
    if(vid)vid.style.display='none';
    img.src=CONTENT.heroImageUrl;img.style.display='block';
  }
}
let _scanHeroImgUploading=false;
async function uploadScanHeroImage(file){
  if(!file)return;
  const localPreview=URL.createObjectURL(file);
  $('scanHeroImage').src=localPreview;$('scanHeroImage').style.display='block';
  $('scanHeroPlaceholder').style.display='none';
  const prev=$('scanHeroPreviewAdmin');if(prev){prev.src=localPreview;prev.style.display='block';}
  _scanHeroImgUploading=true; toast('Uploading image…');
  try{
    const path=`site/scan-hero-${uid()}`;
    const {error,url}=await uploadWebImage(path,file,HERO_IMAGE_MAX_PX);
    if(error)throw error;
    CONTENT.scanHeroImageUrl=url;
    loadScanHeroImage();
    if(prev)prev.src=url;
    saveContent();
  }catch(e){
    console.warn('Scan hero image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
    $('scanHeroImage').style.display='none';$('scanHeroPlaceholder').style.display='block';
    if(prev)prev.style.display='none';
  }finally{
    _scanHeroImgUploading=false;
  }
}
function loadScanHeroImage(){
  if(CONTENT.scanHeroImageUrl&&$('scanHeroImage')){
    const vid=$('scanHeroVideo');
    if(isVideoUrl(CONTENT.scanHeroImageUrl)){
      if(vid){vid.src=CONTENT.scanHeroImageUrl;vid.style.display='block';vid.currentTime=0;vid.play().catch(()=>{});}
      $('scanHeroImage').style.display='none';
    }else{
      if(vid)vid.style.display='none';
      $('scanHeroImage').src=CONTENT.scanHeroImageUrl;$('scanHeroImage').style.display='block';
    }
    $('scanHeroPlaceholder').style.display='none';
    const prev=$('scanHeroPreviewAdmin');if(prev){prev.src=isVideoUrl(CONTENT.scanHeroImageUrl)?'':CONTENT.scanHeroImageUrl;prev.style.display=isVideoUrl(CONTENT.scanHeroImageUrl)?'none':'block';}
  }
}
let _storeHeroImgUploading=false;
async function uploadStoreHeroImage(file){
  if(!file)return;
  const img=$('storeHeroImage'); if(!img)return; // element no longer exists — store hero block was removed
  const localPreview=URL.createObjectURL(file);
  img.src=localPreview;img.style.display='block';
  $('storeHeroPlaceholder').style.display='none';
  const prev=$('storeHeroPreviewAdmin');if(prev){prev.src=localPreview;prev.style.display='block';}
  _storeHeroImgUploading=true; toast('Uploading image…');
  try{
    const path=`site/store-hero-${uid()}`;
    const {error,url}=await uploadWebImage(path,file,HERO_IMAGE_MAX_PX);
    if(error)throw error;
    CONTENT.storeHeroImageUrl=url;
    loadStoreHeroImage();
    if(prev){prev.src=isVideoUrl(url)?'':url;prev.style.display=isVideoUrl(url)?'none':'block';}
    saveContent();
  }catch(e){
    console.warn('Store hero image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
    img.style.display='none';$('storeHeroPlaceholder').style.display='block';
    if(prev)prev.style.display='none';
  }finally{
    _storeHeroImgUploading=false;
  }
}
function loadStoreHeroImage(){
  if(CONTENT.storeHeroImageUrl&&$('storeHeroImage')){
    const vid=$('storeHeroVideo');
    if(isVideoUrl(CONTENT.storeHeroImageUrl)){
      if(vid){vid.src=CONTENT.storeHeroImageUrl;vid.style.display='block';vid.play().catch(()=>{});}
      $('storeHeroImage').style.display='none';
    }else{
      if(vid)vid.style.display='none';
      $('storeHeroImage').src=CONTENT.storeHeroImageUrl;$('storeHeroImage').style.display='block';
    }
    $('storeHeroPlaceholder').style.display='none';
    const prev=$('storeHeroPreviewAdmin');if(prev){prev.src=isVideoUrl(CONTENT.storeHeroImageUrl)?'':CONTENT.storeHeroImageUrl;prev.style.display=isVideoUrl(CONTENT.storeHeroImageUrl)?'none':'block';}
  }
}

/* Products CRUD */
let _editingProductId=null,_pendingProductImg=null;
/* Shared drag-to-reorder for admin row lists (Gallery, Products). Each row needs a
   child '.row-handle' to grab; dropping shows a thin insertion line, matching the
   alignment-guide language used elsewhere in the editors. */
function wireRowReorder(rows,arr,onDone){
  let dragFrom=null;
  const clearLines=()=>rows.forEach(r=>{if(r.parentNode)r.parentNode.querySelectorAll('.reorder-line').forEach(l=>l.remove())});
  rows.forEach((row,i)=>{
    const handle=row.querySelector('.row-handle');
    if(handle){handle.draggable=true;handle.ondragstart=e=>{dragFrom=i;e.dataTransfer.effectAllowed='move';};}
    row.ondragover=e=>{if(dragFrom===null)return;e.preventDefault();
      const r=row.getBoundingClientRect(),before=(e.clientY-r.top)<r.height/2;
      clearLines();
      const line=document.createElement('div');line.className='reorder-line';
      row.parentNode.insertBefore(line,before?row:row.nextSibling);};
    row.ondrop=e=>{e.preventDefault();clearLines();
      if(dragFrom===null||dragFrom===i)return;
      const r=row.getBoundingClientRect(),before=(e.clientY-r.top)<r.height/2;
      const [item]=arr.splice(dragFrom,1);
      let to=before?i:i+1; if(dragFrom<to)to--;
      arr.splice(to,0,item); dragFrom=null; onDone();};
  });
}
function renderProductRows(){const wrap=$('productRows');wrap.innerHTML='';const rows=[];
  const legacyBase64=CATALOG.filter(p=>p.img&&p.img.startsWith('data:'));
  if(legacyBase64.length){
    const warn=document.createElement('div');
    warn.style.cssText='background:#FFF4E5;border:1px solid #F0B429;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:#7A4A00';
    warn.innerHTML=`⚠ ${legacyBase64.length} product(s) — ${legacyBase64.map(p=>esc(p.name)).join(', ')} — still have an old embedded image that\'s too large to sync reliably (this is why store updates were failing). Open each and re-upload the image to fix it.`;
    wrap.appendChild(warn);
  }
  CATALOG.forEach(p=>{const row=document.createElement('div');row.style.cssText='display:flex;gap:14px;align-items:center;padding:14px;border:1px solid var(--line);border-radius:12px;margin-bottom:10px';
    row.innerHTML=`<span class="row-handle" title="Drag to reorder">⠿</span><div style="width:52px;height:52px;border-radius:8px;flex:0 0 auto;overflow:hidden;${p.img?'':'background:#8A8A87'}">${p.img?mediaTagHtml(p.img,p.name,'style="width:100%;height:100%;object-fit:cover;display:block"'):''}</div><div style="flex:1"><b style="font-size:14px">${esc(p.name)}</b><div style="font-size:12.5px;color:#6E6E73">${esc(p.blurb)}</div></div>
      <b>${inr(p.price)}</b><button class="btn btn-ghost xs" onclick="openProductForm('${p.id}')">Edit</button><button class="btn btn-ghost xs" onclick="deleteProduct('${p.id}')">Delete</button>`;
    wrap.appendChild(row);rows.push(row);});
  wireRowReorder(rows,CATALOG,()=>{saveCatalog();renderProductRows();renderStore();});}
function openProductForm(id){_editingProductId=id||null;_pendingProductImg=null;const p=id?CATALOG.find(x=>x.id===id):null;
  $('pfTitle').textContent=id?'Edit product':'Add product';$('pfName').value=p?p.name:'';$('pfBlurb').value=p?p.blurb:'';
  $('pfDetails').value=p&&p.details?p.details:'';
  $('pfPrice').value=p?(p.price/100):'';$('pfBadge').value=p&&p.badge?p.badge:'';
  $('pfCategory').value=p&&p.category?p.category:'Books';
  const prev=$('pfImgPreview');
  const imgUrl=p&&p.img&&!p.img.startsWith('data:')?p.img:'';
  $('pfImgUrl').value=imgUrl;
  if(p&&p.img){prev.src=p.img;prev.style.display='block'}else prev.style.display='none';
  show('productFormModal');}
/* Product images are uploaded to Supabase Storage (not embedded as base64) — embedding
   base64 directly in the CATALOG JSON blew past localStorage's quota silently (the
   quota-exceeded error was swallowed by saveJSON's try/catch) and bloated the `cms`
   table row so syncing broke. Needs a public "cms-images" bucket — see cms-setup.sql. */
let _productImgUploading=false;
async function uploadProductImageToStorage(file){
  const path=`products/${uid()}`;
  const {error,url}=await uploadWebImage(path,file);
  if(error)throw error;
  return url;
}
async function onProductImageUpload(file){
  if(!file)return;
  const prev=$('pfImgPreview');
  // Instant local preview while the real upload happens in the background.
  prev.src=URL.createObjectURL(file); prev.style.display='block';
  _productImgUploading=true; toast('Uploading image…');
  try{
    const url=await uploadProductImageToStorage(file);
    _pendingProductImg=url; prev.src=url;
    toast('Image uploaded ✓');
  }catch(e){
    console.warn('Product image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
    _pendingProductImg=null; prev.style.display='none';
  }finally{
    _productImgUploading=false;
  }
}
function saveProductForm(){
  if(_productImgUploading)return toast('Still uploading the image — hang on a sec and try again');
  const name=$('pfName').value.trim(),blurb=$('pfBlurb').value.trim(),details=$('pfDetails').value.trim(),price=Math.round(parseFloat($('pfPrice').value)*100);
  if(!name)return toast('Enter a name'); if(!price)return toast('Enter a price');
  const urlImg=$('pfImgUrl').value.trim();
  const category=$('pfCategory').value;
  const finalImg=_pendingProductImg||(urlImg||null);
  if(_editingProductId){const p=CATALOG.find(x=>x.id===_editingProductId);Object.assign(p,{name,blurb,details,price,badge:$('pfBadge').value.trim()||null,category});if(!p.slug)p.slug=uniqueProductSlug(slugify(name),p.id);if(finalImg)p.img=finalImg;}
  else{const id=uid();CATALOG.push({id,name,blurb,details,price,badge:$('pfBadge').value.trim()||null,grad:['#141414','#52B57D'],img:finalImg,category,slug:uniqueProductSlug(slugify(name),id)});}
  saveCatalog();hide('productFormModal');renderProductRows();renderStore();toast('Saved');}
function deleteProduct(id){if(!confirm('Remove this product?'))return;CATALOG=CATALOG.filter(p=>p.id!==id);saveCatalog();renderProductRows();renderStore();}
/* ================= Customers (detailed) =================
   Customer records merge three sources by email:
   1. Supabase `profiles` (name, email, created_at) — signup accounts
   2. Local order history (S.orders) — order count, totals, line details
   3. Local admin metadata (`binder_customer_meta`) — phone, address, GSTIN,
      notes, edits, and imported customers. Kept locally so no schema change
      to Supabase is required. */
let CUSTMETA=loadJSON('binder_customer_meta',{});   // keyed by lowercase email
let _custCache=null,_editingCustEmail=null;
function saveCustMeta(){saveJSON('binder_customer_meta',CUSTMETA)}
function custOrders(email){const e=(email||'').toLowerCase();return S.orders.filter(o=>(o.customer||'').toLowerCase()===e)}
async function buildCustomers(){
  const map={};
  const add=(email,src)=>{const k=(email||'').toLowerCase();if(!k)return null;
    if(!map[k])map[k]={email:email,name:'',joined:null,fromSupabase:false};
    return map[k];};
  try{
    const {data:users}=await sb.from('profiles').select('*').order('created_at',{ascending:false});
    (users||[]).forEach(u=>{const c=add(u.email);if(!c)return;c.name=u.name||c.name;c.joined=u.created_at||c.joined;c.fromSupabase=true;c.supabaseId=u.id;});
  }catch(e){/* offline — local data still renders */}
  S.orders.forEach(o=>{const c=add(o.customer);if(c&&!c.name)c.name=o.customer.split('@')[0];});
  Object.keys(CUSTMETA).forEach(k=>{const m=CUSTMETA[k];const c=add(m.email||k);if(!c)return;
    if(m.name)c.name=m.name; if(m.joined)c.joined=m.joined;
    c.phone=m.phone||'';c.address=m.address||'';c.gst=m.gst||'';c.notes=m.notes||'';});
  Object.values(map).forEach(c=>{
    const os=custOrders(c.email);
    c.orderCount=os.length; c.spend=os.reduce((a,o)=>a+(o.amount||0),0); c.orders=os;
    if(!c.joined&&os.length)c.joined=null;
    c.phone=c.phone||'';c.address=c.address||'';c.gst=c.gst||'';c.notes=c.notes||'';
  });
  return Object.values(map);
}
async function renderCustomerRows(fromCache){
  const wrap=$('customerList');
  if(!fromCache||!_custCache){wrap.innerHTML='<p style="color:var(--slate-l);padding:20px">Loading…</p>';_custCache=await buildCustomers();}
  let list=[..._custCache];
  const q=($('custSearch').value||'').trim().toLowerCase();
  if(q)list=list.filter(c=>[c.name,c.email,c.phone,c.gst,c.address].some(v=>(v||'').toLowerCase().includes(q)));
  const sort=$('custSort').value;
  const jt=c=>c.joined?new Date(c.joined).getTime():0;
  if(sort==='newest')list.sort((a,b)=>jt(b)-jt(a));
  if(sort==='oldest')list.sort((a,b)=>jt(a)-jt(b));
  if(sort==='nameaz')list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  if(sort==='nameza')list.sort((a,b)=>(b.name||'').localeCompare(a.name||''));
  if(sort==='orders')list.sort((a,b)=>b.orderCount-a.orderCount);
  if(sort==='spend')list.sort((a,b)=>b.spend-a.spend);
  $('custCount').textContent=list.length+' customer'+(list.length===1?'':'s')+(q?' matching "'+q+'"':'');
  if(!list.length){wrap.innerHTML='<p style="color:#86868B;padding:20px">No customers'+(q?' match your search.':' yet.')+'</p>';return}
  wrap.innerHTML='';
  list.forEach(c=>{
    const card=document.createElement('div');card.className='cust-card';
    const initials=(c.name||c.email||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const joined=c.joined?new Date(c.joined).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—';
    card.innerHTML=`<div class="cust-head">
        <div class="cust-avatar">${esc(initials)}</div>
        <div style="flex:1;min-width:160px"><b style="font-size:14px">${esc(c.name||'(no name)')}</b><div style="font-size:12.5px;color:#6E6E73">${esc(c.email)}</div></div>
        <div style="font-size:12.5px;color:var(--slate)">${c.orderCount} order${c.orderCount===1?'':'s'} · ₹${c.spend.toLocaleString('en-IN')}</div>
        <div style="font-size:12.5px;color:var(--slate-l)">Joined ${joined}</div>
        ${c.gst?'<span style="font-size:11px;background:var(--cream);border:1px solid var(--line);border-radius:6px;padding:3px 8px">GST</span>':''}
        <button class="btn btn-ghost xs" data-edit>Edit</button>
      </div>
      <div class="cust-detail">
        <div class="cust-grid">
          <div><b>Phone</b><span>${esc(c.phone||'—')}</span></div>
          <div><b>Address</b><span>${esc(c.address||'—')}</span></div>
          <div><b>GSTIN</b><span>${esc(c.gst||'—')}</span></div>
          <div><b>Joined</b><span>${joined}</span></div>
          <div><b>Account</b><span>${c.fromSupabase?'Registered (Supabase)':'Local / imported'}</span></div>
          ${c.notes?`<div style="grid-column:1/-1"><b>Notes</b><span>${esc(c.notes)}</span></div>`:''}
        </div>
        <b style="display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--slate-l);margin-bottom:6px;font-weight:700">Orders</b>
        ${c.orders.length?`<table><thead><tr><th>Order</th><th>Product</th><th>Amount</th><th>Placed</th><th>Status</th><th>Payment</th></tr></thead><tbody>${
          c.orders.map(o=>`<tr><td>${o.id}</td><td>${esc(o.title)}</td><td>₹${(o.amount||0).toLocaleString('en-IN')}</td><td>${esc(o.date||'')}</td><td>${esc(o.status||'')}</td><td>${o.paymentId?(o.verified?'✓ Verified':'Unverified'):'—'}</td></tr>`).join('')
        }</tbody></table>`:'<p style="font-size:13px;color:#86868B;margin:0">No orders yet.</p>'}
      </div>`;
    card.querySelector('.cust-head').onclick=e=>{if(e.target.closest('[data-edit]'))return;card.querySelector('.cust-detail').classList.toggle('open');};
    card.querySelector('[data-edit]').onclick=()=>openCustomerForm(c.email);
    wrap.appendChild(card);
  });
}
function openCustomerForm(email){
  const c=(_custCache||[]).find(x=>x.email.toLowerCase()===(email||'').toLowerCase());
  _editingCustEmail=c?c.email:null;
  $('cfTitle').textContent=c?'Edit customer':'Add customer';
  $('cfName').value=c?c.name:'';$('cfEmail').value=c?c.email:'';
  $('cfPhone').value=c?c.phone:'';$('cfAddress').value=c?c.address:'';
  $('cfGst').value=c?c.gst:'';$('cfNotes').value=c?c.notes:'';
  $('cfJoined').value=c&&c.joined?new Date(c.joined).toISOString().slice(0,10):'';
  show('custFormModal');
}
function saveCustomerForm(){
  const email=$('cfEmail').value.trim();
  if(!email||!/^\S+@\S+\.\S+$/.test(email))return toast('Enter a valid email');
  const gst=$('cfGst').value.trim().toUpperCase();
  if(gst&&!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(gst))return toast('GSTIN format looks wrong (15 chars, e.g. 07ABCDE1234F1Z5)');
  const key=email.toLowerCase();
  /* if email changed, move the meta record */
  if(_editingCustEmail&&_editingCustEmail.toLowerCase()!==key)delete CUSTMETA[_editingCustEmail.toLowerCase()];
  CUSTMETA[key]={email,name:$('cfName').value.trim(),phone:$('cfPhone').value.trim(),
    address:$('cfAddress').value.trim(),gst,notes:$('cfNotes').value.trim(),
    joined:$('cfJoined').value?new Date($('cfJoined').value).toISOString():null};
  saveCustMeta();
  /* best-effort name sync back to Supabase for registered customers */
  const c=(_custCache||[]).find(x=>x.email.toLowerCase()===key);
  if(c&&c.fromSupabase&&c.supabaseId)sb.from('profiles').update({name:CUSTMETA[key].name}).eq('id',c.supabaseId).then(()=>{},()=>{});
  hide('custFormModal');toast('Customer saved');renderCustomerRows();
}
/* ---- Export ---- */
function csvCell(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function downloadBlob(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
async function exportCustomers(fmt){
  const list=_custCache||await buildCustomers();
  const stamp=new Date().toISOString().slice(0,10);
  if(fmt==='json'){downloadBlob('binder-customers-'+stamp+'.json','application/json',
    JSON.stringify(list.map(c=>({name:c.name,email:c.email,phone:c.phone,address:c.address,gst:c.gst,notes:c.notes,
      joined:c.joined,orderCount:c.orderCount,totalSpendINR:c.spend,
      orders:c.orders.map(o=>({id:o.id,product:o.title,amountINR:o.amount,date:o.date,status:o.status,paymentId:o.paymentId||null,verified:!!o.verified}))})),null,2));
    toast('Exported JSON');return}
  const head=['Name','Email','Phone','Address','GSTIN','Joined','Orders','Total Spend (INR)','Order Details','Notes'];
  const rows=list.map(c=>[c.name,c.email,c.phone,c.address,c.gst,
    c.joined?new Date(c.joined).toISOString().slice(0,10):'',
    c.orderCount,c.spend,
    c.orders.map(o=>`${o.id}: ${o.title} — ₹${o.amount} (${o.status}${o.paymentId?(o.verified?', verified':', unverified'):''})`).join(' | '),
    c.notes].map(csvCell).join(','));
  downloadBlob('binder-customers-'+stamp+'.csv','text/csv;charset=utf-8','\ufeff'+[head.join(','),...rows].join('\r\n'));
  toast('Exported CSV');
}
/* ---- Import (CSV or JSON, merged by email) ---- */
function parseCsv(text){
  const rows=[];let row=[],cell='',inQ=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(inQ){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else inQ=false}else cell+=ch;}
    else if(ch==='"')inQ=true;
    else if(ch===','){row.push(cell);cell=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(c=>c!==''))rows.push(row);row=[];}
    else cell+=ch;}
  row.push(cell); if(row.some(c=>c!==''))rows.push(row);
  return rows;
}
function importCustomers(file){
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      let recs=[];
      if(/\.json$/i.test(file.name)||r.result.trim().startsWith('[')){
        const arr=JSON.parse(r.result); if(!Array.isArray(arr))throw new Error('JSON must be an array');
        recs=arr;
      }else{
        const rows=parseCsv(r.result.replace(/^\ufeff/,'')); if(rows.length<2)throw new Error('CSV needs a header row + data');
        const hdr=rows[0].map(h=>h.trim().toLowerCase());
        const col=names=>hdr.findIndex(h=>names.some(n=>h.includes(n)));
        const ci={name:col(['name']),email:col(['email','mail']),phone:col(['phone','mobile','contact']),
          address:col(['address']),gst:col(['gst']),joined:col(['join','created','date']),notes:col(['note'])};
        recs=rows.slice(1).map(row=>({name:ci.name>-1?row[ci.name]:'',email:ci.email>-1?row[ci.email]:'',
          phone:ci.phone>-1?row[ci.phone]:'',address:ci.address>-1?row[ci.address]:'',
          gst:ci.gst>-1?row[ci.gst]:'',joined:ci.joined>-1?row[ci.joined]:'',notes:ci.notes>-1?row[ci.notes]:''}));
      }
      let added=0,updated=0,skipped=0;
      recs.forEach(rec=>{
        const email=(rec.email||'').trim();
        if(!/^\S+@\S+\.\S+$/.test(email)){skipped++;return}
        const key=email.toLowerCase(),existing=CUSTMETA[key];
        let joined=null; if(rec.joined){const d=new Date(rec.joined);if(!isNaN(d))joined=d.toISOString();}
        CUSTMETA[key]={email,
          name:(rec.name||'').trim()||(existing?existing.name:''),
          phone:(rec.phone||'').trim()||(existing?existing.phone:''),
          address:(rec.address||'').trim()||(existing?existing.address:''),
          gst:((rec.gst||'').trim().toUpperCase())||(existing?existing.gst:''),
          notes:(rec.notes||'').trim()||(existing?existing.notes:''),
          joined:joined||(existing?existing.joined:null)};
        existing?updated++:added++;
      });
      saveCustMeta();
      toast(`Imported: ${added} new, ${updated} updated${skipped?', '+skipped+' skipped (bad email)':''}`);
      renderCustomerRows();
    }catch(e){toast('Import failed: '+e.message)}
  };
  r.readAsText(file);
}
function renderPaymentsForm(){$('payKeyId').value=PAYCFG.razorpayKeyId||'';$('payStatus').textContent=PAYCFG.razorpayKeyId?'Razorpay Checkout is live.':'No key configured — orders will be recorded without online payment.';
  $('payVerifyWarn').style.display=(PAYCFG.razorpayKeyId||'').startsWith('rzp_live_')?'block':'none';}
function savePaymentsForm(){PAYCFG.razorpayKeyId=$('payKeyId').value.trim();savePayCfg();renderPaymentsForm();toast('Saved');}

/* Journal (with AI SEO/grammar check + hero image + share buttons) */
let _pendingPostHero=null,_editingPostId=null,_postHeroUploading=false;
/* Post hero images are uploaded to Supabase Storage (not embedded as base64) —
   embedding base64 directly in the POSTS JSON blew past localStorage's quota
   silently (the quota-exceeded error was swallowed by saveJSON's try/catch) and
   bloated the `cms` table row so syncing broke, same failure mode fixed for
   product images in uploadProductImageToStorage(). Needs the public "cms-images"
   storage bucket — see cms-setup.sql. */
async function uploadPostHeroToStorage(file){
  const path=`posts/${uid()}`;
  const {error,url}=await uploadWebImage(path,file);
  if(error)throw error;
  return url;
}
// Pasting an image directly into the post body (not the hero field) embeds it as a base64
// data: URI — sanitizeRteHtml allows that through so the paste isn't silently dropped, but a
// data: URI can be megabytes of text. That bloats the saved post past what Supabase/localStorage
// will accept, cmsSet fails silently, and the very next page refresh shows the last successfully
// synced (older) version — which looks exactly like "the post vanished". This converts every
// pasted base64 image to a real Storage URL before the post is ever saved, so no oversized
// payload is ever attempted in the first place.
async function convertBodyImagesToStorage(html){
  const tpl=document.createElement('template'); tpl.innerHTML=html;
  const dataImgs=[...tpl.content.querySelectorAll('img[src^="data:image/"]')];
  for(const img of dataImgs){
    try{
      const res=await fetch(img.src); const blob=await res.blob();
      const path=`posts/body-${uid()}`;
      const {error,url}=await uploadWebImage(path,new File([blob],'body.jpg',{type:blob.type||'image/jpeg'}));
      if(error)throw error;
      img.setAttribute('src',url);
    }catch(e){
      console.warn('Body image upload failed, removing oversized inline image:',e.message||e);
      img.remove(); // better to drop one image than silently fail to save the whole post
    }
  }
  return tpl.innerHTML;
}
async function uploadDataUrlToStorage(dataUrl,pathPrefix){
  const res=await fetch(dataUrl); const blob=await res.blob();
  const path=`${pathPrefix}-${uid()}`;
  const {error,url}=await uploadWebImage(path,new File([blob],'legacy.jpg',{type:blob.type||'image/jpeg'}));
  if(error)throw error;
  return url;
}
// Hero images uploaded before resizeImageForWeb existed are still sitting in Storage at full,
// unoptimized size — often several MB — and get served at that size to every visitor even though
// they only ever display as a small thumbnail on the Journal listing page. This re-fetches each
// one once, runs it through the same shared resize function new uploads use, and replaces it with
// a properly-sized version. Flags each post afterward so this never re-processes the same image
// twice — deliberately admin-triggered (not run for every public visitor) since it's a one-time
// cleanup pass, not something that should cost bandwidth on every page load.
// Shared core for every "re-optimize an already-uploaded image" migration below — fetches
// whatever's currently at the URL, resizes it exactly the way a fresh upload would be, stores
// the result, and returns the new URL (or null if anything went wrong, so the caller can flag it
// and move on rather than retrying a broken URL forever).
async function reoptimizeExistingImage(url,pathPrefix,maxDimensionPx){
  try{
    const res=await fetch(url); const blob=await res.blob();
    const file=new File([blob],'img.jpg',{type:blob.type||'image/jpeg'});
    const path=`${pathPrefix}-${uid()}`;
    const {error,url:newUrl}=await uploadWebImage(path,file,maxDimensionPx);
    if(error)throw error;
    return newUrl;
  }catch(e){
    console.warn('Image re-optimisation failed for',url,e.message||e);
    return null;
  }
}
async function migrateOversizedHeroImages(){
  let changed=false;
  for(const p of POSTS){
    if(!p.hero||p._heroOptimized||!/^https?:\/\//.test(p.hero))continue;
    const newUrl=await reoptimizeExistingImage(p.hero,'posts');
    if(newUrl)p.hero=newUrl;
    p._heroOptimized=true; changed=changed||!!newUrl;
  }
  if(changed){
    saveJSON('cms_posts',POSTS);
    const ok=await cmsSet('posts',POSTS);
    if(!ok)console.warn('Hero re-optimisation finished locally but cloud sync failed — it will keep retrying automatically.');
    renderBlog();
    toast('Journal thumbnails optimised for faster loading ✓');
  }
}
// Same idea, for Store product images. uploadProductImageToStorage only started resizing on
// upload once that fix shipped — any product image uploaded before that is still sitting in
// Storage at full original size and getting served at that size on every visit to the store,
// even though it only ever displays as a small card thumbnail. This is very likely the real
// cause of "store thumbnails still load slowly": the fix to new uploads doesn't do anything
// for images that were already there. Re-fetches each one once, resizes it the same way new
// uploads are, and swaps it in — flagged afterward so it never reprocesses the same image twice.
async function migrateOversizedProductImages(){
  let changed=false;
  for(const p of CATALOG){
    if(!p.img||p._imgOptimized||!/^https?:\/\//.test(p.img))continue;
    const newUrl=await reoptimizeExistingImage(p.img,'products');
    if(newUrl)p.img=newUrl;
    p._imgOptimized=true; changed=changed||!!newUrl;
  }
  if(changed){
    saveCatalog();
    renderStore(); renderProductRows();
    toast('Store thumbnails optimised for faster loading ✓');
  }
}
// Same idea again, for every general site image — homepage hero, Scanning hero, Store hero, the
// homepage tile images, the ISBN page image, and the Photography Services lead image. All of
// these had the same "resize on new upload only" fix applied earlier, which does nothing for
// whatever was already sitting in Storage before that fix shipped.
const CONTENT_IMAGE_MIGRATE_KEYS=['heroImageUrl','scanHeroImageUrl','storeHeroImageUrl','homeSecondaryImageUrl','photobookTileImageUrl','tradebookTileImageUrl','artprintsTileImageUrl','isbnImageUrl','photographyLeadImageUrl'];
const HERO_STYLE_CONTENT_KEYS=new Set(['heroImageUrl','scanHeroImageUrl','storeHeroImageUrl','photographyLeadImageUrl','photobookTileImageUrl']);
async function migrateOversizedContentImages(){
  let changed=false;
  const optimizedFlags=CONTENT._imagesOptimized||(CONTENT._imagesOptimized={});
  if(!CONTENT._heroResolutionFixed){
    HERO_STYLE_CONTENT_KEYS.forEach(k=>{delete optimizedFlags[k];});
    CONTENT._heroResolutionFixed=true;
    changed=true;
  }
  for(const key of CONTENT_IMAGE_MIGRATE_KEYS){
    const url=CONTENT[key];
    if(!url||optimizedFlags[key]||!/^https?:\/\//.test(url))continue;
    const newUrl=await reoptimizeExistingImage(url,'site/'+key,HERO_STYLE_CONTENT_KEYS.has(key)?HERO_IMAGE_MAX_PX:1600);
    if(newUrl)CONTENT[key]=newUrl;
    optimizedFlags[key]=true; changed=changed||!!newUrl;
  }
  if(changed){
    saveJSON('cms_content',CONTENT);
    const ok=await cmsSet('content',CONTENT);
    if(!ok)console.warn('Image re-optimisation finished locally but cloud sync failed — it will keep retrying automatically.');
    applyContent(); loadHeroImage(); loadScanHeroImage(); loadStoreHeroImage(); loadPhotographyLeadImage();
    toast('Site images optimised for faster loading ✓');
  }
}
// And the Photography Services section galleries — same story, same fix.
async function migrateOversizedPhotoServiceImages(){
  let changed=false;
  for(const section of PHOTO_SERVICES){
    for(const img of (section.images||[])){
      if(!img.url||img._optimized||!/^https?:\/\//.test(img.url))continue;
      const newUrl=await reoptimizeExistingImage(img.url,'photo-services/'+section.key);
      if(newUrl)img.url=newUrl;
      img._optimized=true; changed=changed||!!newUrl;
    }
  }
  if(changed){
    saveJSON('cms_photo_services',PHOTO_SERVICES);
    const ok=await cmsSet('photo_services',PHOTO_SERVICES);
    if(!ok)console.warn('Image re-optimisation finished locally but cloud sync failed — it will keep retrying automatically.');
    renderPhotoServices();
    toast('Photography Services images optimised for faster loading ✓');
  }
}
// Gallery images all need the larger hero-style cap, since any one of them can be marked as the
// full-width featured banner — unlike a normal thumbnail grid where every image stays small.
async function migrateOversizedGalleryImages(){
  let changed=false;
  for(const img of GALLERY){
    if(!img.url||img._optimizedV2||!/^https?:\/\//.test(img.url))continue;
    const newUrl=await reoptimizeExistingImage(img.url,'gallery',HERO_IMAGE_MAX_PX);
    if(newUrl)img.url=newUrl;
    img._optimizedV2=true; changed=changed||!!newUrl;
  }
  if(changed){
    saveJSON('cms_gallery',GALLERY);
    const ok=await cmsSet('gallery',GALLERY);
    if(!ok)console.warn('Image re-optimisation finished locally but cloud sync failed — it will keep retrying automatically.');
    renderGallery();
    toast('Gallery images sharpened for full-width display ✓');
  }
}
// One-time cleanup for posts published before the hero-image and pasted-image fixes existed.
// Those posts can still be carrying a base64 image directly inside p.hero or p.html — often a
// megabyte or more of text per image. That alone is enough to blow past localStorage's quota on
// every subsequent save, and saveJSON() fails *silently* when that happens (see below), so every
// post published since then would look like it worked and then be gone on refresh — regardless
// of the Supabase sync fixes, because the local save itself was failing before sync ever entered
// the picture. This finds any legacy base64 image still sitting in POSTS, uploads it properly,
// and rewrites the post to use a real link instead — shrinking the saved payload back down.
async function migrateLegacyPostImages(){
  let changed=false;
  for(const p of POSTS){
    if(p.hero&&p.hero.startsWith('data:image/')){
      try{ p.hero=await uploadDataUrlToStorage(p.hero,'posts/hero-legacy'); changed=true; }
      catch(e){ console.warn('Legacy hero migration failed for post',p.id,e.message||e); }
    }
    if(p.html&&p.html.includes('data:image/')){
      try{ p.html=await convertBodyImagesToStorage(p.html); changed=true; }
      catch(e){ console.warn('Legacy body-image migration failed for post',p.id,e.message||e); }
    }
  }
  if(changed){
    console.warn('Migrated legacy base64 images out of Kagaz Journal posts — re-saving.');
    saveJSON('cms_posts',POSTS);
    const ok=await cmsSet('posts',POSTS);
    if(!ok)console.warn('Migration finished locally but cloud sync failed — it will keep retrying automatically.');
    renderBlog();
  }
}
// Same cleanup, for the "Publish With Us" and "Free ISBN" rich text pages — these share the same
// image-insert toolbar as Journal posts and could have picked up a base64 image the same way,
// before rteImage() was fixed to upload properly. Both fields live inside CONTENT, so a bloated
// one can silently break saving for every piece of text on the site, not just these two pages.
async function migrateLegacyContentImages(){
  let changed=false;
  if(CONTENT.publishBody&&CONTENT.publishBody.includes('data:image/')){
    try{ CONTENT.publishBody=await convertBodyImagesToStorage(CONTENT.publishBody); changed=true; }
    catch(e){ console.warn('Legacy Publish-page image migration failed:',e.message||e); }
  }
  if(CONTENT.isbnBody&&CONTENT.isbnBody.includes('data:image/')){
    try{ CONTENT.isbnBody=await convertBodyImagesToStorage(CONTENT.isbnBody); changed=true; }
    catch(e){ console.warn('Legacy ISBN-page image migration failed:',e.message||e); }
  }
  if(changed){
    console.warn('Migrated legacy base64 images out of site content — re-saving.');
    saveContent(); applyContent();
    if($('rte-publish'))$('rte-publish').innerHTML=CONTENT.publishBody;
    if($('rte-isbn'))$('rte-isbn').innerHTML=CONTENT.isbnBody;
  }
}
async function onPostHeroUpload(file){
  if(!file)return;
  const p=$('bpHeroPreview');
  // Instant local preview while the real upload happens in the background.
  p.src=URL.createObjectURL(file); p.style.display='block';
  _postHeroUploading=true; toast('Uploading image…');
  try{
    const url=await uploadPostHeroToStorage(file);
    _pendingPostHero=url; p.src=url;
    toast('Image uploaded ✓');
  }catch(e){
    console.warn('Post hero upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
    _pendingPostHero=null; p.style.display='none';
  }finally{
    _postHeroUploading=false;
  }
}
async function runAiCheck(kind){
  const body=$('rte-post').innerText.trim(); if(!body){$('aiCheckResult').textContent='Write something first.';return}
  $('aiCheckResult').textContent='Checking…';
  try{
    const prompt=kind==='seo'?`Give 3 short SEO improvement suggestions (title/meta/keyword) for this blog post, as a JSON array of strings:\n${body.slice(0,1500)}`
      :`Proofread this blog post for grammar issues only. Return a JSON array of up to 5 short fix suggestions (or [] if clean):\n${body.slice(0,1500)}`;
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:500,messages:[{role:'user',content:prompt+'\nRespond ONLY with the JSON array.'}]})});
    const d=await r.json();const txt=(d.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('').replace(/```json|```/g,'').trim();
    const arr=JSON.parse(txt);$('aiCheckResult').innerHTML=(kind==='seo'?'<b>SEO suggestions:</b><br>':'<b>Grammar notes:</b><br>')+(arr.length?arr.map(esc).join('<br>'):'Looks good.');
  }catch(e){$('aiCheckResult').textContent='AI check needs a live connection.';}
}
async function publishPost(){if(_postHeroUploading)return toast('Still uploading the hero image — try again in a second');const title=$('bpTitle').value.trim();if(!title)return toast('Give your post a title');
  const bodyEl=$('rte-post'); let body=sanitizeRteHtml(bodyEl.innerHTML);
  if(!bodyEl.innerText.trim()||bodyEl.innerText.trim()==='Start writing…')return toast('Write some content first');
  if(body.includes('data:image/')){toast('Uploading pasted images…');body=await convertBodyImagesToStorage(body);}
  const hero=_pendingPostHero||$('bpHero').value.trim();
  if(_editingPostId){
    const p=POSTS.find(x=>x.id===_editingPostId);
    if(p){p.title=title;p.html=body;if(hero)p.hero=hero;
      if(!p.slug)p.slug=uniqueSlug(slugify(title),p.id); // keeps existing URL stable; only backfills if missing
      p.updated=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});p.updatedISO=new Date().toISOString();}
    toast('Post updated');
  }else{
    const id=uid();
    POSTS.unshift({id,title,hero,html:body,slug:uniqueSlug(slugify(title),id),date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}),dateISO:new Date().toISOString()});
    toast('Published to Kagaz Journal');
  }
  saveJSON('cms_posts',POSTS);cmsSet('posts',POSTS).then(ok=>{toast(ok?'Post saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed');});resetPostEditor();renderJournalAdmin();go('journal');}
function resetPostEditor(){_editingPostId=null;_pendingPostHero=null;
  $('bpTitle').value='';$('bpHero').value='';$('rte-post').innerHTML='<p>Start writing…</p>';
  $('bpHeroPreview').style.display='none';$('aiCheckResult').textContent='';
  $('jpEditorHeading').textContent='Write a Kagaz Journal post';
  $('jpPublishBtn').textContent='Publish to Kagaz Journal';$('jpCancelEdit').style.display='none';}
function cancelPostEdit(){resetPostEditor();toast('Edit cancelled')}
function editPost(id){const p=POSTS.find(x=>x.id===id);if(!p)return;
  _editingPostId=id;_pendingPostHero=null;
  $('bpTitle').value=p.title;
  $('bpHero').value=(p.hero&&!p.hero.startsWith('data:'))?p.hero:'';
  const prev=$('bpHeroPreview');if(p.hero){prev.src=p.hero;prev.style.display='block'}else prev.style.display='none';
  $('rte-post').innerHTML=p.html||'<p><br></p>';ensureFontsForHtml(p.html);
  $('jpEditorHeading').textContent='Edit post';$('jpPublishBtn').textContent='Update post';
  $('jpCancelEdit').style.display='inline-flex';
  $('rte-post').scrollIntoView({behavior:'smooth',block:'center'});}
function deletePost(id){if(!confirm('Delete this post permanently?'))return;
  POSTS=POSTS.filter(p=>p.id!==id);saveJSON('cms_posts',POSTS);cmsSet('posts',POSTS);
  if(_editingPostId===id)resetPostEditor();
  renderJournalAdmin();toast('Post deleted');}
function renderJournalAdmin(){const wrap=$('jpPostRows');if(!wrap)return;wrap.innerHTML='';
  if(!POSTS.length){wrap.innerHTML='<p style="font-size:13px;color:#86868B">No posts yet.</p>';return}
  POSTS.forEach(p=>{const row=document.createElement('div');row.className='jp-row';
    const thumb=p.hero?`<img src="${p.hero}" style="width:52px;height:38px;object-fit:cover;border-radius:6px;flex:0 0 auto">`
      :'<div style="width:52px;height:38px;border-radius:6px;background:#141414;flex:0 0 auto"></div>';
    row.innerHTML=`${thumb}<div style="flex:1;min-width:0"><b style="font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</b>
      <span style="font-size:12px;color:#86868B">${esc(p.date)}${p.updated?' · edited '+esc(p.updated):''}</span></div>
      <button class="btn btn-ghost xs" onclick="editPost('${p.id}')">Edit</button>
      <button class="btn btn-ghost xs" onclick="deletePost('${p.id}')">Delete</button>`;
    wrap.appendChild(row);});}

/* ---------- AI Arrange for admin lists (Gallery, Products) ----------
   Same live-API-with-graceful-fallback pattern as the book editor's AI Arrange:
   tries a real Claude call, and if there's no live connection (e.g. once this
   file is deployed outside an environment that proxies the API key) it falls
   back to a small deterministic sort so the button still does something useful. */
function openListArrange(target){window._listArrangeTarget=target;
  $('listArrangeSub').textContent=target==='gallery'?"Describe how you'd like your gallery photos reordered.":"Describe how you'd like your store products reordered.";
  $('listArrangePrompt').value='';show('listArrangeModal');}
async function runListArrange(){
  const target=window._listArrangeTarget; const arr=target==='gallery'?GALLERY:CATALOG; if(!arr)return;
  const instruction=($('listArrangePrompt').value||'').trim();
  const btn=$('listArrangeBtn'); btn.disabled=true; btn.textContent='Arranging…';
  const describe=(it,i)=>target==='gallery'?`${i}: ${it.caption}`:`${i}: ${it.name} — Rs.${(it.price/100).toFixed(0)}${it.badge?' ('+it.badge+')':''}`;
  const list=arr.map(describe).join('\n');
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:400,messages:[{role:'user',content:
      `Reorder this numbered list per the instruction below. Instruction: ${instruction||'(none — use best editorial judgement)'}\nList:\n${list}\nRespond ONLY with JSON: {"order":[list of every index, 0 to ${arr.length-1}, in its new order]}`}]})});
    const d=await r.json();
    const txt=(d.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('').replace(/```json|```/g,'').trim();
    const parsed=JSON.parse(txt); const order=parsed.order;
    if(!Array.isArray(order)||order.length!==arr.length||new Set(order).size!==arr.length)throw new Error('bad order');
    const reordered=order.map(i=>arr[i]); arr.length=0; arr.push(...reordered);
    toast('AI arranged your '+(target==='gallery'?'gallery ✦':'products ✦'));
  }catch(e){heuristicArrange(target,arr,instruction);toast('AI arrange needs a live connection — used a simple sort instead.');}
  btn.disabled=false;btn.textContent='✦ Arrange with AI';hide('listArrangeModal');
  if(target==='gallery'){saveGallery();renderGalAdmin();}
  else{saveCatalog();renderProductRows();renderStore();}
}
function heuristicArrange(target,arr,instruction){
  const s=(instruction||'').toLowerCase();
  if(/reverse|z.?a\b|z to a/.test(s)){arr.reverse();return;}
  if(/shuffle|random/.test(s)){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return;}
  if(target==='products'&&/cheap|low.*price|price.*low/.test(s)){arr.sort((a,b)=>a.price-b.price);return;}
  if(target==='products'&&/expensive|high.*price|price.*high/.test(s)){arr.sort((a,b)=>b.price-a.price);return;}
  if(target==='products'&&/feature|bestsell|popular/.test(s)){arr.sort((a,b)=>(b.badge?1:0)-(a.badge?1:0));return;}
  if(/alphabet|a.?z\b|a to z/.test(s)){arr.sort((a,b)=>(a.name||a.caption||'').toLowerCase().localeCompare((b.name||b.caption||'').toLowerCase()));return;}
  /* instruction not recognised offline — leave the order as-is rather than guess */
}

/* ================= Gallery / Clients / Journal seed data ================= */
const GALLERY_DEFAULT=Array.from({length:8},()=>({id:uid(),url:'',caption:'',images:[]}));
let GALLERY=loadJSON('cms_gallery',GALLERY_DEFAULT);
if(!Array.isArray(GALLERY)||!GALLERY.length){GALLERY=GALLERY_DEFAULT;}
GALLERY.forEach(im=>{if(!Array.isArray(im.images))im.images=[];}); // migrate older single-image entries
function saveGallery(){
  saveJSON('cms_gallery',GALLERY);
  cmsSet('gallery',GALLERY).then(ok=>{toast(ok?'Gallery saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed');});
  renderGallery();
}
function addGalleryImage(){
  GALLERY.push({id:uid(),url:'',caption:''});
  saveGallery(); renderGalAdmin();
}
function setFeaturedGalleryImage(id){
  GALLERY.forEach(im=>{im.featured=(im.id===id);});
  saveGallery(); renderGalAdmin();
}
function removeGalleryImage(id){
  GALLERY=GALLERY.filter(im=>im.id!==id);
  saveGallery(); renderGalAdmin();
}
function updateGalleryCaption(id,value){
  const img=GALLERY.find(im=>im.id===id); if(!img)return;
  img.caption=value;
  saveJSON('cms_gallery',GALLERY); cmsSet('gallery',GALLERY);
}
async function uploadGalleryImage(id,file){
  if(!file)return;
  const img=GALLERY.find(im=>im.id===id); if(!img)return;
  toast('Uploading image…');
  try{
    const path=`gallery/${uid()}`;
    const {error,url}=await uploadWebImage(path,file,HERO_IMAGE_MAX_PX);
    if(error)throw error;
    img.url=url;
    saveGallery(); renderGalAdmin();
  }catch(e){
    console.warn('Gallery image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
  }
}
// A gallery tile is a whole photobook "project": one cover thumbnail (the fields above) plus any
// number of additional photos from that same project, stored in project.images[]. Visitors click
// the thumbnail and browse the full set in the lightbox — see renderGallery() / openPhotoLightbox().
async function addProjectPhotos(id,files){
  if(!files||!files.length)return;
  const project=GALLERY.find(im=>im.id===id); if(!project)return;
  if(!Array.isArray(project.images))project.images=[];
  toast('Uploading '+files.length+' photo'+(files.length===1?'':'s')+'…');
  let ok=0;
  for(const file of files){
    try{
      const path=`gallery/${uid()}`;
      const {error,url}=await uploadWebImage(path,file,HERO_IMAGE_MAX_PX);
      if(error)throw error;
      project.images.push({id:uid(),url,caption:''});
      ok++;
    }catch(e){
      console.warn('Project photo upload failed:',e.message||e);
    }
  }
  if(ok<files.length)toast('⚠ '+(files.length-ok)+' photo(s) failed to upload — is the "cms-images" storage bucket public in Supabase?');
  saveGallery(); renderGalAdmin();
}
function removeProjectPhoto(projectId,photoId){
  const project=GALLERY.find(im=>im.id===projectId); if(!project)return;
  project.images=(project.images||[]).filter(im=>im.id!==photoId);
  saveGallery(); renderGalAdmin();
}
function updateProjectPhotoCaption(projectId,photoId,value){
  const project=GALLERY.find(im=>im.id===projectId); if(!project)return;
  const photo=(project.images||[]).find(im=>im.id===photoId); if(!photo)return;
  photo.caption=value;
  saveJSON('cms_gallery',GALLERY); cmsSet('gallery',GALLERY);
}
function toggleProjectPhotosPanel(id){
  const el=$('galProjectPanel-'+id); if(!el)return;
  const open=el.style.display!=='none';
  el.style.display=open?'none':'block';
  const btn=$('galProjectToggle-'+id); if(btn)btn.textContent=(open?'▸':'▾')+' Project photos ('+((GALLERY.find(g=>g.id===id)?.images||[]).length)+')';
}
function renderGallery(){
  const wrap=$('galGrid'); if(!wrap)return; wrap.innerHTML='';
  const populated=GALLERY.filter(im=>im.url);
  if(!populated.length){
    wrap.innerHTML='<p style="color:var(--slate-l);font-size:14px;grid-column:1/-1">No photobooks added yet.</p>';
    return;
  }
  // Each project's full browsable set is its cover photo followed by its additional photos —
  // clicking any thumbnail opens the whole set in the lightbox, not just that one image.
  const projectSet=proj=>[{url:proj.url,caption:proj.caption},...(proj.images||[]).filter(im=>im.url).map(im=>({url:im.url,caption:im.caption}))];
  const countBadge=proj=>{
    const n=(proj.images||[]).filter(im=>im.url).length;
    return n>0?`<span class="gal-count-badge">${n+1} photos</span>`:'';
  };
  const explicitFeatured=populated.find(im=>im.featured);
  const featured=explicitFeatured||populated[0];
  const rest=populated.filter(im=>im.id!==featured.id);
  const featFig=document.createElement('figure');
  featFig.className='gal-featured';
  const featImg=createMediaEl(featured.url,featured.caption||'Custom photobook printed by Binder, Delhi');
  featImg.onclick=()=>openPhotoLightbox(featured.url,featured.caption,projectSet(featured),0);
  featFig.appendChild(featImg);
  featFig.insertAdjacentHTML('beforeend',countBadge(featured));
  if(featured.caption){
    const cap=document.createElement('figcaption');
    cap.className='gal-featured-caption';
    cap.textContent=featured.caption;
    featFig.appendChild(cap);
  }
  wrap.appendChild(featFig);
  if(rest.length){
    const grid=document.createElement('div');
    grid.className='gal-grid';
    rest.forEach(im=>{
      const fig=document.createElement('figure'); fig.className='gal-item';
      const img=createMediaEl(im.url,im.caption||'Custom photobook printed by Binder, Delhi');
      img.onclick=()=>openPhotoLightbox(im.url,im.caption,projectSet(im),0);
      fig.appendChild(img);
      fig.insertAdjacentHTML('beforeend',countBadge(im));
      const cap=document.createElement('figcaption');
      cap.textContent=im.caption||'';
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    wrap.appendChild(grid);
  }
}
function renderGalAdmin(){
  const wrap=$('galAdminRows'); if(!wrap)return; wrap.innerHTML='';
  GALLERY.forEach(img=>{
    const photoCount=(img.images||[]).length;
    const tile=document.createElement('div');
    tile.style.cssText='position:relative;width:100%';
    tile.innerHTML=`
      <div style="width:100%;aspect-ratio:1;border:1px solid var(--line);background:${img.url?`url(${img.url}) center/cover`:'var(--cream)'};display:flex;align-items:center;justify-content:center;cursor:pointer" data-role="tile">
        ${img.url?'':'<span style="font-size:10px;color:var(--slate-l)">Empty</span>'}
      </div>
      <button style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#fff;border:1px solid var(--line);cursor:pointer;font-size:12px;line-height:1;color:var(--slate)" title="Remove this placeholder" data-role="remove">×</button>
      ${img.url?`<button style="position:absolute;top:-6px;left:-6px;width:20px;height:20px;border-radius:50%;background:${img.featured?'var(--accent)':'#fff'};border:1px solid var(--line);cursor:pointer;font-size:12px;line-height:1;color:${img.featured?'#fff':'var(--slate)'}" title="${img.featured?'This is the featured image':'Make this the featured image'}" data-role="feature">★</button>`:''}
      <input type="file" accept="image/*,video/*" style="display:none">
      <input class="field" style="margin:6px 0 0;padding:5px 8px;font-size:11px" placeholder="Cover caption" value="${esc(img.caption||'')}" data-role="caption">
      ${img.url?`<button type="button" id="galProjectToggle-${img.id}" style="width:100%;text-align:left;background:none;border:none;padding:6px 2px 0;font-size:11px;color:var(--slate);cursor:pointer" data-role="toggleProject">▸ Project photos (${photoCount})</button>
      <div id="galProjectPanel-${img.id}" style="display:none;margin-top:6px;padding:10px;border:1px dashed var(--line);border-radius:8px;background:var(--cream)">
        <div style="font-size:10.5px;color:var(--slate-l);margin-bottom:8px">These show up when a visitor clicks the cover thumbnail — the whole set opens in a browsable lightbox.</div>
        <div data-role="projectGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-bottom:8px"></div>
        <input type="file" accept="image/*" multiple style="display:none" data-role="projectFileInput">
        <button type="button" class="btn btn-ghost xs" data-role="addProjectPhotos">+ Add photos</button>
      </div>`:''}`;
    tile.querySelector('[data-role="tile"]').onclick=()=>tile.querySelector('input[type=file]').click();
    tile.querySelector('input[type=file]').onchange=function(){uploadGalleryImage(img.id,this.files[0]);};
    tile.querySelector('[data-role="remove"]').onclick=(e)=>{e.stopPropagation();removeGalleryImage(img.id);};
    const featBtn=tile.querySelector('[data-role="feature"]');
    if(featBtn)featBtn.onclick=(e)=>{e.stopPropagation();setFeaturedGalleryImage(img.id);};
    tile.querySelector('[data-role="caption"]').addEventListener('input',function(){updateGalleryCaption(img.id,this.value);});
    const toggleBtn=tile.querySelector('[data-role="toggleProject"]');
    if(toggleBtn)toggleBtn.onclick=()=>toggleProjectPhotosPanel(img.id);
    const projGrid=tile.querySelector('[data-role="projectGrid"]');
    if(projGrid){
      (img.images||[]).forEach(ph=>{
        const cell=document.createElement('div');
        cell.style.cssText=`position:relative;aspect-ratio:1;background:url(${ph.url}) center/cover;border:1px solid var(--line);border-radius:4px`;
        cell.innerHTML=`<button type="button" style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#fff;border:1px solid var(--line);cursor:pointer;font-size:10px;line-height:1;color:var(--slate)" title="Remove">×</button>`;
        cell.querySelector('button').onclick=(e)=>{e.stopPropagation();removeProjectPhoto(img.id,ph.id);};
        projGrid.appendChild(cell);
      });
    }
    const addBtn=tile.querySelector('[data-role="addProjectPhotos"]');
    const projInput=tile.querySelector('[data-role="projectFileInput"]');
    if(addBtn&&projInput){
      addBtn.onclick=()=>projInput.click();
      projInput.onchange=function(){addProjectPhotos(img.id,[...this.files]);this.value='';};
    }
    wrap.appendChild(tile);
  });
}
const CLIENTS_DEFAULT=[
  {label:'Individuals',count:'2750+',names:[
    'Dileep Prakash','Gauri Gill','Vicky Roy','Valmik Thapar','Kairav Engineer (Astral LTD, Safari Crafters)',
    'Vikas Khanna (chef)','Komal Bedi Sohal','Saumya Sankar Bose','Thakral & Tagra','Raj Sarkar'
  ]},
  {label:'Corporate',count:null,names:[
    'Photoink','Raw Mango','Lalit Hotels','Taj (Indian Hotels Company LTD)','Oberoi Hotels','Cove & Lane',
    'HCL','House on the Clouds','Nature Morte Art Gallery','MOMA (Museum of Modern Art)','Intel','Diageo',
    'Nicobar','Good Earth','Tata Trust','Airbnb','Zoom','Amazon','Promanade Books',
    'Charleville Book & Cafe','Sahapedia'
  ]},
  {label:'Government, education, training',count:null,names:[
    'National Rail Museum','Indian Railways',"United Services Institution of India (USI)",
    'United Nations Organisation','Home Ministry of India',"Employees' Provident Fund Organisation (EPFO)",
    'LBSNAA','Indian Museum','Centre for Civil Society','Harvard University','The Doon School',
    "The Doon School Old Boys' Society","Indian Public Schools' Society",'Daly College',
    'Scindia Kanya Vidyalaya (SKV)','Kasiga School','Ecole Globale School','Welham Girls',
    'Selaqui International School','Chief of Combined Defence Staff, Indian Army','Indian Military Academy',
    'Assam Rifles','High Altitude Warfare School',"Officers' Training Academy",'Army Training Command',
    '54 Bison Division, Indian Army','5 Rashtriya Military Schools','18 Regiments of the Indian Army'
  ]}
];
function mkPhotoPlaceholders(n){return Array.from({length:n},()=>({id:uid(),url:'',caption:''}));}
const PHOTO_SERVICES_DEFAULT=[
  {key:'architecture',label:'Architecture',text:'Interiors, facades, and spatial documentation for architects, developers, and design studios — shot to show scale, light, and material honestly.',images:mkPhotoPlaceholders(8)},
  {key:'editorial',label:'Editorial',text:'Story-driven photography for magazines, publications, and personal projects — image sequences built with the same care as the books we bind.',images:mkPhotoPlaceholders(8)},
  {key:'corporate',label:'Corporate',text:'Leadership portraits, office and facility documentation, and brand photography for companies that need images as considered as their business.',images:mkPhotoPlaceholders(8)},
  {key:'military',label:'Military',text:'Ceremonial, training, and institutional photography for defence establishments — handled with the discretion and protocol these assignments require.',images:mkPhotoPlaceholders(8)},
];
let PHOTO_SERVICES=loadJSON('cms_photo_services',PHOTO_SERVICES_DEFAULT);
if(!Array.isArray(PHOTO_SERVICES)||PHOTO_SERVICES.length!==4||!PHOTO_SERVICES[0].images){PHOTO_SERVICES=PHOTO_SERVICES_DEFAULT;}
let _openPhotoDrawers=new Set(PHOTO_SERVICES.map(s=>s.key));
let CLIENTS=loadJSON('cms_clients', loadJSON('binder_clients',CLIENTS_DEFAULT));
function savePhotoServices(){
  saveJSON('cms_photo_services',PHOTO_SERVICES);
  cmsSet('photo_services',PHOTO_SERVICES).then(ok=>{toast(ok?'Photography Services saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed');});
  renderPhotoServices();
}
function addPhotoServiceImage(si){
  PHOTO_SERVICES[si].images.push({id:uid(),url:'',caption:''});
  savePhotoServices(); renderPhotoServicesAdmin();
}
function removePhotoServiceImage(si,ii){
  PHOTO_SERVICES[si].images.splice(ii,1);
  savePhotoServices(); renderPhotoServicesAdmin();
}
function updatePhotoServiceCaption(si,ii,value){
  const img=PHOTO_SERVICES[si].images[ii]; if(!img)return;
  img.caption=value;
  savePhotoServices();
}
async function uploadPhotoServiceImage(si,ii,file){
  if(!file)return;
  const img=PHOTO_SERVICES[si].images[ii]; if(!img)return;
  toast('Uploading image…');
  try{
    const path=`photo-services/${PHOTO_SERVICES[si].key}-${uid()}`;
    const {error,url}=await uploadWebImage(path,file);
    if(error)throw error;
    img.url=url;
    savePhotoServices(); renderPhotoServicesAdmin();
  }catch(e){
    console.warn('Photo service image upload failed:',e.message||e);
    toast('⚠ Image upload failed — is the "cms-images" storage bucket created (public) in Supabase? '+(e.message||''));
  }
}
function renderPhotoServicesAdmin(){
  const wrap=$('photoServicesAdminRows'); if(!wrap)return; wrap.innerHTML='';
  PHOTO_SERVICES.forEach((section,si)=>{
    const card=document.createElement('div');
    card.style.cssText='border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:16px';
    card.innerHTML=`
      <h4 style="font-size:15px;margin-bottom:10px">${esc(section.label)}</h4>
      <label style="font-size:12.5px;color:var(--slate);display:block;margin-bottom:4px">Section text</label>
      <textarea class="field" rows="2" style="margin-bottom:14px" data-role="text">${esc(section.text)}</textarea>
      <label style="font-size:12.5px;color:var(--slate);display:block;margin-bottom:6px">Image placeholders (${section.images.length})</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:14px;margin-bottom:12px" data-role="images"></div>
      <button class="btn btn-ghost xs" data-role="add-img">+ Add placeholder</button>`;
    card.querySelector('[data-role="text"]').addEventListener('input',function(){section.text=this.value;savePhotoServices();});
    card.querySelector('[data-role="add-img"]').onclick=()=>addPhotoServiceImage(si);
    const imgWrap=card.querySelector('[data-role="images"]');
    section.images.forEach((img,ii)=>{
      const tile=document.createElement('div');
      tile.style.cssText='position:relative;width:100%';
      const inputId=`psimg-${si}-${ii}`;
      tile.innerHTML=`
        <div style="width:100%;aspect-ratio:1;border:1px solid var(--line);background:${img.url?`url(${img.url}) center/cover`:'var(--cream)'};display:flex;align-items:center;justify-content:center;cursor:pointer" data-role="tile">
          ${img.url?'':'<span style="font-size:10px;color:var(--slate-l)">Empty</span>'}
        </div>
        <button style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#fff;border:1px solid var(--line);cursor:pointer;font-size:12px;line-height:1;color:var(--slate)" title="Remove this placeholder" data-role="remove">×</button>
        <input type="file" accept="image/*,video/*" id="${inputId}" style="display:none">
        <input class="field" style="margin:6px 0 0;padding:5px 8px;font-size:11.5px" placeholder="Caption" value="${esc(img.caption||'')}" data-role="caption">`;
      tile.querySelector('[data-role="tile"]').onclick=()=>tile.querySelector('input[type=file]').click();
      tile.querySelector('input[type=file]').onchange=function(){uploadPhotoServiceImage(si,ii,this.files[0]);};
      tile.querySelector('[data-role="remove"]').onclick=(e)=>{e.stopPropagation();removePhotoServiceImage(si,ii);};
      tile.querySelector('[data-role="caption"]').addEventListener('input',function(){updatePhotoServiceCaption(si,ii,this.value);});
      imgWrap.appendChild(tile);
    });
    wrap.appendChild(card);
  });
}
function renderPhotoServices(){
  const wrap=$('photoServiceDrawers'); if(!wrap)return; wrap.innerHTML='';
  loadPhotographyLeadImage();
  PHOTO_SERVICES.forEach(section=>{
    const populated=section.images.filter(im=>im.url);
    const isOpen=_openPhotoDrawers.has(section.key);
    const drawer=document.createElement('div');
    drawer.className='store-drawer'+(isOpen?' open':'');
    const head=document.createElement('button');
    head.className='store-drawer-head';
    head.setAttribute('aria-expanded',isOpen?'true':'false');
    head.innerHTML=`<span class="sdh-text"><span class="sdh-title">${esc(section.label)}</span></span><span class="sdh-chev"></span>`;
    head.onclick=()=>togglePhotoDrawer(section.key,drawer,head);
    const body=document.createElement('div');
    body.className='store-drawer-body';
    const inner=document.createElement('div');
    inner.className='store-drawer-inner';
    inner.style.padding='8px 20px 34px';
    if(populated.length){
      const featured=populated[0], rest=populated.slice(1);
      const featFig=document.createElement('figure');
      featFig.className='ps-featured';
      const featImg=createMediaEl(featured.url,featured.caption||(section.label+' photograph'));
      featImg.onclick=()=>openPhotoLightbox(featured.url,featured.caption);
      featFig.appendChild(featImg);
      if(featured.caption){
        const featCap=document.createElement('figcaption');
        featCap.style.cssText='font-size:12.5px;color:var(--slate-l);margin-top:8px';
        featCap.textContent=featured.caption;
        featFig.appendChild(featCap);
      }
      inner.appendChild(featFig);

      const layout=document.createElement('div');
      layout.style.cssText='display:grid;grid-template-columns:minmax(180px,240px) 1fr;gap:32px;align-items:start';
      const textCol=document.createElement('div');
      textCol.innerHTML=`<p style="font-size:14.5px;color:var(--slate);line-height:1.6;margin:0">${esc(section.text)}</p>`;
      const grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;align-items:start';
      if(rest.length){
        rest.forEach(im=>{
          const fig=document.createElement('figure');
          fig.style.cssText='margin:0';
          const cell=createMediaEl(im.url,im.caption||(section.label+' photograph'));
          cell.style.cssText='width:100%;height:auto;display:block;cursor:pointer';
          cell.onmouseenter=()=>cell.style.opacity='.85';
          cell.onmouseleave=()=>cell.style.opacity='1';
          cell.onclick=()=>openPhotoLightbox(im.url,im.caption);
          fig.appendChild(cell);
          const cap=document.createElement('figcaption');
          cap.style.cssText='font-size:12.5px;color:var(--slate-l);margin-top:6px;line-height:1.4;min-height:1.4em';
          cap.textContent=im.caption||'';
          fig.appendChild(cap);
          grid.appendChild(fig);
        });
      }
      layout.append(textCol,grid);
      inner.appendChild(layout);
    }else{
      inner.innerHTML=`<p style="font-size:14.5px;color:var(--slate);line-height:1.6;margin:0 0 12px">${esc(section.text)}</p><p style="color:var(--slate-l);font-size:13.5px">No images added yet.</p>`;
    }
    body.appendChild(inner);
    drawer.append(head,body);
    wrap.appendChild(drawer);
  });
}
function loadPhotographyLeadImage(){
  const wrap=$('psLeadWrap'); if(!wrap)return;
  if(CONTENT.photographyLeadImageUrl){
    const vid=$('psLeadVideo');
    if(isVideoUrl(CONTENT.photographyLeadImageUrl)){
      if(vid){vid.src=CONTENT.photographyLeadImageUrl;vid.style.display='block';vid.play().catch(()=>{});}
      $('psLeadImage').style.display='none';
    }else{
      if(vid)vid.style.display='none';
      $('psLeadImage').src=CONTENT.photographyLeadImageUrl;$('psLeadImage').style.display='block';
    }
    wrap.style.display='block';
  }else{
    wrap.style.display='none';
  }
}
let _lightboxSet=null,_lightboxIdx=0;
function openPhotoLightbox(url,caption,images,startIndex){
  if(Array.isArray(images)&&images.length>1){
    _lightboxSet=images; _lightboxIdx=Math.max(0,Math.min(images.length-1,startIndex||0));
  }else{
    _lightboxSet=null; _lightboxIdx=0;
  }
  renderLightboxFrame(_lightboxSet?null:{url,caption});
  const nav=$('lightboxNav'); if(nav)nav.style.display=_lightboxSet?'flex':'none';
  show('photoLightboxModal');
}
function renderLightboxFrame(single){
  const cur=single||_lightboxSet[_lightboxIdx];
  const imgEl=$('photoLightboxImg'), vidEl=$('photoLightboxVideo');
  if(isVideoUrl(cur.url)){
    vidEl.src=cur.url; vidEl.style.display='block'; vidEl.currentTime=0; vidEl.play().catch(()=>{});
    imgEl.style.display='none'; imgEl.src='';
  }else{
    imgEl.src=cur.url; imgEl.style.display='block';
    vidEl.style.display='none'; vidEl.pause(); vidEl.removeAttribute('src');
  }
  const capEl=$('photoLightboxCaption');
  if(capEl){capEl.textContent=cur.caption||'';capEl.style.display=cur.caption?'block':'none';}
  const counter=$('lightboxCounter');
  if(counter)counter.textContent=_lightboxSet?(_lightboxIdx+1)+' / '+_lightboxSet.length:'';
}
function lightboxNav(delta){
  if(!_lightboxSet)return;
  _lightboxIdx=(_lightboxIdx+delta+_lightboxSet.length)%_lightboxSet.length;
  renderLightboxFrame();
}
document.addEventListener('keydown',e=>{
  if(!_lightboxSet||!$('photoLightboxModal').classList.contains('show'))return;
  if(e.key==='ArrowLeft')lightboxNav(-1);
  else if(e.key==='ArrowRight')lightboxNav(1);
});
function closePhotoLightbox(){
  hide('photoLightboxModal');
  $('photoLightboxImg').src='';
  const vidEl=$('photoLightboxVideo'); if(vidEl){vidEl.pause();vidEl.removeAttribute('src');}
  _lightboxSet=null; _lightboxIdx=0;
}
function togglePhotoDrawer(key,drawerEl,headEl){
  const isOpen=drawerEl.classList.toggle('open');
  if(isOpen)_openPhotoDrawers.add(key); else _openPhotoDrawers.delete(key);
  headEl.setAttribute('aria-expanded',isOpen?'true':'false');
}
if(!Array.isArray(CLIENTS)||!CLIENTS.length||typeof CLIENTS[0]!=='object'||!Array.isArray(CLIENTS[0].names)){CLIENTS=CLIENTS_DEFAULT;}
function saveClients(){
  saveJSON('cms_clients',CLIENTS);
  cmsSet('clients',CLIENTS).then(ok=>{toast(ok?'Clients saved ✓ — visible to all visitors':'⚠ Saved on this device only — cloud sync failed');});
  renderClients();
}
function addClientSection(){
  CLIENTS.push({label:'New section',count:null,names:[]});
  saveClients(); renderClientsAdmin();
}
function removeClientSection(i){
  if(!confirm(`Remove the "${CLIENTS[i].label}" section and all ${CLIENTS[i].names.length} clients in it?`))return;
  CLIENTS.splice(i,1);
  saveClients(); renderClientsAdmin();
}
function addClientName(sectionIndex,input){
  const name=input.value.trim(); if(!name)return;
  CLIENTS[sectionIndex].names.push(name);
  input.value='';
  saveClients(); renderClientsAdmin();
}
function removeClientName(sectionIndex,nameIndex){
  CLIENTS[sectionIndex].names.splice(nameIndex,1);
  saveClients(); renderClientsAdmin();
}
function renderClientsAdmin(){
  const wrap=$('clientsAdminRows'); if(!wrap)return; wrap.innerHTML='';
  CLIENTS.forEach((section,si)=>{
    const card=document.createElement('div');
    card.style.cssText='border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:16px';
    card.innerHTML=`
      <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <input class="field" style="flex:2;min-width:160px;margin:0" value="${esc(section.label)}" placeholder="Section name" data-role="label">
        <input class="field" style="flex:1;min-width:100px;margin:0" value="${esc(section.count||'')}" placeholder="Count badge (optional, e.g. 2750+)" data-role="count">
        <button class="btn btn-ghost xs" onclick="removeClientSection(${si})" title="Remove this whole section">Remove section</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px" data-role="names"></div>
      <div style="display:flex;gap:8px">
        <input class="field" style="flex:1;margin:0" placeholder="Add a client name and press Enter" data-role="new-name">
        <button class="btn btn-ghost xs" data-role="add-btn">+ Add</button>
      </div>`;
    const namesWrap=card.querySelector('[data-role="names"]');
    section.names.forEach((n,ni)=>{
      const chip=document.createElement('span');
      chip.style.cssText='display:inline-flex;align-items:center;gap:6px;background:var(--cream);border-radius:900px;padding:5px 8px 5px 12px;font-size:13px';
      chip.innerHTML=`<span>${esc(n)}</span><button style="background:none;border:none;cursor:pointer;color:var(--slate-l);font-size:15px;line-height:1;padding:0 2px" title="Remove">×</button>`;
      chip.querySelector('button').onclick=()=>removeClientName(si,ni);
      namesWrap.appendChild(chip);
    });
    card.querySelector('[data-role="label"]').addEventListener('input',function(){section.label=this.value;saveClients();});
    card.querySelector('[data-role="count"]').addEventListener('input',function(){section.count=this.value.trim()||null;saveClients();});
    const newNameInput=card.querySelector('[data-role="new-name"]');
    card.querySelector('[data-role="add-btn"]').onclick=()=>addClientName(si,newNameInput);
    newNameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addClientName(si,newNameInput);}});
    wrap.appendChild(card);
  });
}
function renderClients(){
  const g=$('clientsGrid'); g.innerHTML='';
  CLIENTS.forEach(section=>{
    const wrap=document.createElement('div'); wrap.className='client-section';
    const head=document.createElement('div'); head.className='client-section-head';
    head.innerHTML=`<h3>${esc(section.label)}</h3>${section.count?`<span class="client-section-count">${esc(section.count)}</span>`:''}`;
    const grid=document.createElement('div'); grid.className='clients-grid';
    grid.innerHTML=section.names.map(n=>`<div class="client-cell">${esc(n)}</div>`).join('');
    wrap.append(head,grid); g.appendChild(wrap);
  });
}
let POSTS=loadJSON('cms_posts', loadJSON('binder_posts',[{id:uid(),title:'Why novels deserve real paper',hero:'',date:'June 2026',html:'<p>A trade book is a different animal from a photobook — it lives or dies on typography. This is where Binder\'s Trade Book editor earns its keep.</p>'}]));
function slugify(s){
  return (s||'').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/['"]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,60) || 'post';
}
function uniqueSlug(base,excludeId){
  let slug=base,n=2;
  while(POSTS.some(p=>p.slug===slug&&p.id!==excludeId)){slug=base+'-'+n;n++;}
  return slug;
}
// Older posts (published before slugs existed) only have a random id like "52yp9mj" — give
// them a proper /journal/<name-of-post> slug too, so every post gets a readable URL, not
// just new ones. Persists the backfill via cmsSet so it's consistent for every visitor.
function backfillPostSlugs(){
  let changed=false;
  POSTS.forEach(p=>{ if(!p.slug){ p.slug=uniqueSlug(slugify(p.title),p.id); changed=true; } });
  if(changed){ saveJSON('cms_posts',POSTS); cmsSet('posts',POSTS); }
}
function renderBlog(){const g=$('blogGrid');g.innerHTML='';
  if(!POSTS.length){g.innerHTML='<p style="color:var(--slate-l);font-size:14px;padding:20px 0">No posts yet — check back soon.</p>';return;}
  POSTS.forEach(p=>{const c=document.createElement('div');c.className='blog-card';
  c.innerHTML=`<div class="cv" style="position:relative">${p.hero?mediaTagHtml(p.hero,p.title,'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"'):''}</div><div class="bd"><time style="font-size:12px;color:#86868B">${p.date}</time><h3>${esc(p.title)}</h3></div>`;
  c.onclick=()=>openPost(p);g.appendChild(c);});}
function openPost(p,push){
  if(!p.slug){p.slug=uniqueSlug(slugify(p.title),p.id);saveJSON('cms_posts',POSTS);cmsSet('posts',POSTS);}
  const slugPath=p.slug;
  if(p.hero&&isVideoUrl(p.hero)){
    $('postHeroVideo').src=p.hero;$('postHeroVideo').style.display='block';$('postHeroVideo').play().catch(()=>{});
    $('postHero').style.display='none';
  }else{
    $('postHeroVideo').style.display='none';
    $('postHero').src=p.hero||'';$('postHero').style.display=p.hero?'block':'none';$('postHero').alt=p.title;
  }
  $('postTitle').textContent=p.title;$('postDate').textContent=p.date+(p.updated?' · Updated '+p.updated:'');$('postBody').innerHTML=p.html;ensureFontsForHtml(p.html);
  const url=encodeURIComponent(location.origin+'/journal/'+slugPath),text=encodeURIComponent(p.title);
  $('postShare').innerHTML=`<a href="https://wa.me/?text=${text}%20${url}" target="_blank">W</a><a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank">f</a><a href="https://www.instagram.com/" target="_blank">I</a>`;
  go('post',false);
  if(push!==false)setPath('/journal/'+slugPath);
  else if(location.pathname!=='/journal/'+slugPath){history.replaceState({},'','/journal/'+slugPath);} // old id-based link → canonical slug URL
  const pageTitle=p.title+' — Binder Kagaz Journal';
  const excerpt=(p.html||'').replace(/<[^>]+>/g,'').trim().slice(0,155);
  const heroImg=p.hero||DEFAULT_OG_IMAGE;
  document.title=pageTitle;
  const desc=document.querySelector('meta[name="description"]'); if(desc)desc.setAttribute('content',excerpt);
  updateSeoKeywords(p.title+', Binder Kagaz Journal, photobook printing blog India');
  const og=document.querySelector('meta[property="og:title"]'); if(og)og.setAttribute('content',pageTitle);
  const ogd=document.querySelector('meta[property="og:description"]'); if(ogd)ogd.setAttribute('content',excerpt);
  const ogi=document.querySelector('meta[property="og:image"]'); if(ogi)ogi.setAttribute('content',heroImg);
  const ogtype=document.querySelector('meta[property="og:type"]'); if(ogtype)ogtype.setAttribute('content','article');
  const tt=document.querySelector('meta[name="twitter:title"]'); if(tt)tt.setAttribute('content',pageTitle);
  const td=document.querySelector('meta[name="twitter:description"]'); if(td)td.setAttribute('content',excerpt);
  const ti=document.querySelector('meta[name="twitter:image"]'); if(ti)ti.setAttribute('content',heroImg);
  const canon=document.querySelector('link[rel="canonical"]'); if(canon)canon.setAttribute('href','https://www.binder.co.in/journal/'+slugPath);
  setPageSchema([buildPostSchema(p,slugPath),buildBreadcrumbSchema([{name:'Home',url:'https://www.binder.co.in/'},{name:'Kagaz Journal',url:'https://www.binder.co.in/journal'},{name:p.title,url:'https://www.binder.co.in/journal/'+slugPath}])]);
}

/* ================= INIT ================= */
/* ── FAQ ──────────────────────────────────────────────────────────────── */
const FAQ_DEFAULTS = [
  {q:'What kind of books can I make on Binder?', a:'You can create three types of printed products on Binder: Photobooks (layflat, 250gsm, available in 8.5×8.5″, 12×12″, and 12×18″ — the 12×18″ can be portrait or landscape), Trade Books (5.5×8″ perfect-bound novels and monographs), and Art Prints (6×4″ sets or large-format 12×18″ and 16×20″ single prints on 300gsm archival stock). All three are professional-grade — the same quality we produce for publishing houses, galleries, and corporate clients.'},
  {q:'What is the minimum order quantity?', a:'There is no minimum for photobooks and trade books — you can order a single copy. For Art Prints, the minimum is one set of 4. For scanning services, the minimum is 100 images.'},
  {q:'How long does printing take?', a:'Standard turnaround is 5–7 working days from the date your print file is confirmed. We review every order before it goes to press and will contact you if anything needs attention. Expedited turnaround (2–3 days) is available — contact us to arrange it.'},
  {q:'Do you deliver across India?', a:'Yes. We ship to all PIN codes across India via insured courier. Delivery typically takes 3–5 days after dispatch. For customers in Delhi NCR, we also offer pick-up from our Okhla Phase I studio.'},
  {q:'What file format should I upload my photos in?', a:'JPEG, PNG, and HEIC (iPhone photos) are all supported. For best print quality, use images shot at the highest resolution your camera allows — we flag any photos below 300 DPI at the size you\'ve placed them so you can swap them out before ordering.'},
  {q:'Can I get a proof before my full order prints?', a:'Every order generates a print-ready PDF proof that you can download and review before we send it to press. For trade books specifically, we recommend reading through the full PDF carefully — page sequence, margins, and spine text are worth checking. We will not proceed without your confirmation on large orders.'},
  {q:'What paper and binding options are available?', a:'Photobooks are printed on 250gsm matte art paper with layflat binding — pages open completely flat, which is ideal for full-bleed spreads. Trade books are perfect-bound with a full-colour wrap cover. At checkout you can choose between matte and lustre (semi-gloss) finish for photobooks.'},
  {q:'Do you offer ISBN registration for trade books?', a:'Yes — and it\'s free. We guide authors through the process of obtaining an ISBN from the Raja Rammohun Roy National Agency (the official Indian ISBN authority). Visit our Publish | Free ISBN page for the full step-by-step guide.'},
  {q:'Can you scan old photographs and negatives?', a:'Yes. Our scanning service digitises prints, negatives (35mm and medium format), slides, and flat documents at 600 DPI archival quality. We cover pick-up and drop within Delhi NCR and deliver scans as TIFF (Highest Resolution) files. Pricing is ₹15 per MB, minimum 100 images.'},
  {q:'How do I pay? Is it secure?', a:'We accept all major credit and debit cards, UPI, and net banking via Razorpay. Your card details never touch our servers — Razorpay handles the entire payment flow and every transaction is cryptographically verified. We issue a GST invoice on request.'},
  {q:'Can I edit my project after saving it?', a:'Yes. Any project you save while signed in is stored in your dashboard for 45 days. You can reopen it, make changes, and re-order at any time. If you want to keep a project permanently, just save it again within the 45-day window to reset the timer.'},
  {q:'What if I\'m not happy with the print?', a:'Quality is checked before every order ships. If your book arrives damaged or the print quality is clearly below standard, contact us within 7 days with photos and we will reprint it at no charge. We stand behind every book we make.'}
];

let FAQ = loadJSON('cms_faq', FAQ_DEFAULTS);

function renderFaq(){
  const list = $('faqList'); if(!list) return;
  list.innerHTML = '';
  FAQ.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `
      <button class="faq-q" onclick="toggleFaq(${i},this)" aria-expanded="false">
        <span>${esc(item.q)}</span>
        <svg class="faq-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="faq-a" hidden><p>${esc(item.a)}</p></div>`;
    list.appendChild(el);
  });
}

function toggleFaq(i, btn){
  const answer = btn.nextElementSibling;
  const isOpen = !answer.hidden;
  // Close all others
  document.querySelectorAll('.faq-a').forEach(a => { a.hidden = true; });
  document.querySelectorAll('.faq-q').forEach(b => { b.setAttribute('aria-expanded','false'); b.classList.remove('open'); });
  if(!isOpen){ answer.hidden = false; btn.setAttribute('aria-expanded','true'); btn.classList.add('open'); }
}

/* ── FAQ Admin ── */
function renderFaqAdmin(){
  const list = $('faqAdminList'); if(!list) return;
  list.innerHTML = '';
  FAQ.forEach((item, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:8px';
    row.innerHTML = `
      <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
        <input class="field" style="flex:1;font-weight:600" value="${esc(item.q)}" placeholder="Question" oninput="FAQ[${i}].q=this.value">
        <button class="btn btn-ghost xs" onclick="moveFaq(${i},-1)" title="Move up">↑</button>
        <button class="btn btn-ghost xs" onclick="moveFaq(${i},1)" title="Move down">↓</button>
        <button class="btn btn-ghost xs" style="color:#B0432E" onclick="deleteFaq(${i})">✕</button>
      </div>
      <textarea class="field" rows="3" style="font-size:13px" placeholder="Answer" oninput="FAQ[${i}].a=this.value">${esc(item.a)}</textarea>`;
    list.appendChild(row);
  });
}

function addFaqItem(){
  FAQ.push({q:'New question',a:'Answer goes here.'});
  renderFaqAdmin();
}
function deleteFaq(i){
  if(!confirm('Remove this FAQ item?'))return;
  FAQ.splice(i,1); renderFaqAdmin();
}
function moveFaq(i,dir){
  const j=i+dir; if(j<0||j>=FAQ.length)return;
  [FAQ[i],FAQ[j]]=[FAQ[j],FAQ[i]]; renderFaqAdmin();
}
async function saveFaq(){
  saveJSON('cms_faq', FAQ);
  const ok = await cmsSet('faq', FAQ);
  renderFaq();
  toast(ok ? 'FAQ saved ✓ — visible to all visitors' : 'Saved locally');
}

// GLOBAL SAFETY NET, not a per-callsite fix: every <img> that appears anywhere on the site, from
// any current or future render function, automatically gets native lazy-loading unless something
// explicitly opts it out by setting loading='eager' first. A render function that forgets to add
// loading="lazy" itself — exactly the class of bug that kept resurfacing across different pages —
// can no longer cause a page to fire off many image downloads at once, because the browser is
// told to defer offscreen images regardless of what any individual piece of code remembered to do.
function enforceLazyLoading(root){
  if(!root||!root.querySelectorAll)return;
  root.querySelectorAll('img').forEach(img=>{
    if(!img.loading||img.loading==='auto')img.loading='lazy';
  });
}
new MutationObserver(mutations=>{
  mutations.forEach(m=>{
    m.addedNodes.forEach(node=>{
      if(node.nodeType!==1)return; // element nodes only
      if(node.tagName==='IMG'){ if(!node.loading||node.loading==='auto')node.loading='lazy'; }
      else enforceLazyLoading(node);
    });
  });
}).observe(document.documentElement,{childList:true,subtree:true});
enforceLazyLoading(document); // catch whatever's already in the initial HTML too

loadHeroImage(); loadScanHeroImage(); loadStoreHeroImage(); applyContent(); applySiteCfgToPublicSite(); syncCartBadge(); renderClients(); renderPhotoServices(); renderGallery(); buildRteToolbars(); renderFaq();
// NOTE: backfillPostSlugs/backfillProductSlugs/migrateLegacyPostImages/migrateLegacyContentImages
// deliberately do NOT run here. This is the very first, synchronous read of whatever happens to
// be in THIS browser's local cache — it hasn't been reconciled with Supabase yet. If any of
// those functions found something to "fix" (e.g. an old post missing a slug) in that unverified
// snapshot and saved it, they'd push a possibly-stale local copy up to Supabase and silently
// overwrite anything newer that was already there — a post published from another session,
// for instance. They now only run later, after cmsLoadAll has told us what Supabase actually
// has (see below), so they can never operate on stale data.

// Restore login session, THEN route from the current URL — needed so a direct link to
// /dashboard (which requires S.user) resolves correctly instead of racing the auth check.
// .catch() ensures routing still runs even if session restore fails for some reason
// (e.g. a network hiccup) — without it, a rejected promise here would leave the site
// stuck showing Home regardless of the URL the visitor actually opened.
restoreSession().catch(()=>{}).then(routeFromPath);

// Load all CMS content from Supabase and apply — every visitor gets the latest
cmsLoadAll().then((fetched)=>{
  // Merge Supabase content into live variables — using `fetched` directly (what Supabase
  // actually returned this session), NOT a re-read from localStorage. Local caching can fail
  // silently (storage quota, private browsing, anything) without that meaning the fetch itself
  // failed; the app must not lose correct, already-in-hand data just because it couldn't also
  // be cached for next time.
  const sbContent=fetched.content;
  if(sbContent){CONTENT={...CONTENT_DEFAULTS,...sbContent};applyContent();loadHeroImage();loadScanHeroImage();loadStoreHeroImage();renderStore();}

  const sbCatalog=fetched.catalog;
  if(sbCatalog&&Array.isArray(sbCatalog)){CATALOG=sbCatalog;backfillProductSlugs();renderStore();
    if(location.pathname.startsWith('/store/'))routeFromPath();
  }

  const sbPosts=fetched.posts;
  if(sbPosts&&Array.isArray(sbPosts)){POSTS=sbPosts;backfillPostSlugs();renderBlog();
    // A direct /journal/<id> link may have 404'd back to /journal on first load if that
    // post only existed in the cloud and hadn't reached this browser's local cache yet —
    // re-route now that POSTS is up to date so the link still resolves correctly.
    if(location.pathname.startsWith('/journal/'))routeFromPath();
  }
  migrateLegacyPostImages(); migrateLegacyContentImages();

  const sbClients=fetched.clients;
  if(sbClients&&Array.isArray(sbClients)){CLIENTS=sbClients;renderClients();}

  const sbPhotoServices=fetched.photo_services;
  if(sbPhotoServices&&Array.isArray(sbPhotoServices)){PHOTO_SERVICES=sbPhotoServices;renderPhotoServices();}

  const sbGallery=fetched.gallery;
  if(sbGallery&&Array.isArray(sbGallery)){GALLERY=sbGallery;GALLERY.forEach(im=>{if(!Array.isArray(im.images))im.images=[];});renderGallery();}

  const sbSiteCfg=fetched.site_cfg;
  if(sbSiteCfg){Object.assign(SITE_CFG,sbSiteCfg);if(SITE_CFG.accentColor)applySiteColor('accent',SITE_CFG.accentColor);applySiteCfgToPublicSite();}

  const sbFaq=fetched.faq;
  if(sbFaq&&Array.isArray(sbFaq)&&sbFaq.length){FAQ=sbFaq;renderFaq();if($('view-home').classList.contains('active'))setPageSchema(buildFaqSchema());}

  const sbSeomoat=fetched.seomoat;
  if(sbSeomoat){
    SEOMOAT={...seomoatDefaults(),...sbSeomoat};
    if(!Array.isArray(SEOMOAT.topics)||!SEOMOAT.topics.length)SEOMOAT.topics=JSON.parse(JSON.stringify(SEOMOAT_TOPICS_DEFAULT));
    if($('ap-seomoat')&&$('ap-seomoat').style.display!=='none')renderSeoMoat();
  }
});
