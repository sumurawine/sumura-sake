'use client';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { useContent, pick, esc, linkOf } from '@/lib/content';
import { useSite } from '@/components/Providers';
import { MHome } from '@/components/modern/MHome';

export function HomePage() {
  const { eraView, lang } = useSite();
  const c = useContent();
  if (eraView === 'now') return <MHome />;
  return (
    <Shell>
      <div className="panel">
        <T k="home-welcome-head" as="div" kind="head" className="pixhead" />
        <div style={{ textAlign: 'center', margin: '10px 0 14px' }}>
          <img
            src={asset('/images/shop-sign.webp')}
            alt="すむら酒店 店舗看板"
            width={760}
            height={746}
            className="x-frame"
            style={{ width: '100%', maxWidth: 520, height: 'auto', padding: 4 }}
          />
          <T k="home-photo-cap" as="div" className="hint" style={{ marginTop: 4 }} />
        </div>
        <T k="home-p1" as="p" />
        <T k="home-p2" as="p" />
        <T k="home-p3" as="p" />
      </div>

      <div className="panel">
        <T k="home-hist-head" as="div" kind="head" className="pixhead" />
        <ul className="dots">
          {c.history.length ? (
            c.history.map((r, i) => {
              const link = linkOf(r, lang);
              return (
                <li key={i}>
                  <b>{r['日付'] || ''}</b>　{pick(r, lang, '本文(日本語)', lang.toUpperCase())}
                  {link ? <> <a href={link.href}>{link.text}</a></> : null}
                  {i === 0 ? <span className="new">NEW!</span> : null}
                </li>
              );
            })
          ) : (
            <>
              <T k="home-hist-1" as="li" />
              <T k="home-hist-2" as="li" />
              <T k="home-hist-3" as="li" />
            </>
          )}
        </ul>
      </div>

      <div className="panel">
        <T k="home-newsletter-head" as="div" kind="head" className="pixhead" />
        <T k="home-newsletter-body" as="p" />
      </div>

      <div className="panel" style={{ textAlign: 'center' }}>
        <img src={asset('/images/bottle.png')} alt="" />
        {'　'}
        {c.today.length
          ? <span dangerouslySetInnerHTML={{ __html: `本日の一本：<b>${pick(c.today[0], lang, '銘柄(日本語)', '銘柄' + lang.toUpperCase())}</b>` }} />
          : <T k="home-today" as="span" />}
        {'　'}
        <img src={asset('/images/bottle.png')} alt="" />
        <br />
        {c.today.length
          ? <span className="hint">— {pick(c.today[0], lang, '一言(日本語)', '一言' + lang.toUpperCase())} —</span>
          : <T k="home-today-desc" as="span" className="hint" />}
        <br />
        <a href="store.html">
          <T k="home-store-btn" as="span" kind="btn" className="btn" style={{ display: 'inline-block', marginTop: 10 }} />
        </a>
      </div>
    </Shell>
  );
}
