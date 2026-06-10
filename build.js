/**
 * Binder Site Builder
 * Reads content files and injects them into HTML templates
 * Runs on every Netlify deploy
 */

const fs   = require('fs');
const path = require('path');

// ── Helpers ────────────────────────────────────────────────────────
function readJSON(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch(e) {
    console.warn(`⚠ Could not read ${filePath}, using defaults`);
    return fallback;
  }
}

function readMD(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    // Parse frontmatter
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: raw };
    const fm = {};
    match[1].split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      fm[key] = val;
    });
    return { frontmatter: fm, body: match[2].trim() };
  } catch(e) {
    return { frontmatter: {}, body: '' };
  }
}

// Convert markdown body to HTML (minimal renderer)
function mdToHTML(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|b|u|o|l|p|i|a])/gm, '<p>')
    .replace(/<p>(<\/p>|<h|<ul|<blockquote)/g, '$1')
    + '</p>';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Load all content ───────────────────────────────────────────────
console.log('📖 Reading content files…');

const hero        = readJSON('content/homepage/hero.json');
const banner      = readJSON('content/homepage/banner.json');
const features    = readJSON('content/homepage/features.json');
const sizes       = readJSON('content/homepage/sizes.json');
const showcase    = readJSON('content/homepage/showcase.json');
const testimonials= readJSON('content/homepage/testimonials.json');
const general     = readJSON('content/settings/general.json');
const seo         = readJSON('content/settings/seo.json');

// Load blog posts
const blogDir = 'content/blog';
let blogPosts = [];
if (fs.existsSync(blogDir)) {
  blogPosts = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const { frontmatter: fm, body } = readMD(path.join(blogDir, f));
      return {
        slug:     f.replace('.md', ''),
        title:    fm.title || '',
        date:     fm.date  || '',
        category: fm.category || 'news',
        categoryLabel: {tips:'Design tips',stories:'Stories',guides:'Guides',print:'Print & craft',news:'News'}[fm.category] || fm.category,
        author:   fm.author || 'Binder Team',
        cover:    fm.cover_image || '',
        excerpt:  fm.excerpt || '',
        featured: fm.featured === 'true' || fm.featured === true,
        tags:     fm.tags   || [],
        body,
        html:     mdToHTML(body),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Load press coverage
const pressDir = 'content/press';
let pressItems = [];
if (fs.existsSync(pressDir)) {
  pressItems = fs.readdirSync(pressDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.json'))
    .map(f => {
      if (f.endsWith('.json')) return readJSON(path.join(pressDir, f));
      const { frontmatter: fm } = readMD(path.join(pressDir, f));
      return fm;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

console.log(`  ✓ ${blogPosts.length} blog posts`);
console.log(`  ✓ ${pressItems.length} press items`);

// ── Build: inject content into HTML files ─────────────────────────
// Read the existing HTML files and inject dynamic content via JS data blobs

const dataScript = `
<script>
window.BINDER_CONTENT = ${JSON.stringify({
  hero, banner, features, sizes, showcase, testimonials, general, seo, blogPosts, pressItems
}, null, 2)};
</script>`;

// Inject the data blob into each HTML file
['index.html','blog.html','blog-post.html','press.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  // Remove previous injection if any
  html = html.replace(/<script>\s*window\.BINDER_CONTENT[\s\S]*?<\/script>\n?/, '');
  // Inject before </head>
  html = html.replace('</head>', dataScript + '\n</head>');
  fs.writeFileSync(file, html);
  console.log(`  ✓ Injected content into ${file}`);
});

// ── Build: generate blog post pages ───────────────────────────────
// Update the blog-post.html to handle all posts from window.BINDER_CONTENT

console.log('\n✅ Build complete.');
console.log(`   Site is ready. Blog posts: ${blogPosts.length}`);
