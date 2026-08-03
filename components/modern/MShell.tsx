'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tr } from '@/lib/i18n';
import { PROD_NAV } from '@/lib/producersNav';
import { MODERN } from '@/lib/decor';
import { LEGAL_TITLE } from '@/lib/modernCopy';
import { useSite } from '@/components/Providers';
import { LeaveOverlay, leaveLabel } from '@/components/LeaveOverlay';
import { asset } from '@/lib/paths';
import { Atmosphere, useStuck } from './Motion';
import { AutoReveal } from './AutoReveal';
import { CATS, ORDER } from '@/lib/store';
import { EXTRA } from '@/lib/producers';
import { useEffect, useState } from 'react';

const VIRTUAL: Record<string, string> = {
  jp: 'バーチャル店舗へ', en: 'Virtual shop', fr: 'Boutique virtuelle', zh: '虚拟店铺', ko: '가상 매장',
};

const NAV: Array<[string, string]> = [
  ['/store', 'nav:store'],
  ['/virtual', 'nav:virtual'],
  ['/producers', 'nav:producers'],
  ['/about', 'nav:about'],
  ['/blog', 'nav:blog'],
  ['/news', 'nav:news'],
  ['/access', 'nav:access'],
  ['/contact', 'nav:contact'],
  ['/secret', 'nav:secret'],
];

const FOOT_A: Array<[string, string]> = [
  ['/store', 'nav:store'], ['/wines', 'nav:wines'], ['/producers', 'nav:producers'], ['/about', 'nav:about'], ['/blog', 'nav:blog'],
];
const FOOT_B: Array<[string, string]> = [
  ['/access', 'nav:access'], ['/contact', 'nav:contact'], ['/legal', 'nav:legal'], ['/secret', 'nav:secret'],
];

export function MShell({ children }: { children: React.ReactNode }) {
  const { lang } = useSite();
  const path = usePathname() || '';
  const stuck = useStuck(40);
  const [leaving, setLeaving] = useState(false);
  const [menu, setMenu] = useState(false);

  // 旧「現在」用のCSSを打ち消すための目印
  useEffect(() => {
    document.documentElement.setAttribute('data-mx', '1');
    return () => { document.documentElement.removeAttribute('data-mx'); };
  }, []);

  const WINES: Record<string, string> = {
    jp: '取り扱い銘柄の一覧', en: 'All wines', fr: 'Tous les vins', zh: '全酒款一览', ko: '전 품목 목록',
  };
  const label = (k: string) =>
    k === 'nav:wines' ? (WINES[lang] || WINES.jp) :
    k === 'nav:virtual' ? (VIRTUAL[lang] || VIRTUAL.jp) :
    k === 'nav:secret' ? MODERN[lang].priv : k === 'nav:legal' ? LEGAL_TITLE[lang]
    : k === 'nav:producers' ? PROD_NAV[lang] : tr(lang, k);
  const on = (href: string) => path === href || path === href + '/';

  return (
    <>
      <div className="mx-veil" aria-hidden><i /></div>
      <div className="mx-bg" aria-hidden style={{ backgroundImage: `url(${asset(backOf(path))})` }} />
      <Atmosphere />
      <AutoReveal />

      <header className={`mx-head${stuck ? ' is-stuck' : ''}`}>
        <Link href="/home" className="mx-brand">
          すむら酒店<small>LIQUOR SHOP SUMURA</small>
        </Link>
        <button type="button" className={`mx-burger${menu ? ' is-open' : ''}`} aria-label="メニュー"
          onClick={() => setMenu((v) => !v)}><span /><span /><span /></button>
        <nav className={`mx-nav${menu ? ' is-open' : ''}`} onClick={() => setMenu(false)}>
          {NAV.map(([href, k]) => {
            const sub = subOf(href, lang);
            return (
              <span key={href} className={sub ? 'mx-navitem has-sub' : 'mx-navitem'}>
                <Link href={href} className={on(href) ? 'on' : ''}>{label(k)}</Link>
                {sub ? (
                  <span className="mx-sub">
                    <span className="mx-sub-in">
                      {sub.map(([h, t]) => <Link key={h + t} href={h}>{t}</Link>)}
                    </span>
                  </span>
                ) : null}
              </span>
            );
          })}
          <span className="mx-navitem">
            <a href="#" onClick={(e) => { e.preventDefault(); setLeaving(true); }}>{leaveLabel(lang)}</a>
          </span>
        </nav>
      </header>

      <div className="mx">{children}</div>

      <footer className="mx-foot">
        <div className="mx-in">
          <div className="mx-foot-grid">
            <div>
              <div style={{ fontFamily: 'var(--mx-jp)', fontSize: 21, letterSpacing: '.18em' }}>すむら酒店</div>
              <div className="mx-note" style={{ marginTop: 14 }}>
                {tr(lang, "ac-v-addr")}<br />
                0836-21-4721<br />
                {tr(lang, "ac-v-hours")}
              </div>
              <a className="mx-link" style={{ display: 'inline-block', marginTop: 20, fontSize: 13 }}
                 href="https://www.instagram.com/sumurasake" target="_blank" rel="noopener">Instagram</a>
            </div>
            <div>
              <h4>SHOP</h4>
              <ul>{FOOT_A.map(([h, k]) => <li key={h}><Link href={h}>{label(k)}</Link></li>)}</ul>
            </div>
            <div>
              <h4>INFORMATION</h4>
              <ul>{FOOT_B.map(([h, k]) => <li key={h}><Link href={h}>{label(k)}</Link></li>)}</ul>
            </div>
          </div>
          <div className="mx-foot-end">
            <span>© 2026 SUMURA</span>

          </div>
        </div>
      </footer>

      <LeaveOverlay open={leaving} lang={lang} onClose={() => setLeaving(false)} />
    </>
  );
}

