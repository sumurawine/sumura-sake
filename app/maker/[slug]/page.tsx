import { MakerPage } from '@/components/pages/MakerPage';
import { allItems, wineI18n } from '@/lib/wineData';
import { makerIndex, makerList } from '@/lib/makerView';
import { makerLd } from '@/lib/wineView';
import { makerMeta } from '@/lib/wineMeta';
import { makerAbout, paras } from '@/lib/makerText';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(makerIndex(allItems(), wineI18n())).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = allItems(); const i18n = wineI18n();
  const jp = makerIndex(items, i18n)[slug];
  if (!jp) return {};
  const { shown, list } = makerList(jp, items, i18n, 'jp');
  return makerMeta(jp, shown, 'jp', slug, list.length, makerAbout(jp, 'jp'));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = allItems(); const i18n = wineI18n();
  const jp = makerIndex(items, i18n)[slug];
  if (!jp) return null;
  const { shown, list } = makerList(jp, items, i18n, 'jp');
  return (
    <>
      {makerLd(shown, slug, 'jp', list).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <MakerPage shown={shown} list={list} lang="jp" about={paras(makerAbout(jp, 'jp'))} />
    </>
  );
}
