'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';

const ITEMS = [1, 2, 3, 4] as const;

export function NewsPage() {
  return (
    <Shell>
      <div className="panel">
        <T k="nw-head" as="div" kind="head" className="pixhead" />
        <T k="nw-sub" as="p" kind="sub" className="sub" />
      </div>

      {ITEMS.map((i) => (
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
