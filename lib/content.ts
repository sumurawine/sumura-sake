'use client';

import { useEffect, useState } from 'react';
import { SUMURA_API, apiReady } from './api';
import type { Lang } from './i18n';

export type Row = Record<string, string>;
export type SiteContent = {
  history: Row[]; today: Row[]; news: Row[]; blog: Row[]; items: Row[];
};

const EMPTY: SiteContent = { history: [], today: [], news: [], blog: [], items: [] };

let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

/** 管理画面（スプレッドシート）の中身を取りにいきます。失敗しても表側は元のまま。 */
export function loadContent(): Promise<SiteContent> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  if (!apiReady()) return Promise.resolve(EMPTY);
  const v = '?action=content&v=' + new Date().toISOString().slice(0, 13);
  inflight = fetch(SUMURA_API + v, { redirect: 'follow' })
    .then((r) => r.json())
    .then((j) => {
      const c: SiteContent = {
        history: j?.history || [], today: j?.today || [], news: j?.news || [],
        blog: j?.blog || [], items: j?.items || [],
      };
      cache = c;
      return c;
    })
    .catch(() => EMPTY);
  return inflight;
}

export function useContent(): SiteContent {
  const [c, setC] = useState<SiteContent>(cache || EMPTY);
  useEffect(() => { let on = true; loadContent().then((x) => { if (on) setC(x); }); return () => { on = false; }; }, []);
  return c;
}

/**
 * 管理画面から来た文字は、そのまま画面に出します。
 * 昔の書き方でHTMLが混ざっていても、記号として表示せず取り除きます。
 */
function plain(s: string): string {
  return String(s || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** 日本語を基本に、その言語の欄が埋まっていればそちらを使います */
export function pick(row: Row, lang: Lang, jpKey: string, sufKey?: string): string {
  if (lang === 'jp') return plain(row[jpKey]);
  const k = sufKey || jpKey.replace(/\(日本語\)$/, '') + lang.toUpperCase();
  const v = plain(row[k]);
  return v || plain(row[jpKey]);
}

/** 文章をそのまま安全に出せるようにします（記号がHTMLとして働かないように） */
export function esc(s: string): string {
  return String(s || '').replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c]);
}

/** 行から「リンクの文字」と「リンク先」を取り出します */
export function linkOf(row: Row, lang: Lang): { text: string; href: string } | null {
  const href = (row['リンク先'] || '').trim();
  if (!href) return null;
  const text = pick(row, lang, 'リンクの文字(日本語)', 'リンクの文字' + lang.toUpperCase());
  return { href, text: text || href };
}

/** 写真のURL。古い「写真URL」という見出しにも対応します */
export function photoOf(row: Row): string {
  return (row['写真'] || row['写真URL'] || '').trim();
}
