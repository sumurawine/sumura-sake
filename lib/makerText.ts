import fs from 'node:fs';
import path from 'node:path';

type Maker = { id: string; name: string; title: string; region: string; desc: string; n: number };
type Hit = { name: string; desc: string };

const NL = String.fromCharCode(10);

/** 欧文と間の空きを落として、名寄せの鍵にします */
const norm = (s: string) =>
  String(s || '').replace(/[A-Za-zÀ-ÿ0-9'’&.-]+/g, ' ').replace(/[ 　]+/g, '').trim();

let cache: Record<string, Hit> | null = null;
let tcache: Record<string, Record<string, string>> | null = null;

/** オンラインストアから汲んだ、造り手の解説 */
export function makerTexts(): Record<string, Hit> {
  if (cache) return cache;
  const out: Record<string, Hit> = {};
  try {
    const j = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'producers.json'), 'utf8'),
    ) as { makers: Maker[] };
    for (const m of j.makers || []) {
      const d = String(m.desc || '').trim();
      if (d.length < 120) continue;
      const k = norm(m.name);
      if (!k) continue;
      if (!out[k] || out[k].desc.length < d.length) out[k] = { name: m.name, desc: d };
    }
  } catch {
    /* まだ無いときは、何も返しません */
  }
  cache = out;
  return out;
}

function trans(): Record<string, Record<string, string>> {
  if (tcache) return tcache;
  let m: Record<string, Record<string, string>> = {};
  try {
    const j = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'products.i18n.json'), 'utf8'),
    );
    m = j.makers || {};
  } catch {
    /* まだ無いこともあります */
  }
  tcache = m;
  return m;
}

/** 造り手の解説。その言語の訳がなければ、何も返しません */
export function makerAbout(prod: string, lang: string): string {
  const hit = makerTexts()[norm(prod)];
  if (!hit) return '';
  if (lang === 'jp') return hit.desc;
  const t = trans()[hit.name];
  return (t && t[lang]) || '';
}

/** 段落に割ります */
export function paras(s: string): string[] {
  return String(s || '').split(NL).map((x) => x.trim()).filter(Boolean);
}
