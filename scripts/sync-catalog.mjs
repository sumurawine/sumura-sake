/* すむら酒店：オンラインストア（sumura-sake.com）から品書きを汲んでまいります。
   一 既知の商品を一枚ずつ見に行き、名・値・在庫・画・説明を新しくします。
   二 そこに出てくる区分（造り手）の頁をたどり、新しい商品と造り手の解説を拾います。
   三 商品は消しません。頁が失われたものだけ在庫0にします。
   四 うまく読めなかったときは、何も書き換えずに止まります。 */
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
      if (r.status === 404 || r.status === 410) return null;   // 失われた頁
    } catch { /* もう一度 */ }
    await sleep(800 * (i + 1));
  }
  return '';
}

const ENT = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', acirc: 'â', ccedil: 'ç',
  ocirc: 'ô', ucirc: 'û', ugrave: 'ù', iuml: 'ï', euml: 'ë', ouml: 'ö', uuml: 'ü',
  Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Agrave: 'À', Acirc: 'Â', Ccedil: 'Ç',
  Ocirc: 'Ô', Ucirc: 'Û', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  hellip: '…', mdash: '—', ndash: '–', deg: '°', middot: '·', laquo: '«', raquo: '»',
};
const unent = (s) => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-zA-Z]+);/g, (m, n) => (ENT[n] !== undefined ? ENT[n] : m));

