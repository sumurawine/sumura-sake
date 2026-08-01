'use client';

import { useEffect, useMemo, useState } from 'react';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { A } from '@/components/A';
import { useSite } from '@/components/Providers';
import { isModern } from '@/lib/era';
import { stripDeco } from '@/lib/decor';
import { CATS, ORDER, type ProductData, type I18nData } from '@/lib/store';
import { PR_COPY, EXTRA } from '@/lib/producers';

type Row = { jp: string; latin: string; n: number };

export function ProducersPage() {
  const { lang, eraView } = useSite();
  const plain = isModern(eraView as any);
  const d = (s: string) => (plain ? stripDeco(s) : s);
  const c = PR_COPY[lang] || PR_COPY.jp;

  const [DATA, setDATA] = useState<ProductData | null>(null);
  const [I18N, setI18N] = useState<I18nData | null>(null);

  useEffect(() => {
    const v = '?v=' + new Date().toISOString().slice(0, 13);
    Promise.all([
      fetch(asset('/products.json') + v).then((r) => r.json()),
      fetch(asset('/products.i18n.json') + v).then((r) => r.json()).catch(() => null),
    ])
      .then(([a, b]) => { setDATA(a); setI18N(b); })
      .catch(() => {});
  }, []);

  /** 産地ごとに、そこに一番多く商品のある生産者をまとめます */
  const groups = useMemo(() => {
    const count: Record<string, number> = {};
    const where: Record<string, Record<string, number>> = {};
    for (const it of DATA?.items || []) {
      const p = it.prod;
      if (!p) continue;
      count[p] = (count[p] || 0) + 1;
      (where[p] = where[p] || {})[it.cat] = (where[p]?.[it.cat] || 0) + 1;
    }
    const byCat: Record<string, Row[]> = {};
    for (const p of Object.keys(count)) {
      const cat = Object.entries(where[p]).sort((a, b) => b[1] - a[1])[0][0];
      const latin = I18N?.producers?.[p]?.en || '';
      (byCat[cat] = byCat[cat] || []).push({ jp: p, latin, n: count[p] });
    }
    // ストアに載せていない造り手も、同じ欄に並べます
    for (const e of EXTRA) {
      (byCat[e.cat] = byCat[e.cat] || []).push({ jp: e.jp, latin: e.latin, n: 0 });
    }
    return ORDER.filter((k) => byCat[k]).map((k) => ({
      cat: k,
      rows: byCat[k].sort((a, b) => b.n - a.n),
    }));
  }, [DATA, I18N]);

  return (
    <Shell>
      <div className="panel">
        <div className="pixhead">{d(c.head)}</div>
        <p className="sub">{d(c.sub)}</p>
        <p>{c.lead}</p>
      </div>

      <div className="panel">
        <div className="pixhead" style={{ fontSize: 18 }}>{d(c.listHead)}</div>
        <p>{c.listLead}</p>
        {groups.map((g) => (
          <div key={g.cat} className="pr-group">
            <h3 className="pr-region">{CATS[g.cat]?.[lang] || g.cat}</h3>
            <ul className="pr-list">
              {g.rows.map((r) => (
                <li key={r.jp}>
                  <A href={r.n ? `/store?prod=${encodeURIComponent(r.jp)}` : `/contact?item=${encodeURIComponent(r.jp)}`}>
                    <span className="pr-jp">{r.jp}</span>
                    {r.latin && r.latin !== r.jp ? <span className="pr-latin2">{r.latin}</span> : null}
                  </A>
                  {r.n ? <span className="pr-n">{r.n}{c.itemsUnit}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="panel" style={{ textAlign: 'center' }}>
        <div className="pixhead" style={{ fontSize: 18 }}>{d(c.askHead)}</div>
        <p>{c.askBody}</p>
        <A href="/contact" style={{ textDecoration: 'none' }}>
          <span className="btn">{d(c.askBtn)}</span>
        </A>
        {' '}
        <A href="/store" style={{ textDecoration: 'none' }}>
          <span className="btn">{d(c.storeBtn)}</span>
        </A>
      </div>
    </Shell>
  );
}
