'use client';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';

export function ThanksPage() {
  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        <T k="thx-head" as="div" kind="head" className="pixhead" />
        <T k="thx-body" as="p" />
        <img src={asset('/images/thanks.png')} alt="" />
        <p>
          <A href="/home">
            <T k="thx-back" as="span" kind="btn" className="btn" style={{ display: 'inline-block', marginTop: 8 }} />
          </A>
        </p>
      </div>
    </Shell>
  );
}
