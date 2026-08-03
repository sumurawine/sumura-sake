import type { Item, I18nData } from './store';
import type { Lang } from './i18n';

/** 銘柄名から、住所に使える綴りをこしらえます */
export function slugify(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // 発音記号を落とします
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 84)
    .replace(/-+$/g, '');
}

/** 綴りのもとにする名前。欧文があればそちらを使います */
export function latinName(it: Item, i18n: I18nData | null): string {
  const en = i18n?.items?.[it.id]?.name?.en;
  const fr = i18n?.items?.[it.id]?.name?.fr;
  return (en || fr || it.name || '').trim();
}

/**
 * 商品番号 → 住所の綴り。
 * 同じ綴りが重なったときだけ、末尾に番号を添えて分けます。
 */
export function slugMap(items: Item[], i18n: I18nData | null): Record<string, string> {
  const seen: Record<string, number> = {};
  const out: Record<string, string> = {};
  const sorted = items.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  for (const it of sorted) {
    let base = slugify(latinName(it, i18n));
    if (!base) base = 'wine';
    const n = (seen[base] = (seen[base] || 0) + 1);
    out[it.id] = n === 1 ? base : `${base}-${it.id}`;
  }
  return out;
}

/** 綴り → 商品番号 */
export function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id in map) out[map[id]] = id;
  return out;
}

/** 生産者の綴り */
export function prodSlug(name: string, i18n: I18nData | null): string {
  const en = i18n?.producers?.[name]?.en;
  return slugify(en || name) || 'producer';
}

export const OTHER_LANGS: Lang[] = ['en', 'fr', 'zh', 'ko'];

/** ページの住所。日本語は根の下、ほかは言語の名を挟みます */
export const pre = (lang: Lang) => (lang === 'jp' ? '' : '/' + lang);
export const winePath = (slug: string, lang: Lang = 'jp') => `${pre(lang)}/wine/${slug}`;
/** 楽天うれるのカート側（買える場所）の住所 */
export const buyUrl = (id: string) =>
  /^[0-9]+$/.test(String(id)) ? `https://sumura-sake.com/item-detail/${id}` : '';

export const makerPath = (slug: string, lang: Lang = 'jp') => `${pre(lang)}/maker/${slug}`;
