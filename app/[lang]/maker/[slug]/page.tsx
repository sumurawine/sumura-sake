import { MakerPage } from '@/components/pages/MakerPage';
import { allItems, wineI18n } from '@/lib/wineData';
import { makerIndex, makerList } from '@/lib/makerView';
import { makerLd } from '@/lib/wineView';
import { makerMeta } from '@/lib/wineMeta';
import { OTHER_LANGS } from '@/lib/slug';
import type { Lang } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = Object.keys(makerIndex(allItems(), wineI18n()));
  const out: Array<{ lang: string; slug: string }> = [];
  OTHER_LANGS.forEach((l) => slugs.forEach((slug) => out.push({ lang: l, slug })));
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const items = allItems(); const i18n = wineI18n();
  const jp = makerIndex(items, i18n)[slug];
  if (!jp) return {};
  const { shown, list } = makerList(jp, items, i18n, lang as Lang);
  return makerMeta(jp, shown, lang as Lang, slug, list.length);
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const L = lang as Lang;
  const items = allItems(); const i18n = wineI18n();
  const jp = makerIndex(items, i18n)[slug];
  if (!jp) return null;
  const { shown, list } = makerList(jp, items, i18n, L);
  return (
    <>
      {makerLd(shown, slug, L, list).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <MakerPage shown={shown} list={list} lang={L} />
    </>
  );
}
