import { WinesIndex } from '@/components/pages/WinesIndex';
import { allItems, wineI18n } from '@/lib/wineData';
import { indexView } from '@/lib/indexView';
import { indexMeta } from '@/lib/wineMeta';
import { OTHER_LANGS } from '@/lib/slug';
import type { Lang } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return OTHER_LANGS.map((l) => ({ lang: l })); }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return indexMeta(lang as Lang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const L = lang as Lang;
  const { groups, makers } = indexView(allItems(), wineI18n(), L);
  return <WinesIndex groups={groups} makers={makers} lang={L} />;
}
