import type { Lang } from './i18n';
import { CATS, dkey, type Item, type I18nData } from './store';

export type Near = { id: string; slug: string; name: string; price: string; img: string };

export type WineView = {
  item: Item;
  slug: string;
  name: string;
  desc: string;
  producer: string;
  producerSlug: string;
  region: string;
  ap: string;
  vintage: string;
  related: Near[];
  nearby: Near[];
};

export function catName(cat: string, lang: Lang): string {
  const c = CATS[cat];
  return (c && (c[lang] || c.jp)) || '';
}

export function pickLang(m: Record<string, string> | undefined, lang: Lang, jp: string): string {
  if (lang === 'jp') return jp;
  return (m && m[lang]) || jp;
}

/** 銘柄名のなかの年号を、ヴィンテージとして拾います */
export function vintageOf(name: string): string {
  const m = String(name || '').match(/(1[89]\d{2}|20\d{2})/);
  return m ? m[1] : '';
}

export function localized(it: Item, i18n: I18nData | null, lang: Lang) {
  const name = pickLang(i18n?.items?.[it.id]?.name, lang, it.name);
  const desc = it.desc ? pickLang(i18n?.descs?.[dkey(it.desc)], lang, it.desc) : '';
  const producer = it.prod ? pickLang(i18n?.producers?.[it.prod], lang, it.prod) : '';
  const ap = it.ap ? pickLang(i18n?.aps?.[it.ap], lang, it.ap) : '';
  return { name, desc, producer, ap };
}
