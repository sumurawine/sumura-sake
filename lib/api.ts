/* =============================================================
   Google Apps Script との橋渡し
   お問い合わせ / メルマガ登録 / ブログのコメント / 来客カウンター
   ------------------------------------------------------------
   ▼ ウェブアプリURLはここ1箇所だけ書き換えれば全部に効きます ▼
   ============================================================= */
export const SUMURA_API =
  'https://script.google.com/macros/s/AKfycbxbPAsUhQpvzxheNel3k91juYk8d4zpR1GPwubMGQT_FJmT6LZa7nWbC9awZryaX8Ubzg/exec';

export function apiReady(): boolean {
  const m = /^https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)\/exec$/.exec(SUMURA_API.trim());
  return !!(m && m[1].length >= 30);
}

export async function apiPost(payload: Record<string, unknown>): Promise<any> {
  if (!apiReady()) throw new Error('not-configured');
  const r = await fetch(SUMURA_API, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
  return r.json();
}

export async function apiGet(params: Record<string, string>): Promise<any> {
  if (!apiReady()) throw new Error('not-configured');
  const q = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  const r = await fetch(SUMURA_API + '?' + q, { redirect: 'follow' });
  return r.json();
}
