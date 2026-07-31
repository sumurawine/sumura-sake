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
    </Shell>
  );
}