const strip = (h) => unent(String(h || '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
  .replace(/<[^>]+>/g, ''))
  .replace(/\r/g, '')
  .replace(/[ \t　]+/g, ' ')
  .replace(/ *\n */g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const REGION = [
  [/ブルゴーニュ|BOURGOGNE/i, 'burgundy'], [/ローヌ|RHONE|RH&Ocirc;NE/i, 'rhone'],
  [/ジュラ|JURA/i, 'jura'], [/ロワール|LOIRE/i, 'loire'], [/アルザス|ALSACE/i, 'alsace'],
  [/ボルドー|BORDEAUX/i, 'bordeaux'], [/イタリア|ITALY|ITALIA/i, 'italy'],
  [/オーストラリア|AUSTRALIA/i, 'australia'],
  [/アメリカ|カリフォルニア|オレゴン|CALIFORNIA|OREGON/i, 'usa'],
  [/ウイスキー|ウィスキー|WHISK/i, 'whisky'],
];
const regionOf = (s) => (REGION.find(([re]) => re.test(String(s))) || [null, ''])[1];

/* 頁のなかから、区分への案内をひろいます */
const catLinks = (html) => [...new Set(
  [...String(html).matchAll(/item-list\?categoryId=(\d+)/g)].map((m) => m[1]))];

/* 一枚の商品の頁 */
function readItem(html) {
  const text = strip(html);
  const name = unent((html.match(/<title>([^<]*)<\/title>/i) || [, ''])[1])
    .replace(/\s*[|｜]\s*すむら酒店.*$/, '').trim();
  const price = (text.match(/販売価格[^\d]{0,8}([\d,]+)\s*円/) || [, ''])[1];
  const stockN = (text.match(/在庫[^\d]{0,4}(\d+)/) || [, ''])[1];
  const soldOut = /在庫切れ|SOLD\s*OUT|売り切れ/i.test(text);
  const img = (html.match(/https:\/\/image\.raku-uru\.jp\/[^\s"'<>]+?_1200\.[a-zA-Z]+/) || [, ''])[0]
    || (html.match(/https:\/\/image\.raku-uru\.jp\/01\/[^\s"'<>]+?\.(?:jpe?g|png|webp|JPG|PNG)/) || [, ''])[0] || '';
  let desc = '';
  const parts = text.split(/商品詳細/);
  if (parts.length > 1) {
    desc = parts[1]
      .split(/CLOSE MENU|会員登録|カテゴリー|SHOPPING GUIDE|特定商取引|この商品を見た方/)[0]
      .replace(/^\s*[\n:：]+/, '').trim();
    if (desc.length > 4000) desc = desc.slice(0, 4000);
  }
  return { name, price: price ? price + '円' : '', img, stock: soldOut ? '0' : (stockN || '1'), desc };
}

/* 区分の頁。造り手の解説は、meta の書き出しを手がかりに本文から丸ごと拾います */
function readCat(html) {
  const ids = [...new Set([...String(html).matchAll(/item-detail\/(\d+)/g)].map((m) => m[1]))];
  const title = unent((html.match(/<title>([^<]*)<\/title>/i) || [, ''])[1])
    .replace(/\s*[|｜]\s*すむら酒店.*$/, '').trim();
  const meta = unent((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [, ''])[1]).trim();
  const total = +((strip(html).match(/表示件数[：:]\s*\d+\s*[〜～\-]\s*\d+\s*\/\s*(\d+)/) || [, 0])[1]);
  let desc = meta;
  if (meta.length > 24) {
    const body = strip(html);
    const head = meta.slice(0, 22);
    const i = body.indexOf(head);
    if (i >= 0) {
      const seg = body.slice(i, i + 8000)
        .split(/表示件数|並び替[ええ]|カートに入れる|該当商品|SHOPPING GUIDE|特定商取引|会員登録/)[0]
        .trim();
      if (seg.length > desc.length) desc = seg;
    }
  }
  return { ids, title, desc, total };
}

/* ここから ---------------------------------------------------- */
const before = JSON.parse(fs.readFileSync(path.join(PUB, 'products.json'), 'utf8'));
const byId = new Map(before.items.map((x) => [String(x.id), { ...x }]));
const prodRegion = new Map();     // 造り手 → 産地（すでに判っているもの）
for (const it of before.items) if (it.prod && it.cat) prodRegion.set(it.prod, it.cat);

/* 一 既知の商品を見に行きます */
const cats = new Set(catLinks(await grab(BASE + '/') || ''));
let fresh = 0, lost = 0, unread = 0;
for (const id of [...byId.keys()]) {
  if (!/^[0-9]+$/.test(id)) continue;
  const html = await grab(`${BASE}/item-detail/${id}`);
  await sleep(260);
  if (html === null) { byId.get(id).stock = '0'; lost++; continue; }
  if (!html) { unread++; continue; }
  const r = readItem(html);
  if (!r.name) { unread++; continue; }
  const o = byId.get(id);
  o.name = r.name;
  if (r.price) o.price = r.price;
  if (r.img) o.img = r.img;
  o.stock = r.stock;
  if (r.desc) o.desc = r.desc;
  for (const c of catLinks(html)) cats.add(c);
  fresh++;
}
if (unread > 30) { console.error(`${unread}枚が読めませんでした。何も書き換えません。`); process.exit(1); }

/* 二 区分の頁をたどります */
const makers = [];
const fresh2 = [];
for (const c of [...cats]) {
  const html = await grab(`${BASE}/item-list?categoryId=${c}`);
  await sleep(240);
  if (!html) continue;
  let { ids, title, desc, total } = readCat(html);
  for (let pg = 2; total && ids.length < total && pg <= 15; pg++) {
    const more = await grab(`${BASE}/item-list?categoryId=${c}&page=${pg}`);
    await sleep(220);
    if (!more) break;
    const add = readCat(more).ids.filter((x) => !ids.includes(x));
    if (!add.length) break;
    ids = ids.concat(add);
  }
  if (!title) continue;
  const isRegion = /^[▪■・\s]*(?:フランス|イタリア|アメリカ|その他)?\s*$/.test(title) || (regionOf(title) && ids.length > 40);
  const nameJa = title.replace(/^[▪■・\s]*/, '').replace(/\s+[A-Z0-9'’&\-\.\s]+$/, '').trim() || title;
  const region = prodRegion.get(nameJa) || regionOf(title) || regionOf(desc) || '';
  if (!isRegion) makers.push({ id: c, name: nameJa, title, region, desc, n: ids.length });
  for (const id of ids) if (!byId.has(id)) fresh2.push({ id, prod: isRegion ? '' : nameJa, cat: region });
  console.log(`区分 ${title}: ${ids.length}点 ・解説 ${desc.length}字${isRegion ? ' （束ね）' : ''}`);
}

/* 三 新顔を迎えます */
let added = 0;
for (const n of fresh2) {
  if (byId.has(n.id)) continue;
  const html = await grab(`${BASE}/item-detail/${n.id}`);
  await sleep(260);
  if (!html) continue;
  const r = readItem(html);
  if (!r.name) continue;
  byId.set(n.id, {
    id: n.id, name: r.name, price: r.price, img: r.img, stock: r.stock,
    cat: n.cat || 'other', prod: n.prod, ap: '', desc: r.desc || '', notes: [],
  });
  added++;
}

const items = [...byId.values()];
console.log(`見直し ${fresh} ・新顔 ${added} ・頁が消えた品 ${lost} ・読めず ${unread} ・合計 ${items.length}`);
console.log(`造り手 ${makers.length}軒 ／ 解説100字超 ${makers.filter((m) => (m.desc || '').length > 100).length}軒 ／ 最長 ${Math.max(0, ...makers.map((m) => (m.desc || '').length))}字`);
console.log(`値 ${items.filter((x) => x.price).length} ・画 ${items.filter((x) => x.img).length} ・説明 ${items.filter((x) => x.desc).length} ・在庫あり ${items.filter((x) => String(x.stock) !== '0').length}`);
const longest = makers.slice().sort((a, b) => (b.desc || '').length - (a.desc || '').length)[0];
if (longest) console.log('解説の見本 ' + longest.name + '｜' + String(longest.desc).slice(0, 300).replace(/\n/g, ' / '));

if (items.length < before.items.length) { console.error('数が減りました。書き換えません。'); process.exit(1); }
if (process.env.DRY === '1') { console.log('（下読みのみ）'); process.exit(0); }

fs.writeFileSync(path.join(PUB, 'products.json'),
  JSON.stringify({ generated: new Date().toISOString(), count: items.length, items }));
fs.writeFileSync(path.join(PUB, 'producers.json'),
  JSON.stringify({ generated: new Date().toISOString(), makers }));
console.log('書き込みました。');
