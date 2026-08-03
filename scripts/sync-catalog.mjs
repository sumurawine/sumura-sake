/* すむら酒店：オンラインストア（sumura-sake.com）から、
   品書きと造り手の解説を汲んでまいります。
   ・商品は消しません。見当たらなくなったものは在庫0にするだけです。
   ・うまく読めなかったときは、何も書き換えずに止まります。 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://sumura-sake.com';
const PUB = path.join(process.cwd(), 'public');
const UA = 'Mozilla/5.0 (compatible; sumura-sake.jp catalogue sync)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function grab(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ja' } });
      if (r.ok) return await r.text();
      if (r.status === 404) return '';
    } catch { /* もう一度 */ }
    await sleep(900 * (i + 1));
  }
  return '';
}

/* 生の綴りを、読める文にほぐします */
const strip = (h) => String(h || '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/p>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

/* 産地の区分。左が sumura-sake.com の綴り、右が当方の呼び名 */
const REGION = [
  [/ブルゴーニュ|BOURGOGNE/i, 'burgundy'],
  [/ローヌ|RHONE/i, 'rhone'],
  [/ジュラ|JURA/i, 'jura'],
  [/ロワール|LOIRE/i, 'loire'],
  [/アルザス|ALSACE/i, 'alsace'],
  [/ボルドー|BORDEAUX/i, 'bordeaux'],
  [/イタリア|ITALY/i, 'italy'],
  [/オーストラリア|AUSTRALIA/i, 'australia'],
  [/アメリカ|カリフォルニア|オレゴン|U\.?S/i, 'usa'],
  [/ウイスキー|WHISKY|WHISKEY/i, 'whisky'],
];
const regionOf = (s) => (REGION.find(([re]) => re.test(s)) || [null, 'other'])[1];

/* 目次から、産地とその下の造り手をひろいます */
function categories(html) {
  const out = [];
  const re = /href="[^"]*item-list\?categoryId=(\d+)"[^>]*>([\s\S]{0,200}?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    const label = strip(m[2]).replace(/\s+/g, ' ').trim();
    if (!label) continue;
    if (!out.some((x) => x.id === id)) out.push({ id, label });
  }
  return out;
}

/* 一覧の頁から、商品番号と、造り手の解説をひろいます */
function fromList(html) {
  const ids = [...new Set([...html.matchAll(/item-detail\/(\d+)/g)].map((m) => m[1]))];
  let desc = '';
  const md = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
  if (md) desc = strip(md[1]);
  /* 頁のなかの解説のほうが長いことがありますので、長いほうを採ります */
  const body = html.match(/<div[^>]*class="[^"]*(?:category|cate)[^"]*"[\s\S]{0,80}?>([\s\S]{0,6000}?)<\/div>/i);
  if (body) {
    const t = strip(body[1]);
    if (t.length > desc.length && t.length < 6000) desc = t;
  }
  const more = /表示件数[：:]\s*\d+\s*[〜～-]\s*(\d+)\s*\/\s*(\d+)/.exec(strip(html));
  return { ids, desc, shown: more ? +more[1] : ids.length, total: more ? +more[2] : ids.length };
}

