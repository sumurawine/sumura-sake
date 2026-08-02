import { WinePage } from '@/components/pages/WinePage';
import { allItems, wineI18n } from '@/lib/wineData';
import { slugMap } from '@/lib/slug';
import { buildView, wineLd } from '@/lib/wineView';
import { wineMeta } from '@/lib/wineMeta';

export const dynamicParams = false;

export function generateStaticParams() {
  const items = allItems();
  const map = slugMap(items, wineI18n());
  return items.map((it) => ({ slug: map[it.id] }));
}

function find(slug: string) {
  const items = allItems();
  const i18n = wineI18n();
  const map = slugMap(items, i18n);
  const id = Object.keys(map).find((k) => map[k] === slug);
  const it = items.find((x) => x.id === id);
  return { items, i18n, it };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { i18n, it } = find(slug);
  return it ? wineMeta(it, i18n, 'jp', slug) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { items, i18n, it } = find(slug);
  if (!it) return null;
  const v = buildView(it, items, i18n, 'jp');
  return (
    <>
      {wineLd(v, 'jp').map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <WinePage v={v} lang="jp" />
    </>
  );
}
