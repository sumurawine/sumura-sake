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

      /* ラベル：明るい帯（紙の部分）を探して、そこを切り抜きます */
      let ly = px(H * 0.50, H), lh = px(H * 0.32, H - px(H * 0.50, H)) || 10;
      let lx = px(W * 0.30, W), lw = px(W * 0.40, W - px(W * 0.30, W)) || 10;
      try {
        const SR = 96, SC = 48;
        const gray = await im.clone().resize(SC, SR, { fit: 'fill' }).grayscale().raw().toBuffer();
        const rowB = (y) => { let s = 0; for (let x = 14; x < 34; x++) s += gray[y * SC + x]; return s / 20; };
        let best = [0, 0], cur = [0, 0];
        for (let y = Math.floor(SR * 0.34); y < Math.floor(SR * 0.94); y++) {
          if (rowB(y) > 112) { if (!cur[1]) cur = [y, 0]; cur[1]++; if (cur[1] > best[1]) best = cur.slice(); }
          else cur = [0, 0];
        }
        if (best[1] >= 9) {
          const y0 = best[0], y1 = best[0] + best[1];
          const colB = (x) => { let s = 0; for (let y = y0; y < y1; y++) s += gray[y * SC + x]; return s / (y1 - y0); };
          let x0 = 24, x1 = 24;
          while (x0 > 2 && colB(x0 - 1) > 105) x0--;
          while (x1 < SC - 2 && colB(x1 + 1) > 105) x1++;
          if (x1 - x0 >= 8) {
            ly = px((y0 - 0.5) / SR * H, H); lh = px((best[1] + 1.5) / SR * H, H - ly) || lh;
            lx = px((x0 - 0.5) / SC * W, W); lw = px((x1 - x0 + 1.5) / SC * W, W - lx) || lw;
          }
        }
      } catch { /* 探せなければ、中ほどのまま */ }
      /* 瓶の丸みを数値的に展開して、正面から見たラベルに起こします */
      const rawL = await im.clone().extract({ left: lx, top: ly, width: lw, height: lh })
        .removeAlpha().raw().toBuffer();
      const Wo = 192;
      const outB = Buffer.alloc(Wo * lh * 3);
      const Rr = W * 0.485;
      const cxx = lx + lw / 2;
      const thMax = Math.asin(Math.min(0.999, (lw / 2) / Rr));
      for (let xo = 0; xo < Wo; xo++) {
        const tt = (xo / (Wo - 1)) * 2 - 1;
        const xin = cxx + Rr * Math.sin(thMax * tt) - lx;
        const x0 = Math.max(0, Math.min(lw - 1, Math.floor(xin)));
        const x1 = Math.min(lw - 1, x0 + 1);
        const fx = Math.min(1, Math.max(0, xin - x0));
        for (let yy = 0; yy < lh; yy++) {
          for (let cch = 0; cch < 3; cch++) {
            const va = rawL[(yy * lw + x0) * 3 + cch];
            const vb = rawL[(yy * lw + x1) * 3 + cch];
            outB[(yy * Wo + xo) * 3 + cch] = va + (vb - va) * fx;
          }
        }
      }
      await sharp(outB, { raw: { width: Wo, height: lh, channels: 3 } })
        .resize(192, 256, { fit: 'fill' })
        .webp({ quality: 76 })
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
