import { WinePage } from '@/components/pages/WinePage';
import { allItems, wineI18n } from '@/lib/wineData';
import { slugMap, OTHER_LANGS } from '@/lib/slug';
import { buildView, wineLd } from '@/lib/wineView';
import { wineMeta } from '@/lib/wineMeta';
import type { Lang } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  const items = allItems();
  const map = slugMap(items, wineI18n());
  const out: Array<{ lang: string; slug: string }> = [];
  OTHER_LANGS.forEach((l) => items.forEach((it) => out.push({ lang: l, slug: map[it.id] })));
  return out;
}

function find(slug: string) {
  const items = allItems();
  const i18n = wineI18n();
  const map = slugMap(items, i18n);
  const id = Object.keys(map).find((k) => map[k] === slug);
  const it = items.find((x) => x.id === id);
  return { items, i18n, it };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const { i18n, it } = find(slug);
  return it ? wineMeta(it, i18n, lang as Lang, slug) : {};
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const L = lang as Lang;
  const { items, i18n, it } = find(slug);
  if (!it) return null;
  const v = buildView(it, items, i18n, L);
  return (
    <>
      {wineLd(v, L).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <WinePage v={v} lang={L} />
    </>
  );
}
