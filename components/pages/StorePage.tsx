'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { useSite } from '@/components/Providers';
import { isModern } from '@/lib/era';
import { stripDeco } from '@/lib/decor';
import { NewProduct } from '@/components/editor/NewProduct';
import {
  ORDER, CATS, u, catOf, apOf, prodOf, nameOf, descOf, notesOf, isOut,
  type Item, type ProductData, type I18nData,
} from '@/lib/store';
import { loadContent, type Row } from '@/lib/content';
import Link from 'next/link';
import { slugMap, winePath } from '@/lib/slug';

/** 管理画面（スプレッドシート）で足した商品を、いつもの商品一覧に混ぜます */
function extraItems(rows: Row[]): Item[] {
  const key = (jp: string) => {
    const t = (jp || '').trim();
    if (!t) return 'other';
    if (ORDER.indexOf(t) >= 0) return t;
    const hit = ORDER.find((k) => CATS[k] && CATS[k].jp === t);
    if (hit) return hit;
    const part = ORDER.find((k) => CATS[k] && (CATS[k].jp.indexOf(t) >= 0 || t.indexOf(CATS[k].jp) >= 0));
    return part || 'other';
  };
  return rows.map((r, i) => ({
    id: 'x' + (i + 1),
    name: (r['商品名(日本語)'] || '').trim(),
    price: (r['価格'] || '').trim(),
    img: (r['写真'] || r['写真URL'] || '').trim(),
    cat: key(r['産地']),
    prod: (r['生産者'] || '').trim() || undefined,
    stock: /^(0|無|なし|品切|在庫切れ|sold ?out)$/i.test((r['在庫'] || '').trim()) ? '0' : ((r['在庫'] || '').trim() || '1'),
    desc: (r['説明(日本語)'] || '').trim() || undefined,
    notes: [],
  })).filter((it) => it.name);
}

/** 管理画面で入れた外国語を、既存の翻訳表に足します */
function mergeI18n(i: I18nData | null, rows: Row[], list: Item[]): I18nData {
  const out: I18nData = { ...(i || {}) };
  out.items = { ...(out.items || {}) };
  out.descs = { ...(out.descs || {}) };
  rows.forEach((r, n) => {
    const it = list[n]; if (!it) return;
    const nm: Record<string, string> = {};
    const ds: Record<string, string> = {};
    (['en', 'fr', 'zh', 'ko'] as const).forEach((l) => {
      const L = l.toUpperCase();
      const a = (r['商品名' + L] || '').trim(); if (a) nm[l] = a;
      const b = (r['説明' + L] || '').trim(); if (b) ds[l] = b;
    });
    if (Object.keys(nm).length) out.items![it.id] = { name: nm };
    if (Object.keys(ds).length) out.descs![it.id] = ds;
  });
  return out;
}

type Mode = 'area' | 'prod';

