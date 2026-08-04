'use client';

import { useEffect, useState } from 'react';
import { asset } from '@/lib/paths';

/** ホームの背景。読み進むほどに、店の写真が静かに移ろいます */
const SLIDES = [
  '/images/photos/shelf-row.jpg',
  '/images/shop-sign.webp',
  '/images/photos/cheval-blanc-1929.jpg',
  '/images/photos/meo-camuzet.jpg',
  '/images/photos/roch.jpg',
  '/images/photos/cros-parantoux.jpg',
  '/images/showa30.webp',
];

export function BgFlow() {
  const [on, setOn] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      const t = Math.min(0.999, h.scrollTop / max);
      setOn(Math.floor(t * SLIDES.length));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="mx-bgflow" aria-hidden>
      {SLIDES.map((s, i) => (
        <div key={s} className={`bgf${i === on ? ' is-on' : ''}`}
             style={{ backgroundImage: `url(${asset(s)})` }} />
      ))}
    </div>
  );
}
