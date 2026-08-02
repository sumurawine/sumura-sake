import type { Lang } from './i18n';
import type { Item, I18nData } from './store';
import { slugMap, prodSlug } from './slug';
import { localized, type Near } from './wineText';

/** 生産者の綴り → 生産者名（日本語） */
export function makerIndex(items: Item[], i18n: I18nData | null): Record<string, string> {
  const out: Record<string, string> = {};
  items.forEach((it) => { if (it.prod) out[prodSlug(it.prod, i18n)] = it.prod; });
  return out;
}

export function makerList(
  jpName: string, items: Item[], i18n: I18nData | null, lang: Lang,
): { shown: string; list: Near[] } {
  const map = slugMap(items, i18n);
  const mine = items.filter((x) => x.prod === jpName);
  const shown = mine.length ? localized(mine[0], i18n, lang).producer || jpName : jpName;
  const list: Near[] = mine.map((x) => {
    const L = localized(x, i18n, lang);
    return { id: x.id, slug: map[x.id], name: L.name, price: x.price, img: x.img };
  });
  return { shown, list };
}