/* 一枚の商品の頁から、要る事柄をひろいます */
function fromItem(html, id) {
  const text = strip(html);
  const name = (html.match(/<title>([^<]*)<\/title>/i) || [, ''])[1]
    .replace(/\s*\|\s*すむら酒店\s*$/, '').trim();
  const price = (text.match(/販売価格\s*([\d,]+)\s*円/) || [, ''])[1];
  const stock = (text.match(/在庫\s*(\d+)/) || [, ''])[1];
  const soldOut = /在庫切れのため注文いただけません/.test(text);
  const img = (html.match(/https:\/\/image\.raku-uru\.jp\/[^\s"'<>]+?_1200\.[a-z]+/i) || [, ''])[0]
    || (html.match(/https:\/\/image\.raku-uru\.jp\/01\/[^\s"'<>]+\.(?:jpe?g|png|webp)/i) || [, ''])[0] || '';
  let desc = '';
  const d = text.split(/商品詳細/);
  if (d.length > 1) {
    desc = d[1].split(/CLOSE MENU|会員登録|カテゴリー|SHOPPING GUIDE/)[0].trim();
    if (desc.length > 4000) desc = desc.slice(0, 4000);
  }
  return {
    id,
    name,
    price: price ? price + '円' : '',
    img,
    stock: soldOut ? '0' : (stock || '1'),
    desc: desc || undefined,
  };
}

/* ここから本番 ------------------------------------------------ */
const home = await grab(BASE + '/');
if (!home) { console.error('入口が読めませんでした。何も書き換えません。'); process.exit(1); }

const cats = categories(home);
const makers = [];
const wanted = new Map();       // 商品番号 → { cat, prod }

let region = 'other';
for (const c of cats) {
  const label = c.label.replace(/^▪️\s*/, '').trim();
  /* 「▪️」で始まる見出し、または産地の名そのものは、束ねの区分とみなします */
  const isTop = /^▪️/.test(c.label) || regionOf(label) !== 'other';

  let html = await grab(`${BASE}/item-list?categoryId=${c.id}`);
  await sleep(380);
  if (!html) continue;
  let { ids, desc, total } = fromList(html);

  /* 頁が続くようなら、めくってまいります */
  for (let pg = 2; ids.length < total && pg <= 12; pg++) {
    const more = await grab(`${BASE}/item-list?categoryId=${c.id}&page=${pg}`);
    await sleep(320);
    if (!more) break;
    const got = fromList(more).ids;
    const add = got.filter((x) => !ids.includes(x));
    if (!add.length) break;
    ids = ids.concat(add);
  }

  if (isTop) { region = regionOf(label); continue; }

  const prodJa = label.replace(/\s+[A-Z0-9'’&\-\. ]+$/, '').trim() || label;
  makers.push({ id: c.id, name: prodJa, label, region, desc, n: total, ids });
  for (const id of ids) wanted.set(id, { cat: region, prod: prodJa });
  console.log(`一覧 ${label}: ${ids.length}/${total}点 ・解説 ${desc.length}字`);
}

if (wanted.size < 40) { console.error(`商品が ${wanted.size} 点しか拾えませんでした。何も書き換えません。`); process.exit(1); }

const before = JSON.parse(fs.readFileSync(path.join(PUB, 'products.json'), 'utf8'));
const byId = new Map(before.items.map((x) => [String(x.id), x]));

let fresh = 0, added = 0, failed = 0;
for (const [id, meta] of wanted) {
  const html = await grab(`${BASE}/item-detail/${id}`);
  await sleep(320);
  if (!html) { failed++; continue; }
  const it = fromItem(html, id);
  if (!it.name) { failed++; continue; }
  const old = byId.get(id);
  const next = {
    ...(old || {}),
    id, name: it.name, price: it.price || (old ? old.price : ''),
    img: it.img || (old ? old.img : ''),
    cat: meta.cat, prod: meta.prod, stock: it.stock,
    desc: it.desc || (old ? old.desc : undefined),
    notes: (old && old.notes) || [],
  };
  if (old && !old.ap && next.ap === undefined) delete next.ap;
  byId.set(id, next);
  old ? fresh++ : added++;
}

/* 一覧から消えた品は、消さずに在庫0へ */
let goneToZero = 0;
for (const [id, it] of byId) {
  if (!wanted.has(id) && String(it.stock) !== '0' && /^[0-9]+$/.test(id)) { it.stock = '0'; goneToZero++; }
}

if (failed > wanted.size * 0.25) { console.error(`${failed} 点が読めませんでした。何も書き換えません。`); process.exit(1); }

const items = [...byId.values()];

/* 目でたしかめられるように、見本をいくつか */
const look = (x) => `  ${x.id} ｜${x.name}｜${x.price}｜在${x.stock}｜画${x.img ? '有' : '無'}｜説${(x.desc || '').length}字`;
console.log('--- 見本 ---');
for (const x of items.slice(0, 3)) console.log(look(x));
const withDesc = items.filter((x) => x.desc && x.desc.length > 60);
if (withDesc.length) {
  console.log('--- 説明文の見本 ---');
  console.log('  ' + withDesc[0].name + '\n  ' + withDesc[0].desc.slice(0, 220).replace(/\n/g, ' / '));
}
if (makers[0]) {
  console.log('--- 造り手の解説の見本 ---');
  console.log('  ' + makers[0].name + '\n  ' + String(makers[0].desc || '').slice(0, 220).replace(/\n/g, ' / '));
}

console.log(`更新 ${fresh} ・追加 ${added} ・在庫0へ ${goneToZero} ・読めず ${failed} ・合計 ${items.length}`);
console.log(`造り手 ${makers.length}軒 ／ うち解説あり ${makers.filter((m) => m.desc && m.desc.length > 40).length}軒`);
console.log(`値のある品 ${items.filter((x) => x.price).length} ・画のある品 ${items.filter((x) => x.img).length} ・説明のある品 ${items.filter((x) => x.desc).length}`);

if (process.env.DRY === '1') { console.log('（下読みのみ。書き換えておりません）'); process.exit(0); }

fs.writeFileSync(path.join(PUB, 'products.json'),
  JSON.stringify({ generated: new Date().toISOString(), count: items.length, items }, null, 0));
fs.writeFileSync(path.join(PUB, 'producers.json'),
  JSON.stringify({ generated: new Date().toISOString(), makers }, null, 0));
console.log('書き込みました。');
