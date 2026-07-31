'use client';

import { useEffect } from 'react';
import { useSite } from './Providers';
import { stripDeco } from '@/lib/decor';
import { isModern } from '@/lib/era';
import type { Era } from '@/lib/era';

/**
 * 2010年代・2020年代では見出し・小見出し・ボタンから飾り文字（■◆▶ など）を落とします。
 * 現行HTML版の era.js の tidy() と同じ処理です。
 */
export function Tidy() {
  const { eraView, lang } = useSite();

  useEffect(() => {
    if (eraView === 'mukashi' || !isModern(eraView as Era)) return;
    const clean = (el: Element, mid?: boolean) => {
      if (el.querySelector('img,svg,canvas,input,select,button')) return;
      const s = el.innerHTML;
      const v = stripDeco(s, mid ? { mid: true } : undefined);
      if (v && v !== s) el.innerHTML = v;
    };
    document.querySelectorAll('.pixhead').forEach((e) => clean(e));
    document.querySelectorAll('.sub').forEach((e) => clean(e, true));
    document.querySelectorAll('.btn').forEach((e) => { if (e.id !== 'stock-btn') clean(e); });
  });

  // 時代・言語が変わったときにも走らせます
  useEffect(() => {}, [eraView, lang]);

  return null;
}
