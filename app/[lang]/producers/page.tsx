import { ProducersPage } from '@/components/pages/ProducersPage';
import { metaFor } from '@/lib/siteMeta';
import { OTHER_LANGS } from '@/lib/slug';
import type { Lang } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return OTHER_LANGS.map((l) => ({ lang: l })); }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return metaFor('/producers', lang as Lang);
}

export default function Page() { return <ProducersPage />; }
