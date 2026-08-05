/* ビルドのあとに、
   ・時代ごとの入口（軽い案内だけの頁）
   ・sitemap.xml（全ページ・全言語、hreflang 付き）
   をこしらえます。 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const BASE = process.env.BASE_PATH || '';
const SITE = 'https://sumura-sake.jp';
const LANGS = ['jp', 'en', 'fr', 'zh', 'ko'];
const TAG = { jp: 'ja', en: 'en', fr: 'fr', zh: 'zh', ko: 'ko' };
const ERAS = ['1995', '2005', '2010', 'now'];
const pre = (l) => (l === 'jp' ? '' : '/' + l);

const read = (f) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', f), 'utf8'));
const items = read('products.json').items || [];
let i18n = null;
try { i18n = read('products.i18n.json'); } catch { i18n = null; }

/* 綴りの作り方は lib/slug.ts と同じにしてあります */
const slugify = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'`]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '').slice(0, 84).replace(/-+$/g, '');
const latin = (it) => (i18n?.items?.[it.id]?.name?.en || i18n?.items?.[it.id]?.name?.fr || it.name || '').trim();

const seen = {}; const map = {};
for (const it of items.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
  let b = slugify(latin(it)) || 'wine';
  const n = (seen[b] = (seen[b] || 0) + 1);
  map[it.id] = n === 1 ? b : `${b}-${it.id}`;
}
const wineSlugs = Object.values(map);
const makerSlugs = [...new Set(items.filter((x) => x.prod)
  .map((x) => slugify(i18n?.producers?.[x.prod]?.en || x.prod) || 'producer'))];

const nameOf = {};
items.forEach((it) => { nameOf[map[it.id]] = it.name; });

/* ── 時代ごとの入口 ───────────────────────────── */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let stubs = 0;
const stub = (era, lang, kind, slug) => {
  const target = `${BASE}${pre(lang)}/${kind}/${slug}`;
  const canon = `${SITE}${pre(lang)}/${kind}/${slug}`;
  const title = kind === 'wine' ? (nameOf[slug] || slug) : slug;
  const html = `<!doctype html><html lang="${TAG[lang]}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${esc(canon)}">
<title>${esc(title)}</title>
<script>try{localStorage.setItem('era','${era}')}catch(e){}location.replace(${JSON.stringify(target)});</script>
<meta http-equiv="refresh" content="0;url=${esc(target)}">
</head><body style="background:#0d0a08;color:#f3f0ea;font-family:serif;padding:40px">
<p><a style="color:#c9ad82" href="${esc(target)}">${esc(title)}</a></p></body></html>`;
  const dir = path.join(OUT, era, lang === 'jp' ? '' : lang, kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, slug + '.html'), html);
  stubs++;
};
for (const era of ERAS) for (const lang of LANGS) {
  for (const s of wineSlugs) stub(era, lang, 'wine', s);
  for (const s of makerSlugs) stub(era, lang, 'maker', s);
}

/* ── sitemap ─────────────────────────────────── */
const PAGES = ['/home', '/store', '/producers', '/about', '/access', '/news', '/blog', '/contact', '/legal', '/mukashi', '/virtual'];
const today = new Date().toISOString().slice(0, 10);
const rows = [];
const put = (paths, prio, freq) => {
  for (const p of paths) {
    const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${TAG[l]}" href="${SITE}${pre(l)}${p}"/>`).join('\n');
    rows.push(`  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p}"/>
  </url>`);
    for (const l of LANGS.filter((x) => x !== 'jp')) {
      rows.push(`  <url>
    <loc>${SITE}${pre(l)}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p}"/>
  </url>`);
    }
  }
};
/* 主要ページ（日本語と、言語ごとの住所） */
for (const p of PAGES) {
  const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${TAG[l]}" href="${SITE + pre(l) + p}"/>`).join('\n');
  const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p}"/>`;
  const prio = p === '/home' ? '1.0' : '0.8';
  rows.push(`  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${prio}</priority>
${alts}
${xd}
  </url>`);
  for (const l of LANGS.filter((x) => x !== 'jp')) {
    rows.push(`  <url>
    <loc>${SITE}${pre(l)}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${prio}</priority>
${alts}
${xd}
  </url>`);
  }
}
put(['/wines'], '0.9', 'weekly');
put(wineSlugs.map((s) => `/wine/${s}`), '0.9', 'weekly');
put(makerSlugs.map((s) => `/maker/${s}`), '0.7', 'monthly');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), xml);

console.log(`[after-build] 時代の入口 ${stubs} 枚 / sitemap ${rows.length} 行`);
