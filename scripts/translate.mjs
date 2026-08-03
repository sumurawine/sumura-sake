/* 未訳の文章を Gemini に訳してもらい、public/products.i18n.json に納めます。
   ・すでに訳のあるものには手を触れません。
   ・生産者の名は用語集として渡し、綴りを揃えます。
   ・途中でしくじっても、そこまでの訳は残します。 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY || '';
if (!KEY) { console.error('翻訳の鍵がございません。GEMINI_API_KEY をお納めください。'); process.exit(1); }

const PUB = path.join(process.cwd(), 'public');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(PUB, f), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LANGS = [['en', '英語'], ['fr', 'フランス語'], ['zh', '中国語（簡体字）'], ['ko', '韓国語']];
const MODEL = process.env.MODEL || 'gemini-3.5-flash';
const CHARS = +(process.env.CHARS || 3600);   // ひと呼びに載せる日本語の目安
const PACE = +(process.env.PACE || 6800);     // 一分あたりの上限に合わせた間合い
const MAXCALL = +(process.env.MAXCALL || 200);

function dkey(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 'd' + h.toString(36) + '_' + s.length;
}

if (process.env.LIST === '1') {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + KEY);
  const j = await r.json();
  console.log(r.status);
  for (const m of (j.models || [])) {
    if ((m.supportedGenerationMethods || []).indexOf('generateContent') >= 0) console.log('  ' + m.name);
  }
  if (!j.models) console.log(JSON.stringify(j).slice(0, 300));
  process.exit(0);
}

const pr = rd('products.json');
let pj = { makers: [] };
try { pj = rd('producers.json'); } catch { /* まだ無いこともあります */ }
const i18 = rd('products.i18n.json');
i18.descs = i18.descs || {};
i18.makers = i18.makers || {};

/* 用語集：生産者の名の綴りを揃えます */
function glossFor(lang) {
  const out = [];
  for (const jp in (i18.producers || {})) {
    const w = i18.producers[jp] && (i18.producers[jp][lang] || i18.producers[jp].en);
    if (w && w !== jp) out.push(jp + ' = ' + w);
  }
  return out.slice(0, 300).join('\n');
}

/* 訳すべきもの一覧 */
const jobs = [];   // { store:'descs'|'makers', key, jp }
const seen = new Set();
for (const it of pr.items) {
  const d = String(it.desc || '').trim();
  if (!d || seen.has(d)) continue;
  seen.add(d);
  jobs.push({ store: 'descs', key: dkey(d), jp: d });
}
for (const m of (pj.makers || [])) {
  const d = String(m.desc || '').trim();
  if (d.length < 120) continue;
  jobs.push({ store: 'makers', key: m.name, jp: d });
}

async function ask(fields, langName, gloss) {
  const prompt =
    'あなたは日本の高級ワイン専門店「すむら酒店」の文章を' + langName + 'に訳す、その言語を母語とするプロの翻訳者です。\n' +
    '守ってほしいこと:\n' +
    '1. 直訳を避け、その言語の母語話者が最初からその言語で書いたとしか思えない、自然で読みやすい文章にしてください。\n' +
    '2. 日本語の丁寧で落ち着いた語り口を、その言語での上品な言い回しに置き換えてください。\n' +
    '3. 葡萄畑・醸造・熟成の用語は、その言語のワインの世界で実際に使われている言い方にしてください。\n' +
    '4. 下の用語集にある言葉は、指定どおりの綴りをそのまま使ってください。\n' +
    '5. 「株式会社フィネス資料」のような出典の断り書きは、そのまま残してください。\n' +
    '6. 説明や注釈は書かず、訳文だけを返してください。\n' +
    '7. 返す形式は JSON。渡された鍵をそのまま使い、値を訳文にしてください。\n' +
    (gloss ? '\n【用語集】\n' + gloss + '\n' : '') +
    '\n【訳す文】\n' + JSON.stringify(fields, null, 1);

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + KEY;
  for (let t = 0; t < 4; t++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json', maxOutputTokens: 32768 },
        }),
      });
      if (r.status === 429 || r.status >= 500) { console.error('  ' + r.status + ' ' + (await r.text()).slice(0, 160)); await sleep(12000 * (t + 1)); continue; }
      if (!r.ok) { console.error('  ' + r.status + ' ' + (await r.text()).slice(0, 120)); await sleep(2500); continue; }
      const j = await r.json();
      const txt = j.candidates[0].content.parts[0].text;
      return JSON.parse(txt);
    } catch (e) {
      console.error('  例外 ' + String(e && e.message || e).slice(0, 200));
      await sleep(3000 * (t + 1));
    }
  }
  return null;
}

let calls = 0, done = 0, failed = 0;
for (const [lang, langName] of LANGS) {
  const gloss = glossFor(lang);
  const todo = jobs.filter((j) => {
    const cur = i18[j.store][j.key];
    return !(cur && String(cur[lang] || '').trim());
  });
  console.log(`${lang}: 未訳 ${todo.length}件`);
  let i = 0;
  while (i < todo.length && calls < MAXCALL) {
    const bag = [];
    let n = 0;
    while (i < todo.length && (bag.length === 0 || n + todo[i].jp.length < CHARS) && bag.length < 8) {
      n += todo[i].jp.length; bag.push(todo[i]); i++;
    }
    const fields = {};
    bag.forEach((b, k) => { fields['t' + k] = b.jp; });
    calls++;
    const got = await ask(fields, langName, gloss);
    if (!got) { failed += bag.length; console.log(`  ${lang} ${calls}回目 だめでした（${bag.length}件）`); continue; }
    bag.forEach((b, k) => {
      const v = String(got['t' + k] || '').trim();
      if (!v) { failed++; return; }
      i18[b.store][b.key] = i18[b.store][b.key] || {};
      i18[b.store][b.key][lang] = v;
      done++;
    });
    if (calls % 5 === 0) console.log(`  …${calls}回・${done}件`);
    await sleep(PACE);
  }
}

console.log(`呼び出し ${calls}回 ／ 納めた訳 ${done}件 ／ しくじり ${failed}件`);
const left = LANGS.reduce((a, [l]) => a + jobs.filter((j) => !(i18[j.store][j.key] && i18[j.store][j.key][l])).length, 0);
console.log(`のこり ${left}件`);

if (done === 0) { console.log('書き換えるものがございませんでした。'); process.exit(0); }
fs.writeFileSync(path.join(PUB, 'products.i18n.json'), JSON.stringify(i18));
console.log('書き込みました。');
