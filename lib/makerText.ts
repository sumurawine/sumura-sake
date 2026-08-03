import fs from 'node:fs';
import path from 'node:path';

type Maker = { id: string; name: string; title: string; region: string; desc: string; n: number };

const NL = String.fromCharCode(10);

/** 欧文と間の空きを落として、名寄せの鍵にします */
const norm = (s: string) =>
  String(s || '').replace(/[A-Za-zÀ-ÿ0-9'’&.-]+/g, ' ').replace(/[ 　]+/g, '').trim();

let cache: Record<string, string> | null = null;

/** オンラインストアから汲んだ、造り手の解説 */
export function makerTexts(): Record<string, string> {
  if (cache) return cache;
  const out: Record<string, string> = {};
  try {
    const j = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'producers.json'), 'utf8'),
    ) as { makers: Maker[] };
    for (const m of j.makers || []) {
      const d = String(m.desc || '').trim();
      if (d.length < 120) continue;
      const k = norm(m.name);
      if (!k) continue;
      if (!out[k] || out[k].length < d.length) out[k] = d;
    }
  } catch {
    /* まだ無いときは、何も返しません */
  }
  cache = out;
  return out;
}

export function makerText(prod: string): string {
  return makerTexts()[norm(prod)] || '';
}

/** 段落に割ります */
export function paras(s: string): string[] {
  return String(s || '').split(NL).map((x) => x.trim()).filter(Boolean);
}
