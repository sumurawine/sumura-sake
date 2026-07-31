'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { asset } from '@/lib/paths';
import { tr } from '@/lib/i18n';
import { decorate, MODERN } from '@/lib/decor';
import { isModern } from '@/lib/era';
import { useSite } from './Providers';
import { T } from './T';
import { A } from './A';
import { Clock } from './Clock';
import { VisitCounter } from './VisitCounter';
import { DecoRow, Gif, Rainbow, Ticker } from './Deco';
import { LeaveOverlay, leaveLabel } from './LeaveOverlay';
import { GAME_NAV } from '@/lib/gameNav';
import { MShell } from './modern/MShell';

const NAV: Array<[string, string]> = [
  ['/home', 'nav:home'],
  ['/news', 'nav:news'],
  ['/store', 'nav:store'],
  ['/blog', 'nav:blog'],
  ['/about', 'nav:about'],
  ['/access', 'nav:access'],
  ['/contact', 'nav:contact'],
  ['/legal', 'nav:legal'],
  ['/secret', 'nav:secret'],
  ['/game', 'nav:game'],
];

export function Shell({ children, footerRule = true }: { children: React.ReactNode; footerRule?: boolean }) {
  const { lang, eraView } = useSite();
  const path = usePathname() || '';
  const [leaving, setLeaving] = useState(false);
  const modern = isModern(eraView as any);

  const marquee = tr(lang, 'tk-marquee');

  // 2020年代は、黒の画廊の枠組みで包みます
  if (eraView === 'now') {
    return (
      <MShell>
        <div className="mx-legacy">
          <div className="mx-in">{children}</div>
        </div>
      </MShell>
    );
  }


  /** フッターのリンク名。日本語のときは従来どおり英字のままにします。 */
  const foot = (key: string, en: string) => (lang === 'jp' ? en : tr(lang, 'nav:' + key));

  return (
    <>
      <Clock />
      <div className="wrap">
        <DecoRow top />

        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <Link href="/home">
            {modern ? (
              <span className="tw-logo" style={{ display: 'block', fontSize: 30, fontWeight: 'bold', color: '#222', padding: '16px 0 0' }}>すむら酒店</span>
            ) : (
              <img src={asset('/images/logo-header.png')} alt="すむら酒店" style={{ maxWidth: '96%' }} />
            )}
          </Link>
          <T k="header:sub" as="div" kind="headerSub" className="sub" style={{ marginTop: 6 }} />
        </div>

        <div className="marquee"><T k="tk-marquee" as="b" /></div>

        <div className="nav">
          {NAV.map(([href, key]) => {
            const on = path === href || path === href + '/';
            const label =
              key === 'nav:game'
                ? GAME_NAV[lang]
                : key === 'nav:secret' && modern
                ? MODERN[lang].priv
                : decorate(tr(lang, key), eraView, lang, 'btn');
            return (
              <Link key={href} href={href} className={on ? 'on' : ''} dangerouslySetInnerHTML={{ __html: label }} />
            );
          })}
          <a href="#" id="tw-leave" onClick={(e) => { e.preventDefault(); setLeaving(true); }}>
            {leaveLabel(lang)}
          </a>
          {eraView === '2005' ? <Gif name="new.gif" w={40} h={16} style={{ verticalAlign: 'middle' }} /> : null}
        </div>

        <Rainbow />

        {children}

        {footerRule ? <Rainbow /> : null}

        <div style={{ textAlign: 'center', fontSize: 14, margin: '14px 0' }} className="x-muted">
          <div>
            [ <A href="/home">{foot('home', 'HOME')}</A> ｜ <A href="/store">{foot('store', 'STORE')}</A> ｜ <A href="/blog">{foot('blog', 'BLOG')}</A> ｜ <A href="/contact">{foot('contact', 'CONTACT')}</A> ]
          </div>
          <div style={{ margin: '10px 0' }}>
            <a href="https://www.instagram.com/sumurasake" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
              <T k="tk-ig" as="span" kind="btn" className="btn" style={{ fontSize: 13, padding: '4px 14px' }} />
            </a>
            <T k="tk-ig-note" as="div" className="hint" style={{ marginTop: 4 }} />
          </div>
          <div style={{ margin: '8px 0' }}>
            <T k="tk-webring" as="span" /> &lt; <a href="#">PREV</a> ｜ <a href="#">RANDOM</a> ｜ <a href="#">NEXT</a>{' '}&gt;
          </div>
          <div style={{ margin: '8px 0' }}>
            <T k="tk-vis-pre" as="span" /> <VisitCounter /> <T k="tk-vis-post" as="span" />
          </div>
          <div>
            <span className="badge">Made with Notepad</span>
            <span className="badge">HTML 3.2</span>
            <span className="badge">800×600</span>
          </div>
          <div style={{ marginTop: 10 }}>Copyright (C) 2026 すむら酒店</div>
        </div>
      </div>

      <Ticker text={marquee} />
      <LeaveOverlay open={leaving} lang={lang} />
    </>
  );
}
