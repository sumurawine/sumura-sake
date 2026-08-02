import type { Lang } from './i18n';
import type { Item, I18nData } from './store';
import { ORDER } from './store';
import { slugMap, prodSlug } from './slug';
import { catName, localized } from './wineText';
import type { Group, MakerRow } from '@/components/pages/WinesIndex';

export function indexView(items: Item[], i18n: I18nData | null, lang: Lang) {
  const map = slugMap(items, i18n);
  const groups: Group[] = [];
  for (const key of ORDER) {
    const list = items.filter((x) => x.cat === key).map((x) => ({
      slug: map[x.id],
      name: localized(x, i18n, lang).name,
      out: String(x.stock || '0') === '0',
    })).sort((a, b) => a.name.localeCompare(b.name));
    if (list.length) groups.push({ key, label: catName(key, lang), list });
  }
  const seen: Record<string, MakerRow> = {};
  items.forEach((x) => {
    if (!x.prod) return;
    const slug = prodSlug(x.prod, i18n);
    const name = localized(x, i18n, lang).producer || x.prod;
    if (!seen[slug]) seen[slug] = { slug, name, n: 0 };
    seen[slug].n++;
  });
  const makers = Object.values(seen).sort((a, b) => a.name.localeCompare(b.name));
  return { groups, makers };
}
