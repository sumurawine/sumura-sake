'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/paths';
import { tr, type Lang } from '@/lib/i18n';
import { useSite } from '@/components/Providers';
import { MC } from '@/lib/modernCopy';
import { pre } from '@/lib/slug';
import { CATS, isOut, nameOf, type I18nData, type Item, type ProductData } from '@/lib/store';
import { MShell } from './MShell';
import { Chars, Reveal, useParallax, useSmoothScroll } from './Motion';

const HERO_SHOTS = ['/images/photos/shelf-row.jpg', '/images/photos/cheval-blanc-1929.jpg', '/images/photos/meo-camuzet.jpg', '/images/photos/gillet.jpg', '/images/photos/rouget.jpg'];

function Hero({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const [shot, setShot] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setShot((n) => (n + 1) % HERO_SHOTS.length), 3400);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-hero">
      {HERO_SHOTS.map((src, i) => (
        <div key={src} className={`mx-hero-bg${i === shot ? ' is-on' : ''}`}
             style={{ backgroundImage: `url(${asset(src)})` }} />
      ))}
      <div className="mx-hero-shade" />
      <div className="mx-hero-in">
        <div className="mx-in">
          <Reveal as="p" className="mx-kicker">{c.heroKicker}</Reveal>
          <h1 className="mx-h1"><Chars text="すむら酒店" /></h1>
          <Reveal as="p" delay={3} className="mx-hero-sub">{c.heroLead}</Reveal>
        </div>
      </div>
      <div className="mx-scroll"><i /><span>{c.scroll}</span></div>
    </section>
  );
}

