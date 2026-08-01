'use client';

/**
 * サイトの文言・写真の「上書き」を扱います。
 * 元の文章はコードに残したまま、シートに入っているものだけを差し替えます。
 * 上書きを消せば、いつでも元の姿に戻ります。
 */

import { SUMURA_API, apiReady } from './api';
import type { Lang } from './i18n';

export type OvRow = {
  キー: string;
  種類?: string;           // text | image | link
  '日本語'?: string;
  EN?: string; FR?: string; ZH?: string; KO?: string;
  'リンク文字(日本語)'?: string;
  'リンク文字EN'?: string; 'リンク文字FR'?: string; 'リンク文字ZH'?: string; 'リンク文字KO'?: string;
  'リンク先'?: string;
  '写真'?: string;
  [k: string]: string | undefined;
};

/** 鏡（preview）かどうか。編集の道具は鏡にだけ出します */
export function isMirror(): boolean {
  if (typeof window === 'undefined') return false;
  return /\/preview(\/|$)/.test(window.location.pathname);
}

let cache: Record<string, OvRow> | null = null;
let inflight: Promise<Record<string, OvRow>> | null = null;
const listeners = new Set<() => void>();

export function onOverrides(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** シートから上書きを読みます。失敗しても表側は元のまま出ます */
export function loadOverrides(force = false): Promise<Record<string, OvRow>> {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight && !force) return inflight;
  if (!apiReady()) return Promise.resolve({});
  const v = '?action=overrides&v=' + (force ? Date.now() : new Date().toISOString().slice(0, 13));
  inflight = fetch(SUMURA_API + v, { redirect: 'follow' })
    .then((r) => r.json())
    .then((j) => {
      const map: Record<string, OvRow> = {};
      const mirror = isMirror();
      (j?.rows || []).forEach((r: OvRow) => {
        if (!r || !r['キー']) return;
        // 本番には「公開」だけ。鏡には下書きも映します
        if (!mirror && String(r['公開'] || '').trim() !== '公開') return;
        map[String(r['キー']).trim()] = r;
      });
      cache = map;
      listeners.forEach((fn) => { try { fn(); } catch {} });
      return map;
    })
    .catch(() => ({}));
  return inflight;
}

/** いま読み込んである上書き */
export const overrides = () => cache || {};

/** 文言の上書き。無ければ null（＝元の文章を使う） */
export function ovText(key: string, lang: Lang): string | null {
  const r = overrides()[key];
  if (!r) return null;
  const v = (lang === 'jp' ? r['日本語'] : r[lang.toUpperCase()]) || '';
  const jp = (r['日本語'] || '').trim();
  const t = String(v).trim() || jp;
  return t || null;
}

/** 写真の上書き */
export function ovImage(key: string): string | null {
  const r = overrides()[key];
  const v = (r && (r['写真'] || r['日本語'])) || '';
  return String(v).trim() || null;
}

/** リンクの上書き */
export function ovLink(key: string, lang: Lang): { text: string; href: string } | null {
  const r = overrides()[key];
  if (!r) return null;
  const href = String(r['リンク先'] || '').trim();
  if (!href) return null;
  const t = String(
    (lang === 'jp' ? r['リンク文字(日本語)'] : r['リンク文字' + lang.toUpperCase()]) ||
    r['リンク文字(日本語)'] || ''
  ).trim();
  return { text: t || href, href };
}

/** 編集モードかどうか。?edit=1 で入り、その端末では覚えます */
export function editMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isMirror()) return false;          // 本番では編集できません
  try {
    const q = new URLSearchParams(window.location.search).get('edit');
    if (q === '1') { sessionStorage.setItem('sumura-edit', '1'); return true; }
    if (q === '0') { sessionStorage.removeItem('sumura-edit'); return false; }
    return sessionStorage.getItem('sumura-edit') === '1';
  } catch { return false; }
}
