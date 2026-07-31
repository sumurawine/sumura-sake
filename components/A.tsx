'use client';
import Link from 'next/link';
import { useSite } from './Providers';
import { Gif } from './Deco';

/** サイト内リンク。2005年代では問い合わせリンクに封筒GIFが付きます。 */
export function A({ href, children, className, style, ...rest }: {
  href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; [k: string]: any;
}) {
  const { eraView } = useSite();
  const mail = eraView === '2005' && href.startsWith('/contact');
  return (
    <Link href={href} className={className} style={style} {...rest}>
      {mail ? <Gif name="mail.gif" w={28} h={20} style={{ verticalAlign: 'middle', marginRight: 4 }} /> : null}
      {children}
    </Link>
  );
}