function Quote({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const bg = useParallax(0.1);
  return (
    <section className="mx-bleed">
      <div ref={bg} className="mx-bleed-bg" style={{ backgroundImage: `url(${asset('/images/modern/veil-wine.jpg')})` }} />
      <div className="mx-bleed-shade" />
      <div className="mx-in-n" style={{ textAlign: 'center' }}>
        <Reveal as="p" className="mx-h2" style={{ marginBottom: 22 }}>{c.quote}</Reveal>
        <Reveal delay={1} style={{ marginBottom: 28 }}>
          <Link href={`${pre(lang)}/virtual`} className="mx-btn"><span>{c.quoteVs}</span></Link>
        </Reveal>
        <Reveal as="p" delay={2} className="mx-kicker" style={{ margin: 0 }}>— {c.quoteBy}</Reveal>
      </div>
    </section>
  );
}

function About({ lang }: { lang: Lang }) {
  const c = MC[lang];
  return (
    <section className="mx-sec">
      <div className="mx-in">
        <div className="mx-two">
          <div>
            <Reveal as="p" className="mx-kicker">{c.ch1}</Reveal>
            <Reveal as="h2" delay={1} className="mx-h2">{c.ch1Head}</Reveal>
            <Reveal as="p" delay={2} className="mx-lead">{tr(lang, 'home-p1')}</Reveal>
            <Reveal as="p" delay={3} className="mx-p">{tr(lang, 'home-p2')}</Reveal>
            <Reveal delay={4}>
              <Link href={`${pre(lang)}/about`} className="mx-btn"><span>{tr(lang, 'nav:about')}</span></Link>
            </Reveal>
          </div>
          <Reveal delay={2} className="mx-photo" threshold={0.25}>
            <img src={asset('/images/shop-sign.webp')} alt="" width={760} height={746} />
          </Reveal>
        </div>
        <Reveal as="p" delay={3} className="mx-cap" style={{ textAlign: 'right' }}>{c.ch1Cap}</Reveal>
      </div>
    </section>
  );
}


function Gallery({ lang }: { lang: Lang }) {
  const c = MC[lang];
  return (
    <section className="mx-sec-tight">
      <div className="mx-in">
        <Reveal as="p" className="mx-kicker">{c.gallery}</Reveal>
        <Reveal as="h2" delay={1} className="mx-h2">{c.galleryHead}</Reveal>
        <div className="mx-duo">
          <div>
            <Reveal className="mx-photo" threshold={0.2}>
              <img src={asset('/images/photos/cheval-blanc-1929.jpg')} alt="" loading="lazy" />
            </Reveal>
            <Reveal as="p" delay={1} className="mx-cap">{c.capCheval}</Reveal>
            <Reveal as="p" delay={2} className="mx-p" style={{ marginTop: 14 }}>{c.capOld}</Reveal>
          </div>
          <div>
            <Reveal delay={2} className="mx-photo" threshold={0.2}>
              <img src={asset('/images/photos/meo-camuzet.jpg')} alt="" loading="lazy" />
            </Reveal>
            <Reveal as="p" delay={3} className="mx-cap">{c.capRoch}</Reveal>
          </div>
        </div>
        <div className="mx-duo" style={{ marginTop: 40 }}>
          <div>
            <Reveal className="mx-photo" threshold={0.2}>
              <img src={asset('/images/photos/cros-parantoux.jpg')} alt="" loading="lazy" />
            </Reveal>
            <Reveal as="p" delay={1} className="mx-cap">{c.capRouget}</Reveal>
          </div>
          <div>
            <Reveal delay={2} className="mx-photo" threshold={0.2}>
              <img src={asset('/images/photos/shelf-row.jpg')} alt="" loading="lazy" />
            </Reveal>
            <Reveal as="p" delay={3} className="mx-cap">{c.capGillet}</Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Selection({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const [data, setData] = useState<ProductData | null>(null);
  const [i18n, setI18n] = useState<I18nData | null>(null);

  useEffect(() => {
    const v = '?v=' + new Date().toISOString().slice(0, 13);
    Promise.all([
      fetch(asset('/products.json') + v).then((r) => r.json()),
      fetch(asset('/products.i18n.json') + v).then((r) => r.json()).catch(() => null),
    ]).then(([d, i]) => { setData(d); setI18n(i); }).catch(() => {});
  }, []);

  const all: Item[] = data?.items || [];
  const pick = all.filter((it) => !isOut(it) && it.img && it.img.indexOf('new_1553760789661') < 0).slice(0, 12);

  return (
    <section className="mx-sec">
      <div className="mx-in">
        <Reveal as="p" className="mx-kicker">{c.ch2}</Reveal>
        <Reveal as="h2" delay={1} className="mx-h2">{c.ch2Head}</Reveal>
        <Reveal delay={2} className="mx-wide" style={{ margin: '18px 0 46px' }}>
          <div className="mx-photo" style={{ aspectRatio: '16 / 9' }}>
            <img src={asset('/images/photos/roch.jpg')} alt="" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <div className="mx-rail">
        {pick.map((it, i) => (
          <Reveal key={it.id} delay={(Math.min(i, 5) + 1) as any}>
            <Link href={`${pre(lang)}/store`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="mx-vitrine mx-vit-tall">
                <img src={it.img} alt="" loading="lazy" />
              </div>
              <div style={{ marginTop: 14, fontSize: 12.5, lineHeight: 1.8, letterSpacing: '.05em', color: 'var(--mx-dim)' }}>
                {nameOf(it, lang, i18n)}
              </div>
              <div className="mx-cap" style={{ marginTop: 6 }}>{it.price}</div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mx-in">
        <Reveal as="p" className="mx-note" style={{ marginBottom: 26 }}>{c.ch2Note}</Reveal>
        <Reveal delay={1}><Link href={`${pre(lang)}/store`} className="mx-btn"><span>{c.ch2More}</span></Link></Reveal>
      </div>
    </section>
  );
}

function Facts({ lang, data }: { lang: Lang; data: ProductData | null }) {
  const c = MC[lang];
  const n = data?.items?.length || 284;
  const areas = new Set((data?.items || []).map((i) => i.cat)).size || 11;
  const makers = new Set((data?.items || []).map((i) => i.prod).filter(Boolean)).size || 90;
  return (
    <section className="mx-sec-tight">
      <div className="mx-in">
        <Reveal as="p" className="mx-kicker">{c.factsHead}</Reveal>
        <Reveal delay={1} className="mx-facts" as="dl">
          <div><dt>{c.fItems}</dt><dd><span className="mx-num">{n}</span></dd></div>
          <div><dt>{c.fAreas}</dt><dd><span className="mx-num">{areas}</span></dd></div>
          <div><dt>{c.fMakers}</dt><dd><span className="mx-num">{makers}</span></dd></div>
        </Reveal>
      </div>
    </section>
  );
}

function Cellar({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const bg = useParallax(0.12);
  return (
    <section className="mx-bleed">
      <div ref={bg} className="mx-bleed-bg" style={{ backgroundImage: `url(${asset('/images/photos/cros-parantoux.jpg')})` }} />
      <div className="mx-bleed-shade" />
      <div className="mx-in">
        <div style={{ maxWidth: 620 }}>
          <Reveal as="p" className="mx-kicker">{c.ch3}</Reveal>
          <Reveal as="h2" delay={1} className="mx-h2">{c.ch3Head}</Reveal>
          <Reveal as="p" delay={2} className="mx-p">{c.ch3Body}</Reveal>
          <Reveal delay={3}><Link href={`${pre(lang)}/secret`} className="mx-btn"><span>{c.ch3Btn}</span></Link></Reveal>
        </div>
      </div>
    </section>
  );
}

function History({ lang }: { lang: Lang }) {
  const c = MC[lang];
  return (
    <section className="mx-sec">
      <div className="mx-in">
        <div className="mx-two mx-two-40">
          <div>
            <Reveal as="p" className="mx-kicker">{c.ch4}</Reveal>
            <Reveal as="h2" delay={1} className="mx-h2">{c.ch4Head}</Reveal>
            <Reveal as="p" delay={2} className="mx-p">{c.ch4Body}</Reveal>
            <Reveal delay={3}><Link href="/mukashi" className="mx-btn"><span>{c.ch4Btn}</span></Link></Reveal>
          </div>
          <div>
            <Reveal className="mx-photo" threshold={0.2}>
              <img src={asset('/images/showa30.webp')} alt="" loading="lazy" />
            </Reveal>
            <Reveal as="p" delay={1} className="mx-cap">{c.ch4Cap}</Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function News({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const rows = ['home-hist-1', 'home-hist-2', 'home-hist-3'];
  return (
    <section className="mx-sec-tight">
      <div className="mx-in">
        <Reveal as="p" className="mx-kicker">{c.newsHead}</Reveal>
        <div>
          {rows.map((k, i) => (
            <Reveal key={k} delay={(i + 1) as any}
              style={{ borderTop: '1px solid var(--mx-line)', padding: '24px 0', fontSize: 14.5, lineHeight: 2, letterSpacing: '.05em', color: 'var(--mx-dim)' }}
              dangerouslySetInnerHTML={{ __html: tr(lang, k) }} />
          ))}
        </div>
        <Reveal delay={2} style={{ marginTop: 34 }}>
          <Link href={`${pre(lang)}/news`} className="mx-link">{c.newsMore}</Link>
        </Reveal>
      </div>
    </section>
  );
}

function Cta({ lang }: { lang: Lang }) {
  const c = MC[lang];
  const bg = useParallax(0.1);
  return (
    <section className="mx-bleed" style={{ minHeight: '76svh' }}>
      <div ref={bg} className="mx-bleed-bg" style={{ backgroundImage: `url(${asset('/images/modern/veil-ash.jpg')})` }} />
      <div className="mx-bleed-shade" />
      <div className="mx-in-n" style={{ textAlign: 'center' }}>
        <Reveal as="h2" className="mx-h2">{c.ctaHead}</Reveal>
        <Reveal as="p" delay={1} className="mx-p">{c.ctaBody}</Reveal>
        <Reveal delay={2} style={{ marginTop: 12 }}>
          <Link href={`${pre(lang)}/contact`} className="mx-btn mx-btn-solid"><span>{c.ctaBtn}</span></Link>
        </Reveal>
        <Reveal as="p" delay={3} className="mx-cap" style={{ marginTop: 26 }}>{c.ctaTel} — 0836-21-4721</Reveal>
      </div>
    </section>
  );
}

export function MHome() {
  const { lang } = useSite();
  useSmoothScroll(true);   /* ホームは、粘りのあるゆっくりした下りに */
  const [data, setData] = useState<ProductData | null>(null);
  useEffect(() => {
    fetch(asset('/products.json')).then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  return (
    <MShell>
      <Hero lang={lang} />
      <About lang={lang} />
      <Gallery lang={lang} />
      <Quote lang={lang} />
      <Selection lang={lang} />
      <Facts lang={lang} data={data} />
      <Cellar lang={lang} />
      <History lang={lang} />
      <News lang={lang} />
      <Cta lang={lang} />
    </MShell>
  );
}
