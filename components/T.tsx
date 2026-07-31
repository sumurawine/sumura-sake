'use client';

import React from 'react';
import { tr } from '@/lib/i18n';
import { decorate } from '@/lib/decor';
import { useSite } from './Providers';

type Kind = 'head' | 'sub' | 'btn' | 'headerSub' | 'plain';

type Props = {
  k: string;
  as?: keyof React.JSX.IntrinsicElements;
  kind?: Kind;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  [key: string]: any;
};

/** 翻訳された文字列（HTMLを含む）を描画します。HTML版の data-i18n と同じ挙動です。 */
export function T({ k, as = 'span', kind = 'plain', className, style, id, ...rest }: Props) {
  const { lang, eraView } = useSite();
  const html = decorate(tr(lang, k), eraView, lang, kind);
  const Tag = as as any;
  return (
    <Tag
      {...rest}
      id={id}
      className={className}
      style={style}
      data-i18n={k}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** 文字列としてだけ欲しいとき */
export function useT() {
  const { lang, eraView } = useSite();
  return (k: string, kind: Kind = 'plain') => decorate(tr(lang, k), eraView, lang, kind);
}
