'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LANGS, type Lang } from '@/lib/i18n';
import { readEra, DEFAULT_ERA, type Era } from '@/lib/era';

type EraLike = Era | 'mukashi';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  era: Era;
  eraView: EraLike;
  setEra: (e: Era) => void;
  mounted: boolean;
  isMukashi: boolean;
};

const SiteCtx = createContext<Ctx>({
  lang: 'jp', setLang: () => {}, era: DEFAULT_ERA, eraView: DEFAULT_ERA, setEra: () => {}, mounted: false, isMukashi: false,
});

export const useSite = () => useContext(SiteCtx);

export function Providers(
  { children, initialLang }: { children: React.ReactNode; initialLang?: Lang },
) {
  const router = useRouter();
  const path = usePathname() || '';
  const isMukashi = /\/mukashi\/?$/.test(path);
  const [lang, setLangState] = useState<Lang>(initialLang || 'jp');
  const [era, setEraState] = useState<Era>(DEFAULT_ERA);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 言語ごとの住所にいるときは、その言語のまま動かしません
    if (initialLang) { setEraState(readEra()); setMounted(true); return; }
    let chosen: string = 'jp';
    try {
      // ?lang=en のように指定があればそちらを優先します（検索エンジン向けの言語別URL）
      const q = new URLSearchParams(window.location.search).get('lang');
      if (q && (LANGS as string[]).includes(q)) {
        chosen = q; setLangState(q as Lang);
        try { localStorage.setItem('lang', q); } catch {}
      } else {
        const l = localStorage.getItem('lang');
        if (l && (LANGS as string[]).includes(l)) { chosen = l; setLangState(l as Lang); }
      }
    } catch {}
    // 言語版のある頁なら、選ばれている言語の住所へそっと移ります
    const p0 = (path || '/').replace(/\/$/, '') || '/';
    const HAS_LANG = /^\/(wine|maker)\//.test(p0)
      || ['/wines', '/home', '/store', '/producers', '/about', '/access',
          '/news', '/blog', '/legal', '/contact', '/virtual', '/secret'].indexOf(p0) >= 0;
    if (chosen !== 'jp' && HAS_LANG) {
      const sp = new URLSearchParams(window.location.search); sp.delete('lang');
      const qs = sp.toString();
      router.replace('/' + chosen + p0 + (qs ? '?' + qs : ''));
    }
    setEraState(readEra());
    setMounted(true);
  }, []);

  /** 言語版の住所を先に読み込んでおき、切り替えを一瞬にします */
  useEffect(() => {
    if (!mounted) return;
    const bare = (path.replace(/^\/(en|fr|zh|ko)(?=\/|$)/, '') || '/').replace(/\/$/, '') || '/';
    const HAS = /^\/(wine|maker)\//.test(bare)
      || ['/wines', '/home', '/store', '/producers', '/about', '/access',
          '/news', '/blog', '/legal', '/contact', '/virtual', '/secret'].indexOf(bare) >= 0;
    if (!HAS) return;
    try {
      (['jp', 'en', 'fr', 'zh', 'ko'] as Lang[]).forEach((l) => {
        if (l === lang) return;
        router.prefetch((l === 'jp' ? '' : '/' + l) + bare);
      });
    } catch { /* 先読みは、できるときだけで構いません */ }
  }, [path, lang, mounted, router]);

  /** 表示中の言語を <html lang> に反映します */
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('lang', lang === 'jp' ? 'ja' : lang);
  }, [lang, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-era', isMukashi ? 'mukashi' : era);
  }, [era, isMukashi, mounted]);

  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem('lang', l); } catch {}
    if (initialLang) {
      // 言語ごとの住所があるページでは、住所ごと移ります
      const bare = (path.replace(/^\/(en|fr|zh|ko)(?=\/|$)/, '') || '/');
      const qs2 = typeof window !== 'undefined' ? window.location.search : '';
      router.push((l === 'jp' ? '' : '/' + l) + bare + qs2);
      return;
    }
    // 日本語の住所にいても、その頁に言語版があるなら住所ごと移ります
    const p0 = (path || '/').replace(/\/$/, '') || '/';
    const HAS_LANG = /^\/(wine|maker)\//.test(p0)
      || ['/wines', '/home', '/store', '/producers', '/about', '/access',
          '/news', '/blog', '/legal', '/contact', '/virtual', '/secret'].indexOf(p0) >= 0;
    if (l !== 'jp' && HAS_LANG) {
      const qs = typeof window !== 'undefined' ? window.location.search : '';
      router.push('/' + l + p0 + qs); return;
    }
    setLangState(l);
  }, [initialLang, path, router]);

  const setEra = useCallback((e: Era) => {
    try { localStorage.setItem('era', e); } catch {}
    setEraState(e);
  }, []);

  const eraView: EraLike = isMukashi ? 'mukashi' : era;

  return (
    <SiteCtx.Provider value={{ lang, setLang, era, eraView, setEra, mounted, isMukashi }}>
      {children}
    </SiteCtx.Provider>
  );
}
