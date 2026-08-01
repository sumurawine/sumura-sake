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

/** 日本語を基本に、その言語の欄が埋まっていればそちらを使います */
export function pick(row: Row, lang: Lang, jpKey: string, sufKey?: string): string {
  if (lang === 'jp') return (row[jpKey] || '').trim();
  const k = sufKey || jpKey.replace(/\(日本語\)$/, '') + lang.toUpperCase();
  const v = (row[k] || '').trim();
  return v || (row[jpKey] || '').trim();
}
