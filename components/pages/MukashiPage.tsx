'use client';

import { useEffect } from 'react';
import { asset } from '@/lib/paths';
import { T } from '@/components/T';
import { A } from '@/components/A';

export function MukashiPage() {
  /* ゆっくりと現れる写真。仕掛けが動かない環境では、はじめから見えています */
  useEffect(() => {
    /* 電源を入れた画面は、いつでも先頭から */
    try { window.history.scrollRestoration = 'manual'; } catch { /* しずかに */ }
    window.scrollTo(0, 0);
    const top = () => window.scrollTo(0, 0);
    const t1 = window.setTimeout(top, 60);
    const t2 = window.setTimeout(top, 400);

    const wrap = document.querySelector('.mk-wrap');
    if (!wrap) return () => { clearTimeout(t1); clearTimeout(t2); };
    wrap.classList.add('mk-ready');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.16 },
    );
    wrap.querySelectorAll('.mk-fx').forEach((el) => io.observe(el));
    return () => { clearTimeout(t1); clearTimeout(t2); io.disconnect(); };
  }, []);

  return (
    <div className="mk-wrap">
      <T k="mk-title" as="div" className="mk-title" />
      <div className="mk-en">Liquor Shop Sumura</div>

      <div className="mk-rule" />

      <figure className="mk-card mk-fx">
        <T k="mk-era1" as="span" className="mk-era" />
        <div className="mk-photo">
          <img src={asset('/images/showa30.webp')} alt="昭和30年頃のすむら酒店" width={900} height={693} />
        </div>
        <T k="mk-cap" as="figcaption" className="mk-cap" />
      </figure>

      <figure className="mk-card mk-r mk-fx">
        <T k="mk-era2" as="span" className="mk-era mk-era-r" />
        <div className="mk-photo">
          <img src={asset('/images/showa30-sofu.webp')} alt="二代目。上宇部に店を移した頃" width={718} height={1096} loading="lazy" />
        </div>
        <T k="mk-cap2" as="figcaption" className="mk-cap" />
      </figure>
      <T k="mk-s2" as="p" className="mk-story mk-fx" />

      <div className="mk-rule" />

      <T k="mk-p1" as="p" className="mk-fx" />
      <T k="mk-p2" as="p" className="mk-fx" />

      <T k="mk-sig" as="div" className="mk-sig" />

      <A href="/home" className="mk-back"><T k="mk-back" as="span" /></A>
    </div>
  );
}
