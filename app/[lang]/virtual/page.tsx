import { metaFor } from '@/lib/siteMeta';
import { OTHER_LANGS } from '@/lib/slug';
import { VirtualPage } from '@/components/pages/VirtualPage';

const TITLE: Record<string, string> = {
  en: 'Virtual shop', fr: 'Boutique virtuelle', zh: '虚拟店铺', ko: '버추얼 매장',
};

export const dynamicParams = false;
export function generateStaticParams() { return OTHER_LANGS.map((l) => ({ lang: l })); }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return metaFor('/virtual', (lang as any) || 'jp');
}

export default function Page() { return <VirtualPage />; }