export function StorePage() {
  const { lang, eraView } = useSite();
  const router = useRouter();
  const plain = isModern(eraView as any);
  /** 2010年代・2020年代では飾り文字を落とします */
  const dec = (s: string) => (plain ? stripDeco(s) : s);
  const brk = (s: string) => (plain ? s : `[${s}]`);
  const brk2 = (s: string) => (plain ? s : `［ ${s} ］`);

  const [DATA, setDATA] = useState<ProductData | null>(null);
  const [I18N, setI18N] = useState<I18nData | null>(null);
  const [err, setErr] = useState(false);
  const [SLUG, setSLUG] = useState<Record<string, string>>({});

  const [mode, setMode] = useState<Mode>('area');
  const [cat, setCat] = useState('all');
  const [sub, setSub] = useState('all');
  const [prod, setProd] = useState('all');
  const [instock, setInstock] = useState(false);
  const [modal, setModal] = useState<Item | null>(null);

  useEffect(() => {
    const v = '?v=' + new Date().toISOString().slice(0, 13);
    Promise.all([
      fetch(asset('/products.json') + v).then((r) => r.json()),
      fetch(asset('/products.i18n.json') + v).then((r) => r.json()).catch(() => null),
      loadContent().catch(() => null),
    ])
      .then(([d, i, c]) => {
        const rows = (c && c.items) || [];
        const add = extraItems(rows);
        // 一本ずつの品書きの住所は、もとの在庫だけから作ります（番号がずれないように）
        setSLUG(slugMap(d.items || [], i));
        setDATA(add.length ? { ...d, items: [...add, ...d.items], count: d.items.length + add.length } : d);
        setI18N(add.length ? mergeI18n(i, rows, add) : i);
      })
      .catch(() => setErr(true));
  }, []);

  /** お取り扱い生産者ページからの ?prod= を受け取ります */
  useEffect(() => {
    if (!DATA) return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get('prod');
      if (q && DATA.items.some((it) => it.prod === q)) { setMode('prod'); setProd(q); return; }
      /* 品書きからの ?cat=（産地）も受け取ります */
      const c = sp.get('cat');
      if (c && DATA.items.some((it) => it.cat === c)) { setMode('area'); setCat(c); }
    } catch {}
  }, [DATA]);

  const base = useMemo(
    () => (DATA ? DATA.items.filter((it) => !(instock && isOut(it))) : []),
    [DATA, instock]
  );

  const pool = useMemo(() => {
    if (!DATA) return [];
    return DATA.items.filter((it) => {
      if (instock && isOut(it)) return false;
      if (mode === 'prod') return prod === 'all' || it.prod === prod;
      if (cat !== 'all' && it.cat !== cat) return false;
      if (sub !== 'all' && (it.ap || 'other') !== sub) return false;
      return true;
    });
  }, [DATA, instock, mode, prod, cat, sub]);

  const tally = (list: Item[], key: (it: Item) => string) => {
    const m: Record<string, number> = {}; const order: string[] = [];
    list.forEach((it) => { const k = key(it) || 'other'; if (!(k in m)) { m[k] = 0; order.push(k); } m[k]++; });
    return { m, order };
  };

  const catTally = useMemo(() => tally(base, (it) => it.cat), [base]);
  const subTally = useMemo(
    () => tally(base.filter((it) => it.cat === cat), (it) => it.ap || 'other'),
    [base, cat]
  );
  const prodTally = useMemo(() => tally(base.filter((it) => it.prod), (it) => it.prod as string), [base]);

  const groups = useMemo(() => {
    let groupKey: (it: Item) => string;
    let groupLabel: (k: string) => string;
    if (mode === 'prod') { groupKey = (it) => it.prod || 'other'; groupLabel = (k) => (k === 'other' ? catOf('other', lang) : prodOf(k, lang, I18N)); }
    else if (cat === 'all') { groupKey = (it) => it.cat; groupLabel = (k) => catOf(k, lang); }
    else { groupKey = (it) => it.ap || 'other'; groupLabel = (k) => apOf(k, lang, I18N); }
    const t = tally(pool, groupKey);
    let keys = t.order.slice();
    if (mode === 'area' && cat === 'all') keys = ORDER.filter((k) => t.m[k]);
    else keys.sort((a, b) => t.m[b] - t.m[a]);
    return keys.map((k) => ({ k, label: groupLabel(k), n: t.m[k], list: pool.filter((it) => groupKey(it) === k) }));
  }, [pool, mode, cat, lang, I18N]);

  const openContact = (it: Item) =>
    router.push(`/contact?item=${encodeURIComponent(nameOf(it, lang, I18N))}`);

  return (
    <Shell>
      <div className="panel">
        <T k="st-head" as="div" kind="head" className="pixhead" />
        <T k="st-sub" as="p" kind="sub" className="sub" />

        <div style={{ textAlign: 'center', margin: '14px 0 2px' }}>
          <button className="btn" id="mode-area" style={{ margin: 2 }} data-on={mode === 'area' ? '1' : '0'}
            onClick={() => setMode('area')}>{dec(u('modeArea', lang))}</button>
          <button className="btn" id="mode-prod" style={{ margin: 2 }} data-on={mode === 'prod' ? '1' : '0'}
            onClick={() => setMode('prod')}>{dec(u('modeProd', lang))}</button>
        </div>

        {mode === 'area' ? (
          <div id="cat-nav" style={{ margin: '8px 0 2px', textAlign: 'center', lineHeight: 2 }}>
            <a href="#" className={cat === 'all' ? 'is-on' : undefined} style={{ margin: '0 6px', ...(cat === 'all' ? { fontWeight: 'bold', ...(plain ? {} : { color: '#ffd479' }) } : {}) }}
              onClick={(e) => { e.preventDefault(); setCat('all'); setSub('all'); }}>
              {brk(`${u('allCat', lang)} ${base.length}`)}
            </a>
            {ORDER.filter((c) => catTally.m[c]).map((c) => (
              <a key={c} href="#" className={cat === c ? 'is-on' : undefined} style={{ margin: '0 6px', ...(cat === c ? { fontWeight: 'bold', ...(plain ? {} : { color: '#ffd479' }) } : {}) }}
                onClick={(e) => { e.preventDefault(); setCat(c); setSub('all'); }}>
                {brk(`${catOf(c, lang)} ${catTally.m[c]}`)}
              </a>
            ))}
          </div>
        ) : null}

        {(() => {
          if (mode === 'prod') {
            const keys = prodTally.order.slice().sort((a, b) => prodTally.m[b] - prodTally.m[a]);
            return (
              <div id="sub-wrap" style={{ textAlign: 'center', margin: '10px 0 2px' }}>
                <div className="hint" id="sub-label" style={{ marginBottom: 4 }}>{u('subProd', lang)}</div>
                <select id="sub-sel" className="field" style={{ maxWidth: 360, display: 'inline-block' }}
                  value={prod} onChange={(e) => setProd(e.target.value)}>
                  <option value="all">{`${u('allProd', lang)}（${base.length}）`}</option>
                  {keys.map((k) => <option key={k} value={k}>{`${prodOf(k, lang, I18N)}（${prodTally.m[k]}）`}</option>)}
                </select>
              </div>
            );
          }
          if (cat === 'all') return null;
          const k2 = subTally.order.slice().sort((a, b) => subTally.m[b] - subTally.m[a]);
          if (k2.length <= 1) return null;
          const n2 = base.filter((it) => it.cat === cat).length;
          return (
            <div id="sub-wrap" style={{ textAlign: 'center', margin: '10px 0 2px' }}>
              <div className="hint" id="sub-label" style={{ marginBottom: 4 }}>{u('subArea', lang)}</div>
              <select id="sub-sel" className="field" style={{ maxWidth: 360, display: 'inline-block' }}
                value={sub} onChange={(e) => setSub(e.target.value)}>
                <option value="all">{`${u('allArea', lang)}（${n2}）`}</option>
                {k2.map((k) => <option key={k} value={k}>{`${apOf(k, lang, I18N)}（${subTally.m[k]}）`}</option>)}
              </select>
            </div>
          );
        })()}

        <div style={{ textAlign: 'center', margin: '12px 0 2px' }}>
          <button className="btn" id="stock-btn" data-on={instock ? '1' : '0'} onClick={() => setInstock((v) => !v)}>
            {dec(instock ? u('stockOn', lang) : u('stockOff', lang))}
          </button>
        </div>

        <div className="hint" id="result-count" style={{ textAlign: 'center', marginTop: 8 }}>
          {u('hits', lang).replace('%n', String(pool.length))}
        </div>
      </div>

      <div className="panel">
        <div id="catalogue">
          {err ? <p className="hint">{u('err', lang)}</p>
            : !DATA ? <T k="st-loading" as="p" className="hint" />
            : pool.length === 0 ? <p className="hint">{u('none', lang)}</p>
            : groups.map((g) => (
              <div key={g.k}>
                <div className="x-amber x-dash" style={{ fontSize: 18, margin: '18px 0 6px', paddingBottom: 4 }}>
                  {brk2(g.label)} <span className="hint" style={{ fontSize: 13 }}>{g.n}{u('items', lang)}</span>
                </div>
                {g.list.map((it) => {
                  const out = isOut(it);
                  return (
                    <div className="card" key={it.id}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, ...(out ? { opacity: 0.62 } : {}) }}>
                      <div style={{ flex: '0 0 62px' }}>
                        <img src={it.img} alt="" loading="lazy" className="x-thumb" style={{ width: 62, height: 'auto' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b>{nameOf(it, lang, I18N)}</b>
                        {it.prod ? <><br /><span className="hint">{prodOf(it.prod, lang, I18N)}</span></> : null}
                      </div>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="price">{it.price}</span>
                        {out ? <><br /><span className="hint">{u('soldout', lang)}</span></> : null}
                        <br />
                        <button className="btn" style={{ marginTop: 5 }} onClick={() => setModal(it)}>{dec(u('detail', lang))}</button>
                        {SLUG[it.id] ? (
                          <><br />
                            <Link className="hint" style={{ display: 'inline-block', marginTop: 4 }}
                                  href={winePath(SLUG[it.id], lang)}>{u('page', lang)}</Link>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </div>

      <div id="modal-ov" className={`modal-ov${modal ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <div className="modal-box">
          <button className="modal-close" onClick={() => setModal(null)}>
            <T k="st-close" as="span" />
          </button>
          <div id="modal-content">
            {modal ? (() => {
              const d = descOf(modal, lang, I18N);
              const ns = notesOf(modal, lang, I18N);
              return (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <img src={modal.img} alt="" className="x-thumb" style={{ maxWidth: 200, height: 'auto' }} />
                  </div>
                  <div className="modal-title">{nameOf(modal, lang, I18N)}</div>
                  {modal.prod ? <div className="modal-sub">{u('prod', lang)}： {prodOf(modal.prod, lang, I18N)}</div> : null}
                  {modal.ap ? <div className="modal-sub hint">{apOf(modal.ap, lang, I18N)}</div> : null}
                  <hr className="rainbow" style={{ margin: '8px 0' }} />
                  {d ? <div className="modal-body">{d}</div> : null}
                  {ns.length ? <div className="hint" style={{ marginTop: 8 }}>{ns.map((n, i) => <span key={i}>{n}<br /></span>)}</div> : null}
                  <div className="modal-price">{modal.price}{isOut(modal) ? '　' + u('soldout', lang) : ''}</div>
                  <div style={{ textAlign: 'center', marginTop: 14 }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); openContact(modal); }}>
                      <span className="btn" style={{ fontSize: 15, padding: '8px 20px' }}>{dec(u('cta', lang))}</span>
                    </a>
                  </div>
                </>
              );
            })() : null}
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="hint">
          <T k="st-note-pre" as="span" />{' '}
          <A href="/contact"><T k="st-note-link" as="span" /></A>{' '}
          <T k="st-note-post" as="span" />
        </p>
      </div>
    </Shell>
  );
}
