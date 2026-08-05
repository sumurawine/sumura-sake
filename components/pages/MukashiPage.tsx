'use client';

import { useEffect } from 'react';
import { asset } from '@/lib/paths';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { useSite } from '@/components/Providers';
import type { Lang } from '@/lib/i18n';

type Shot = { src: string; era: Record<Lang, string>; cap: Record<Lang, string>; w: number; h: number };

/* 年代の古い順に。写真は、紙のふちを落として向きを起こしたものです */
const SHOTS: Shot[] = [
  {
    src: '/images/showa30.webp', w: 900, h: 693,
    era: { jp: '1950年代', en: 'the 1950s', fr: 'années 1950', zh: '1950年代', ko: '1950년대' },
    cap: {
      jp: '初代の店先',
      en: 'The shop in its first generation',
      fr: 'La boutique à ses débuts',
      zh: '初代的店门前',
      ko: '초대의 가게 앞',
    },
  },
  {
    src: '/images/showa30-sofu.webp', w: 718, h: 1096,
    era: { jp: '1950年代', en: 'the 1950s', fr: 'années 1950', zh: '1950年代', ko: '1950년대' },
    cap: {
      jp: '二代目 ── 上宇部に店を移した頃',
      en: 'The second generation, when the shop moved to Kami-Ube',
      fr: 'La deuxième génération, lors du déménagement à Kami-Ube',
      zh: '第二代 ── 迁店至上宇部的时候',
      ko: '2대 ── 가미우베로 가게를 옮긴 무렵',
    },
  },
  {
    src: '/images/mukashi/1970-shop.webp', w: 1600, h: 1132,
    era: { jp: '1970年代', en: 'the 1970s', fr: 'années 1970', zh: '1970年代', ko: '1970년대' },
    cap: {
      jp: '四代目 博志。ビール箱を積んだ店先で',
      en: 'Hiroshi, the fourth generation, among the stacked beer crates',
      fr: 'Hiroshi, quatrième génération, parmi les caisses de bière',
      zh: '第四代 博志。在堆满啤酒箱的店门前',
      ko: '4대 히로시. 맥주 상자를 쌓아 둔 가게 앞에서',
    },
  },
  {
    src: '/images/mukashi/1980-okami.webp', w: 1245, h: 1600,
    era: { jp: '1980年代', en: 'the 1980s', fr: 'années 1980', zh: '1980年代', ko: '1980년대' },
    cap: {
      jp: '三代目 保美',
      en: 'Yasumi, the third generation',
      fr: 'Yasumi, troisième génération',
      zh: '第三代 保美',
      ko: '3대 야스미',
    },
  },
  {
    src: '/images/mukashi/1982-street.webp', w: 1600, h: 1576,
    era: { jp: '1982年', en: '1982', fr: '1982', zh: '1982年', ko: '1982년' },
    cap: {
      jp: '祭りの日の店先',
      en: 'The shopfront on the day of the festival',
      fr: 'Devant la boutique, un jour de fête',
      zh: '祭典之日的店门前',
      ko: '축제날의 가게 앞',
    },
  },
  {
    src: '/images/mukashi/1984-sadao.webp', w: 1600, h: 1092,
    era: { jp: '1984年', en: '1984', fr: '1984', zh: '1984年', ko: '1984년' },
    cap: {
      jp: '三代目 貞男。帳場に立つ',
      en: 'Sadao, the third generation, at the counter',
      fr: 'Sadao, troisième génération, au comptoir',
      zh: '第三代 贞男。站在柜台前',
      ko: '3대 사다오. 계산대에 서서',
    },
  },
  {
    src: '/images/mukashi/1988-front.webp', w: 1600, h: 1515,
    era: { jp: '1988年', en: '1988', fr: '1988', zh: '1988年', ko: '1988년' },
    cap: {
      jp: 'すむら リカー＆フーズショップ',
      en: 'Sumura Liquor & Foods Shop',
      fr: 'Sumura Liquor & Foods Shop',
      zh: 'すむら Liquor & Foods Shop',
      ko: '스무라 리커 앤 푸즈 숍',
    },
  },
  {
    src: '/images/mukashi/1990-inside1.webp', w: 1600, h: 1187,
    era: { jp: '1990年代', en: 'the 1990s', fr: 'années 1990', zh: '1990年代', ko: '1990년대' },
    cap: {
      jp: '店内。フランスの棚',
      en: 'Inside the shop ── the French shelves',
      fr: 'À l’intérieur ── le rayon français',
      zh: '店内。法国酒的货架',
      ko: '가게 안. 프랑스 진열대',
    },
  },
  {
    src: '/images/mukashi/1990-inside2.webp', w: 1600, h: 1120,
    era: { jp: '1990年代', en: 'the 1990s', fr: 'années 1990', zh: '1990年代', ko: '1990년대' },
    cap: {
      jp: '店内。ワインの棚',
      en: 'Inside the shop ── the wine shelves',
      fr: 'À l’intérieur ── le rayon des vins',
      zh: '店内。葡萄酒的货架',
      ko: '가게 안. 와인 진열대',
    },
  },
  {
    src: '/images/mukashi/1999-family.webp', w: 1600, h: 870,
    era: { jp: '1999年', en: '1999', fr: '1999', zh: '1999年', ko: '1999년' },
    cap: {
      jp: '四代目 博志と亜矢子、友人のトムとショーナ。五代目の歩を抱いて',
      en: 'Hiroshi and Ayako of the fourth generation, with their friends Tom and Shona, holding Ayumu of the fifth',
      fr: 'Hiroshi et Ayako, quatrième génération, avec leurs amis Tom et Shona, portant Ayumu, cinquième génération',
      zh: '第四代 博志与亚矢子，友人汤姆与肖娜。怀抱第五代 步',
      ko: '4대 히로시와 아야코, 친구 톰과 쇼나. 5대 아유무를 안고',
    },
  },
];

export function MukashiPage() {
  const { lang } = useSite();

  /* ゆっくりと現れる写真。仕掛けが動かない環境では、はじめから見えています */
  useEffect(() => {
    const wrap = document.querySelector('.mk-wrap');
    if (!wrap) return;
    wrap.classList.add('mk-ready');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.16 },
    );
    wrap.querySelectorAll('.mk-fx').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    try { window.history.scrollRestoration = 'manual'; } catch { /* しずかに */ }
    const top = () => window.scrollTo(0, 0);
    top();
    const t1 = window.setTimeout(top, 60);
    const t2 = window.setTimeout(top, 400);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  return (
    <div className="mk-wrap">
      <T k="mk-title" as="div" className="mk-title" />
      <div className="mk-en">Liquor Shop Sumura</div>

      <div className="mk-rule" />

      {SHOTS.map((s, i) => (
        <figure key={s.src} className={i % 2 ? 'mk-card mk-r mk-fx' : 'mk-card mk-fx'}>
          <span className={i % 2 ? 'mk-era mk-era-r' : 'mk-era'} aria-hidden>{s.era[lang] || s.era.jp}</span>
          <div className="mk-photo">
            <img src={asset(s.src)} alt={s.cap.jp} width={s.w} height={s.h}
                 loading={i < 2 ? undefined : 'lazy'} />
          </div>
          <figcaption className="mk-cap">{s.cap[lang] || s.cap.jp}</figcaption>
        </figure>
      ))}

      <div className="mk-rule" />

      <T k="mk-p1" as="p" className="mk-fx" />
      <T k="mk-p2" as="p" className="mk-fx" />

      <T k="mk-sig" as="div" className="mk-sig" />

      <A href="/home" className="mk-back"><T k="mk-back" as="span" /></A>
    </div>
  );
}
