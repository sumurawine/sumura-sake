'use client';

/**
 * ページに出ている文字を、そのまま書き換えられるようにします。
 * 実際の処理は /ov.js（<head> で読み込む小さな仕掛け）に置いてあります。
 * そちらは描かれる前から動くので、直した文章が一瞬だけ元に戻る、ということが起きません。
 */

import type { Lang } from './i18n';
import type { OvRow } from './overrides';

type Ov = {
  keyOf: (el: Element) => string;
  isTarget: (el: Element) => boolean;
  editable: (el: Element) => boolean;
  apply: (root?: Element) => void;
  soon: () => void;
  setRows: (rows: OvRow[]) => void;
  setLang: (l: Lang) => void;
  baseText: (el: Element) => string;
  rows: () => Record<string, OvRow>;
};

function ov(): Ov | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SumuraOv || null;
}

export function keyOf(el: Element): string {
  const o = ov();
  return o ? o.keyOf(el) : '';
}

export function isTarget(el: Element): boolean {
  const o = ov();
  return o ? o.isTarget(el) : false;
}

export function baseText(el: Element): string {
  const o = ov();
  return o ? o.baseText(el) : (el.textContent || '');
}

/** 読み込んである上書きを、ページ全体に当てます */
export function applyOverrides(lang: Lang): void {
  const o = ov();
  if (o) o.setLang(lang);
}

/** 取り込んだ内容を仕掛けへ渡します */
export function pushRows(rows: OvRow[]): void {
  const o = ov();
  if (o) o.setRows(rows);
}

/** 見張りは /ov.js が立てているので、言語が変わったときだけ当て直します */
export function watchOverrides(getLang: () => Lang): () => void {
  const o = ov();
  if (o) o.setLang(getLang());
  return () => {};
}
