'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tr } from '@/lib/i18n';
import { MODERN } from '@/lib/decor';
import { useSite } from '@/components/Providers';
import { VisitCounter } from '@/components/VisitCounter';
import { LeaveOverlay, leaveLabel } from '@/components/LeaveOverlay';
import { Atmosphere, useStuck } from './Motion';
import { useEffect, useState } from 'react';

const NAV: Array<[string, string]> = [
  ['/store', 'nav:store'],
  ['/about', 'nav:about'],
  ['/blog', 'nav:blog'],
  ['/news', 'nav:news'],
  ['/access', 'nav:access'],
  ['/contact', 'nav:contact'],
  ['/secret', 'nav:secret'],
];

const FOOT_A: Array<[string, string]> = [
  ['/store', 'nav:store'], ['/about', 'nav:about'], ['/blog', 'nav:blog'], ['/news', 'nav:news'],
];
const FOOT_B: Array<[string, string]> = [
  ['/access', 'nav:access'], ['/contact', 'nav:contact'], ['/legal', 'nav:legal'], ['/secret', 'nav:secret'],
];

export function MShell({ children }: { children: React.ReactNode }) {
  const { lang } = useSite();
  const path = usePathname() || '';
  const stuck = useStuck(40);
  const [leaving, setLeaving] = useState(false);

  // 旧「現在」用のCSSを打ち消すための目印
  useEffect(() => {
    document.documentElement.setAttribute('data-mx', '1');
    return () => { document.documentElement.removeAttribute('data-mx'); };
  }, []);

  const label = (k: string) => (k === 'nav:secret' ? MODERN[lang].priv : tr(lang, k));
  const on = (href: string) => path === href || path === href + '/';

  return (
    <>
      <Atmosphere />

      <header className={`mx-head${stuck ? ' is-stuck' : ''}`}>
        <Link href="/home" className="mx-brand">
          すむら酒店<small>LIQUOR SHOP SUMURA</small>
        </Link>
        <nav className="mx-nav">
          {NAV.map(([href, k]) => (
            <Link key={href} href={href} className={on(href) ? 'on' : ''}>{label(k)}</Link>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); setLeaving(true); }}>{leaveLabel(lang)}</a>
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
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {tr(lang, 'tk-vis-pre')} <VisitCounter /> {tr(lang, 'tk-vis-post')}
            </span>
          </div>
        </div>
      </footer>

      <LeaveOverlay open={leaving} lang={lang} />
    </>
  );
}
