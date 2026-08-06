/* =============================================================
   合言葉で本文を包む道具でございます。

   ・鍵は合言葉から作ります（PBKDF2・SHA-256・20万回）
   ・包みは AES-GCM。合言葉が違えば、ほどく段でそのまま失敗します。
   ・控えるのは包んだ文字列だけ。中の文はどこにも残りません。
   ============================================================= */

const ENC = new TextEncoder();
const DEC = new TextDecoder();
const ROUNDS = 200000;

/** 合言葉の表記ゆれを均します（全角・前後の空白・大文字小文字） */
export function norm(s: string): string {
  let v = String(s || '');
  try { v = v.normalize('NFKC'); } catch { /* しずかに */ }
  return v.trim().toLowerCase();
}

/** 受け渡しはすべて ArrayBuffer に揃えます */
function ab(u: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(u.byteLength);
  new Uint8Array(out).set(u);
  return out;
}

function bytes(text: string): ArrayBuffer {
  return ab(ENC.encode(text));
}

function b64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, Array.from(b.subarray(i, i + 0x8000)) as any);
  }
  return btoa(s);
}

function unb64(s: string): ArrayBuffer {
  const raw = atob(s);
  const out = new ArrayBuffer(raw.length);
  const b = new Uint8Array(out);
  for (let i = 0; i < raw.length; i++) b[i] = raw.charCodeAt(i);
  return out;
}

function salty(n: number): ArrayBuffer {
  return ab(crypto.getRandomValues(new Uint8Array(n)));
}

async function keyOf(pass: string, salt: ArrayBuffer) {
  const seed = await crypto.subtle.importKey('raw', bytes(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ROUNDS, hash: 'SHA-256' },
    seed,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** この環境で使えるかどうか */
export function canLock(): boolean {
  return typeof crypto !== 'undefined' && !!(crypto as any).subtle;
}

/** 包みます */
export async function lock(pass: string, text: string): Promise<string> {
  const salt = salty(16);
  const iv = salty(12);
  const k = await keyOf(norm(pass), salt);
  const box = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, bytes(text));
  return ['v1', b64(salt), b64(iv), b64(box)].join('.');
}

/** ほどきます。合言葉が違えば null が返ります */
export async function unlock(pass: string, packed: string): Promise<string | null> {
  try {
    const p = String(packed || '').split('.');
    if (p.length !== 4 || p[0] !== 'v1') return null;
    const k = await keyOf(norm(pass), unb64(p[1]));
    const out = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p[2]) }, k, unb64(p[3]));
    return DEC.decode(out);
  } catch {
    return null;
  }
}
