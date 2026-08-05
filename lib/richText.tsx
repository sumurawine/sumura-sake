'use client';

import React from 'react';
import Link from 'next/link';
import type { Lang } from './i18n';
import { pre } from './slug';

/* 本文の中のリンクの書き方は [見せる文字](/行き先) です。
   更新画面の「リンクを入れる」から入りますので、
   書き手がこの書き方を覚える必要はありません。 */
const LINK = /\[([^\]\n]{1,80})\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;

/** サイトの中の行き先には、いまの言語の前置きを添えます */
function href(to: string, lang: Lang): string {
  if (/^https?:\/\//.test(to)) return to;
  const p = pre(lang);
  return p && to.indexOf(p + '/') !== 0 ? p + to : to;
}

/** 本文を、リンクだけ生かして描きます */
export function richText(text: string, lang: Lang): React.ReactNode[] {
  const src = String(text || '');
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null, n = 0;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const to = href(m[2], lang);
    out.push(
      /^https?:/.test(to)
        ? <a key={'l' + n++} href={to} target="_blank" rel="noopener noreferrer" className="bx-link">{m[1]}</a>
        : <Link key={'l' + n++} href={to} className="bx-link">{m[1]}</Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push(src.slice(last));
  return out.length ? out : [src];
}

/** 一覧などで、リンクの印だけ取り去って文字にします */
export function plainText(text: string): string {
  return String(text || '').replace(LINK, '$1');
}
