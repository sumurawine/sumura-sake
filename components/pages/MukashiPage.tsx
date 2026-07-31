'use client';
import { asset } from '@/lib/paths';
import { T } from '@/components/T';
import { A } from '@/components/A';

export function MukashiPage() {
  return (
    <div className="mk-wrap">
      <T k="mk-title" as="div" className="mk-title" />
      <div className="mk-en">Liquor Shop Sumura</div>

      <div className="mk-photo">
        <img src={asset('/images/showa30.webp')} alt="昭和30年頃のすむら酒店" width={900} height={693} />
      </div>
      <T k="mk-cap" as="div" className="mk-cap" />

      <div className="mk-rule" />

      <T k="mk-p1" as="p" />
      <T k="mk-p2" as="p" />

      <T k="mk-sig" as="div" className="mk-sig" />

      <A href="/home" className="mk-back"><T k="mk-back" as="span" /></A>
    </div>
  );
}
