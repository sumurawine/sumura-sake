'use client';
import Link from 'next/link';
import { useSite } from './Providers';
import { Gif } from './Deco';

/**
 * サイト内リンク。
 *
 * この site は静的に書き出しているため、画面を再読み込みせずに中身だけ
 * 差し替える移り方（Next の router）では、次の頁の中身を小さなファイルとして
 * 取りに行きます。これが間に合わないと、押しても何も起こらないまま黙って
 * 終わってしまうことがありました。
 * そこで、押されたときは素直に頁を読み込ませます。確実に開きます。
 */
export function A({ href, children, className, style, ...rest }: {
  href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; [k: string]: any;
}) {
  const { eraView } = useSite();
  const mail = eraView === '2005' && href.startsWith('/contact');
  const { onClick, ...pass } = rest as { onClick?: (e: any) => void; [k: string]: any };
  const go = (e: any) => {
    if (typeof onClick === 'function') onClick(e);
    /* 別の窓で開く・新しいタブで開く、といった操作はそのまま通します */
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = e.currentTarget as HTMLAnchorElement;
    if (el && el.target && el.target !== '_self') return;
    if (el && el.href) { e.preventDefault(); window.location.assign(el.href); }
  };
  return (
    <Link href={href} className={className} style={style} onClick={go} {...pass}>
      {mail ? <Gif name="mail.gif" w={28} h={20} style={{ verticalAlign: 'middle', marginRight: 4 }} /> : null}
      {children}
    </Link>
  );
}
