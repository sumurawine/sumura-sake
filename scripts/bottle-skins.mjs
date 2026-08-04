/* 実物の瓶をこしらえる材料集め。
   商品写真から、ラベルの切り抜きと、キャップ・瓶の色を拾い、
   public/labels/ に納めます。 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUB = path.join(process.cwd(), 'public');
const OUT = path.join(PUB, 'labels');
fs.mkdirSync(OUT, { recursive: true });

const pr = JSON.parse(fs.readFileSync(path.join(PUB, 'products.json'), 'utf8'));
const items = (pr.items || []).filter((x) => x.img && /^https:\/\/image\.raku-uru\.jp\//.test(x.img));
console.log('写真のある品 ' + items.length);

const index = fs.existsSync(path.join(OUT, 'index.json'))
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8'))
  : {};

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

async function avg(im, region) {
  const buf = await im.clone().extract(region).resize(1, 1, { fit: 'fill' }).raw().toBuffer();
  return hex(buf[0], buf[1], buf[2]);
}

let done = 0, fail = 0, skip = 0;
const queue = items.slice();

async function work() {
  for (;;) {
    const it = queue.shift();
    if (!it) return;
    const dst = path.join(OUT, it.id + '.webp');
    if (fs.existsSync(dst) && index[it.id] && process.env.FORCE !== '1') { skip++; continue; }
    try {
      const r = await fetch(it.img, { headers: { 'User-Agent': 'Mozilla/5.0 (sumura bottle skins)' } });
      if (!r.ok) { fail++; continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      const im = sharp(buf).rotate();
      const m = await im.metadata();
      const W = m.width || 0, H = m.height || 0;
      if (W < 60 || H < 120) { fail++; continue; }
      const px = (f, max) => Math.max(0, Math.min(max - 2, Math.round(f)));

      /* ラベル：胴の中ほどを切り抜きます */
      const lx = px(W * 0.30, W), lw = px(W * 0.40, W - lx) || 10;
      const ly = px(H * 0.50, H), lh = px(H * 0.32, H - ly) || 10;
      await im.clone().extract({ left: lx, top: ly, width: lw, height: lh })
        .resize(96, 128, { fit: 'fill' })
        .webp({ quality: 72 })
        .toFile(dst);

      /* キャップの色（首の上のほう）と、瓶の色（肩のあたり） */
      const cap = await avg(im, { left: px(W * 0.44, W), top: px(H * 0.04, H), width: px(W * 0.12, W) || 4, height: px(H * 0.07, H) || 4 });
      const glass = await avg(im, { left: px(W * 0.40, W), top: px(H * 0.30, H), width: px(W * 0.20, W) || 4, height: px(H * 0.08, H) || 4 });
      index[it.id] = { c: cap, g: glass };
      done++;
      if (done % 40 === 0) console.log('…' + done);
    } catch (e) {
      fail++;
    }
  }
}

await Promise.all([work(), work(), work(), work(), work(), work()]);
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
console.log(`納めた ${done} ・飛ばした ${skip} ・だめ ${fail} ・索引 ${Object.keys(index).length}件`);
