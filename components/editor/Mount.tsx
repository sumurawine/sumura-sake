'use client';

import { useEffect, useState } from 'react';
import { setOverrideLookup } from '@/lib/i18n';
import { loadOverrides, onOverrides, ovText, ovImage, editMode, overrides } from '@/lib/overrides';
import { Editor, imageKey } from './Editor';
import { NewProduct } from './NewProduct';

/** 上書きを読み込み、編集モードなら道具立てを出します */
export function EditorMount() {
  const [, bump] = useState(0);

  useEffect(() => {
    setOverrideLookup(ovText);
    const off = onOverrides(() => bump((n) => n + 1));
    loadOverrides();
    return off;
  }, []);

  /** 差し替えた写真を、ページ中のすべての img に当てます */
  useEffect(() => {
    const apply = () => {
      if (!Object.keys(overrides()).length) return;
      document.querySelectorAll('img').forEach((img) => {
        const el = img as HTMLImageElement;
        if (el.dataset.ovDone === '1') return;
        const k = imageKey(el);
        if (!k) return;
        const url = ovImage(k);
        if (url && el.src !== url) { el.dataset.ovOrig = el.src; el.src = url; }
        el.dataset.ovDone = '1';
      });
    };
    apply();
    const off = onOverrides(apply);
    const mo = new MutationObserver(() => apply());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { off(); mo.disconnect(); };
  }, []);

  const [on, setOn] = useState(false);
  useEffect(() => { setOn(editMode()); }, []);

  /* オンラインストアのページだけ、出品ボタンも出します */
  const store = typeof window !== 'undefined' && /store(\.html)?$/.test(window.location.pathname.replace(/\/$/, ''));

  if (!on) return null;
  return (
    <>
      <Editor />
      {store ? <NewProduct /> : null}
    </>
  );
}
