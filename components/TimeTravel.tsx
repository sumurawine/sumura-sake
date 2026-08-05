'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from './Providers';
import type { Lang } from '@/lib/i18n';
import type { Era } from '@/lib/era';

const L: Record<Lang, { t: string; a: string; b: string; c: string; d: string; e: string }> = {
  jp: { t: '時間旅行', a: '2020年代（現代）', b: '2010年代', c: '2000年代', d: '1990年代', e: '昔日' },
  en: { t: 'TIME TRAVEL', a: 'The 2020s (now)', b: 'The 2010s', c: 'The 2000s', d: 'The 1990s', e: 'The old days' },
  fr: { t: 'VOYAGE TEMPOREL', a: 'Les 2020s (aujourd’hui)', b: 'Les 2010s', c: 'Les 2000s', d: 'Les 1990s', e: 'Autrefois' },
  zh: { t: '时光旅行', a: '2020s（现在）', b: '2010s', c: '2000s', d: '1990s', e: '昔日' },
  ko: { t: '시간 여행', a: '2020s(현재)', b: '2010s', c: '2000s', d: '1990s', e: '옛날' },
};

export function TimeTravel() {
  const { lang, era, setEra, isMukashi: mukashi } = useSite();
  const router = useRouter();
  const [closed, setClosed] = useState(false);
  const t = L[lang];

  // 2020年代の画面では、はじめは畳んでおきます（本文の邪魔をしないように）
  useEffect(() => {
    const narrow = window.matchMedia && window.matchMedia('(max-width:900px)').matches;
    if (narrow || era === 'now') setClosed(true);
  }, [era]);

  /* 下へ読み進めたら、ひとりでに畳みます。本文の邪魔をしないように */
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 4 && y > 90) setClosed(true);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items: Array<[string, string]> = [
    ['now', t.a], ['2010', t.b], ['2005', t.c], ['1995', t.d], ['mukashi', t.e],
  ];
  const cur = mukashi ? 'mukashi' : era;

  const go = (key: string) => {
    if (key === 'mukashi') { router.push('/mukashi'); return; }
    setEra(key as Era);
    if (mukashi) router.push('/home');
  };

  return (
    <div id="timewarp" className={closed ? 'tw-closed' : undefined}
         onClick={closed ? () => setClosed(false) : undefined}>
      <button type="button" className="tw-toggle" aria-label="toggle" onClick={() => setClosed((v) => !v)}>
        {closed ? '+' : '−'}
      </button>
      <span className="tw-t" onClick={() => setClosed((v) => !v)}>⏳ {t.t}</span>
      <div className="tw-body">
        {items.map(([key, label]) => (
          <button key={key} type="button" data-era={key} className={key === cur ? 'on' : undefined} onClick={() => go(key)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
