'use client';

import { useEffect } from 'react';
import { asset } from '@/lib/paths';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { useSite } from '@/components/Providers';
import type { Lang } from '@/lib/i18n';

type Shot = { src: string; era: Record<Lang, string>; cap: Record<Lang, string>; w: number; h: number };

/* 端末の一覧表示。写真の枚数に合わせて、その場でこしらえます */
const DOS: Record<Lang, (n: number, files: string) => string> = {
  jp: (n, f) => `SUMURA-DOS バージョン 6.20
(C)Copyright 洲村酒店 1998

C:¥SUMURA>dir
 ドライブ C のボリューム ラベルは SUMURA です
 ボリューム シリアル番号は 1998-0401 です
 C:¥SUMURA のディレクトリ

98-04-01  09:12  <DIR>          .
98-04-01  09:12  <DIR>          ..
${f}98-04-01  09:21          4,096  MUKASHI .TXT
       ${n + 1} 個のファイル        ${(n * 48640 + 4096).toLocaleString('en-US')} バイト
        2 個のディレクトリ  1,258,291,200 バイトの空き領域

C:¥SUMURA>type mukashi.txt`,
  en: (n, f) => `SUMURA-DOS Version 6.20
(C)Copyright SUMURA LIQUOR 1998

C:¥SUMURA>DIR
 Volume in drive C is SUMURA
 Volume Serial Number is 1998-0401
 Directory of C:¥SUMURA

98-04-01  09:12  <DIR>          .
98-04-01  09:12  <DIR>          ..
${f}98-04-01  09:21          4,096  MUKASHI .TXT
       ${n + 1} File(s)        ${(n * 48640 + 4096).toLocaleString('en-US')} bytes
        2 Dir(s)     1,258,291,200 bytes free

C:¥SUMURA>TYPE MUKASHI.TXT`,
  fr: (n, f) => `SUMURA-DOS Version 6.20
(C)Copyright SUMURA LIQUOR 1998

C:¥SUMURA>DIR
 Volume dans le lecteur C : SUMURA
 Numero de serie du volume : 1998-0401
 Repertoire de C:¥SUMURA

98-04-01  09:12  <DIR>          .
98-04-01  09:12  <DIR>          ..
${f}98-04-01  09:21          4,096  MUKASHI .TXT
       ${n + 1} fichier(s)        ${(n * 48640 + 4096).toLocaleString('en-US')} octets
        2 repertoire(s)  1,258,291,200 octets libres

C:¥SUMURA>TYPE MUKASHI.TXT`,
  zh: (n, f) => `SUMURA-DOS 版本 6.20
(C)Copyright 洲村酒店 1998

C:¥SUMURA>DIR
 驱动器 C 中的卷是 SUMURA
 卷的序列号是 1998-0401
 C:¥SUMURA 的目录

98-04-01  09:12  <DIR>          .
98-04-01  09:12  <DIR>          ..
${f}98-04-01  09:21          4,096  MUKASHI .TXT
       ${n + 1} 个文件        ${(n * 48640 + 4096).toLocaleString('en-US')} 字节
        2 个目录  1,258,291,200 可用字节

C:¥SUMURA>TYPE MUKASHI.TXT`,
  ko: (n, f) => `SUMURA-DOS 버전 6.20
(C)Copyright SUMURA 1998

C:¥SUMURA>DIR
 C 드라이브의 볼륨 레이블은 SUMURA
 볼륨 일련 번호는 1998-0401
 C:¥SUMURA 디렉터리

98-04-01  09:12  <DIR>          .
98-04-01  09:12  <DIR>          ..
${f}98-04-01  09:21          4,096  MUKASHI .TXT
       ${n + 1}개 파일        ${(n * 48640 + 4096).toLocaleString('en-US')} 바이트
        2개 디렉터리  1,258,291,200 바이트 남음

C:¥SUMURA>TYPE MUKASHI.TXT`,
};

/** 写真の数だけ、記録の行をこしらえます */
function fileLines(n: number): string {
  let out = '';
  for (let i = 1; i <= n; i++) {
    const mm = String(12 + Math.floor((i - 1) / 4)).padStart(2, '0');
    const ss = String(15 + ((i * 7) % 40)).padStart(2, '0');
    const size = (46000 + ((i * 2731) % 9000)).toLocaleString('en-US');
    out += `98-04-01  09:${mm}       ${size.padStart(9, ' ')}  KIOKU_${String(i).padStart(2, '0')}.JPG\n`;
  }
  return out;
}

const D50 = { jp: '1950年代', en: 'the 1950s', fr: 'années 1950', zh: '1950年代', ko: '1950년대' };
const D60 = { jp: '1960年代', en: 'the 1960s', fr: 'années 1960', zh: '1960年代', ko: '1960년대' };
const D70 = { jp: '1970年代', en: 'the 1970s', fr: 'années 1970', zh: '1970年代', ko: '1970년대' };
const D80 = { jp: '1980年代', en: 'the 1980s', fr: 'années 1980', zh: '1980年代', ko: '1980년대' };
const D90 = { jp: '1990年代', en: 'the 1990s', fr: 'années 1990', zh: '1990年代', ko: '1990년대' };

