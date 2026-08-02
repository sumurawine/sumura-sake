import { WinesIndex } from '@/components/pages/WinesIndex';
import { allItems, wineI18n } from '@/lib/wineData';
import { indexView } from '@/lib/indexView';
import { indexMeta } from '@/lib/wineMeta';

export const metadata = indexMeta('jp');

export default function Page() {
  const { groups, makers } = indexView(allItems(), wineI18n(), 'jp');
  return <WinesIndex groups={groups} makers={makers} lang="jp" />;
}
