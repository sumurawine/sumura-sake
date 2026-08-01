'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { useSite } from '@/components/Providers';
import { useContent, pick, linkOf } from '@/lib/content';

const ITEMS = [1, 2, 3, 4] as const;

export function NewsPage() {
  const { lang } = useSite();
  const { news } = useContent();
  const L = lang.toUpperCase();
  return (
    <Shell>
      <div className="panel">
        <T k="nw-head" as="div" kind="head" className="pixhead" />
        <T k="nw-sub" as="p" kind="sub" className="sub" />
      </div>

      {news.length
        ? news.map((r, i) => {
            const link = linkOf(r, lang);
            return (
              <div className="panel" key={i}>
                <div className="x-pink" style={{ fontSize: 14 }}>{r['日付']}</div>
                <div className="pixhead" style={{ fontSize: 18 }}>
                  {pick(r, lang, '題名(日本語)', '題名' + L)}
                  {i === 0 ? <span className="new blink">NEW</span> : null}
                </div>
                <p>{pick(r, lang, '本文(日本語)', '本文' + L)}</p>
                {link ? <p><a href={link.href}>{link.text}</a></p> : null}
              </div>
            );
          })
        : ITEMS.map((i) => (
            <div className="panel" key={i}>
              <T k={`nw-d${i}`} as="div" className="x-pink" style={{ fontSize: 14 }} />
              <T k={`nw-t${i}`} as="div" kind="head" className="pixhead" style={{ fontSize: 18 }} />
              <T k={`nw-b${i}`} as="p" />
            </div>
          ))}

      <div className="panel" style={{ textAlign: 'center' }}>
        <T k="nw-foot" as="p" className="hint" />
        <A href="/contact" style={{ textDecoration: 'none' }}>
          <T k="nw-btn" as="span" kind="btn" className="btn" />
        </A>
      </div>
    </Shell>
  );
}
