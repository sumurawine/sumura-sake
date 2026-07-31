'use client';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';

export function HomePage() {
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
          <T k="home-hist-1" as="li" />
          <T k="home-hist-2" as="li" />
          <T k="home-hist-3" as="li" />
        </ul>
      </div>

      <div className="panel">
        <T k="home-newsletter-head" as="div" kind="head" className="pixhead" />
        <T k="home-newsletter-body" as="p" />
      </div>

      <div className="panel" style={{ textAlign: 'center' }}>
        <img src={asset('/images/bottle.png')} alt="" />
        {'　'}
        <T k="home-today" as="span" />
        {'　'}
        <img src={asset('/images/bottle.png')} alt="" />
        <br />
        <T k="home-today-desc" as="span" className="hint" />
        <br />
        <a href="store.html">
          <T k="home-store-btn" as="span" kind="btn" className="btn" style={{ display: 'inline-block', marginTop: 10 }} />
        </a>
      </div>
    </Shell>
  );
}
