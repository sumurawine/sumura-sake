import { Providers } from '@/components/Providers';
import { OTHER_LANGS } from '@/lib/slug';
import type { Lang } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return OTHER_LANGS.map((l) => ({ lang: l })); }

export default async function LangLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  return <Providers initialLang={lang as Lang}>{children}</Providers>;
}