/* 年代の古い順に。切り出しは店主の手によるものです */
const SHOTS: Shot[] = [
  { src: '/images/showa30.webp', w: 900, h: 693, era: D50,
    cap: { jp: '初代の店先', en: 'The shop in its first generation',
           fr: 'La boutique à ses débuts', zh: '初代的店门前', ko: '초대의 가게 앞' } },
  { src: '/images/showa30-sofu.webp', w: 718, h: 1096, era: D50,
    cap: { jp: '二代目 ── 上宇部に店を移した頃', en: 'The second generation, when the shop moved to Kami-Ube',
           fr: 'La deuxième génération, lors du déménagement à Kami-Ube',
           zh: '第二代 ── 迁店至上宇部的时候', ko: '2대 ── 가미우베로 가게를 옮긴 무렵' } },
  { src: '/images/mukashi/1960-inside.webp', w: 1600, h: 1019, era: D60,
    cap: { jp: '旧店舗の店内', en: 'Inside the old shop', fr: 'À l’intérieur de l’ancienne boutique',
           zh: '旧店铺的店内', ko: '옛 가게의 안' } },
  { src: '/images/mukashi/1970-shop.webp', w: 1600, h: 1072, era: D70,
    cap: { jp: '四代目 博志。ビール箱を積んだ店先で', en: 'Hiroshi, the fourth generation, among the stacked beer crates',
           fr: 'Hiroshi, quatrième génération, parmi les caisses de bière',
           zh: '第四代 博志。在堆满啤酒箱的店门前', ko: '4대 히로시. 맥주 상자를 쌓아 둔 가게 앞에서' } },
  { src: '/images/mukashi/1980-okami.webp', w: 1073, h: 1600, era: D80,
    cap: { jp: '三代目 保美', en: 'Yasumi, the third generation', fr: 'Yasumi, troisième génération',
           zh: '第三代 保美', ko: '3대 야스미' } },
  { src: '/images/mukashi/1980-front.webp', w: 1568, h: 1600, era: D80,
    cap: { jp: '店先', en: 'The shopfront', fr: 'Devant la boutique', zh: '店门前', ko: '가게 앞' } },
  { src: '/images/mukashi/1982-street.webp', w: 1600, h: 1083, era: D80,
    cap: { jp: '祭りの日の店先', en: 'The shopfront on the day of the festival',
           fr: 'Devant la boutique, un jour de fête', zh: '祭典之日的店门前', ko: '축제날의 가게 앞' } },
  { src: '/images/mukashi/1984-sadao.webp', w: 1600, h: 1079, era: D80,
    cap: { jp: '三代目 貞男。帳場に立つ', en: 'Sadao, the third generation, at the counter',
           fr: 'Sadao, troisième génération, au comptoir', zh: '第三代 贞男。站在柜台前',
           ko: '3대 사다오. 계산대에 서서' } },
  { src: '/images/mukashi/1988-front.webp', w: 1600, h: 1515, era: D80,
    cap: { jp: '1988年　店先', en: 'The shopfront, 1988', fr: 'Devant la boutique, 1988',
           zh: '1988年 店门前', ko: '1988년 가게 앞' } },
  { src: '/images/mukashi/1990-inside1.webp', w: 1600, h: 1117, era: D90,
    cap: { jp: '店内。フランスの棚', en: 'Inside the shop ── the French shelves',
           fr: 'À l’intérieur ── le rayon français', zh: '店内。法国酒的货架', ko: '가게 안. 프랑스 진열대' } },
  { src: '/images/mukashi/1990-inside2.webp', w: 1092, h: 1600, era: D90,
    cap: { jp: '店内。ワインの棚', en: 'Inside the shop ── the wine shelves',
           fr: 'À l’intérieur ── le rayon des vins', zh: '店内。葡萄酒的货架', ko: '가게 안. 와인 진열대' } },
  { src: '/images/mukashi/1999-family.webp', w: 1600, h: 1122, era: D90,
    cap: { jp: '四代目 博志と亜矢子、友人のトムとショーナ。五代目の歩を抱いて',
           en: 'Hiroshi and Ayako of the fourth generation, with their friends Tom and Shona, holding Ayumu of the fifth',
           fr: 'Hiroshi et Ayako, quatrième génération, avec leurs amis Tom et Shona, portant Ayumu, cinquième génération',
           zh: '第四代 博志与亚矢子，友人汤姆与肖娜。怀抱第五代 步',
           ko: '4대 히로시와 아야코, 친구 톰과 쇼나. 5대 아유무를 안고' } },
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
      <pre className="mk-dos">{(DOS[lang] || DOS.jp)(SHOTS.length, fileLines(SHOTS.length))}</pre>
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