/** 品書きの下に開く、細かなお品書き */
const ALL_LABEL: Record<string, string> = {
  jp: 'すべて見る', en: 'See all', fr: 'Tout voir', zh: '查看全部', ko: '전체 보기',
};
const PROD_ALL: Record<string, string> = {
  jp: '生産者の一覧へ', en: 'All producers', fr: 'Tous les producteurs', zh: '生产者一览', ko: '생산자 목록',
};

function subOf(href: string, lang: any): Array<[string, string]> | null {
  if (href === '/store') {
    const rows: Array<[string, string]> = ORDER
      .filter((k) => k !== 'other')
      .map((k) => [`/store?cat=${k}`, CATS[k]?.[lang as 'jp'] || k] as [string, string]);
    rows.push(['/store', ALL_LABEL[lang] || ALL_LABEL.jp]);
    return rows;
  }
  if (href === '/producers') {
    const rows: Array<[string, string]> = EXTRA.map(
      (e) => [`/store?prod=${encodeURIComponent(e.jp)}`, lang === 'jp' ? e.jp : e.latin] as [string, string]
    );
    rows.push(['/producers', PROD_ALL[lang] || PROD_ALL.jp]);
    return rows;
  }
  return null;
}

/** ページごとに、後ろに置く一枚を変えます */
const BACKS: Array<[string, string]> = [
  ['/store', '/images/photos/shelf-row.jpg'],
  ['/producers', '/images/photos/cheval-blanc-1929.jpg'],
  ['/about', '/images/photos/meo-camuzet.jpg'],
  ['/blog', '/images/photos/gillet.jpg'],
  ['/news', '/images/photos/cros-parantoux.jpg'],
  ['/access', '/images/shop-sign.webp'],
  ['/contact', '/images/photos/roch.jpg'],
  ['/legal', '/images/photos/shelf-row.jpg'],
  ['/secret', '/images/photos/cheval-blanc-1929.jpg'],
];

function backOf(path: string): string {
  const p = String(path || '').replace(/\/$/, '');
  const hit = BACKS.find(([h]) => p === h || p.indexOf(h + '/') === 0);
  return hit ? hit[1] : '/images/photos/rouget.jpg';
}
