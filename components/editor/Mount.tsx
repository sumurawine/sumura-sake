'use client';

import { useEffect, useState } from 'react';
import { setOverrideLookup } from '@/lib/i18n';
import { loadOverrides, onOverrides, ovText, ovImage, isMirror, overrides } from '@/lib/overrides';
import { applyOverrides, watchOverrides } from '@/lib/domtext';
import { useSite } from '@/components/Providers';
import { Editor, imageKey } from './Editor';

/** 上書きを読み込み、編集モードなら道具立てを出します */
export function EditorMount() {
  const { lang } = useSite();

  useEffect(() => {
    setOverrideLookup(ovText);
    loadOverrides();
  }, []);

  /** 文言の上書きを、ページの中身へ直に当てます */
  useEffect(() => {
    const stop = watchOverrides(() => lang);
    const off = onOverrides(() => applyOverrides(lang));
    applyOverrides(lang);
    return () => { stop(); off(); };
  }, [lang]);

  /** 差し替えた写真を、ページ中のすべての img に当てます */
  useEffect(() => {
    const apply = () => {
      if (!Object.keys(overrides()).length) return;
      document.querySelectorAll('img').forEach((img) => {
        const el = img as HTMLImageElement;
        const k = imageKey(el);
        if (!k) return;
        const url = ovImage(k);
        if (url && el.src !== url) { el.dataset.ovOrig = el.src; el.src = url; }
      });
    };
    apply();
    const off = onOverrides(apply);
    const mo = new MutationObserver(() => apply());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { off(); mo.disconnect(); };
  }, []);

  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isMirror()); }, []);

  return on ? <Editor /> : null;
}
