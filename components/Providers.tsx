'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
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

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname() || '';
  const isMukashi = /\/mukashi\/?$/.test(path);
  const [lang, setLangState] = useState<Lang>('jp');
  const [era, setEraState] = useState<Era>(DEFAULT_ERA);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem('lang');
      if (l && (LANGS as string[]).includes(l)) setLangState(l as Lang);
    } catch {}
    setEraState(readEra());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-era', isMukashi ? 'mukashi' : era);
  }, [era, isMukashi, mounted]);

  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem('lang', l); } catch {}
    setLangState(l);
  }, []);

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
