'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { asset } from '@/lib/paths';
import { useSite } from '@/components/Providers';
import { T } from '@/components/T';
import { MODERN } from '@/lib/decor';
import { AgeGate, ageVerified } from '@/components/AgeGate';
import { A } from '@/components/A';
import { isModern } from '@/lib/era';
import type { Lang } from '@/lib/i18n';

const KN: Record<Lang, [string, string, string]> = {
  jp: ['コン', 'コン', 'ギィ…'],
  en: ['knock', 'knock', 'creak…'],
  fr: ['toc', 'toc', 'crrr…'],
  zh: ['咚', '咚', '吱—'],
  ko: ['똑', '똑', '끼익…'],
};

let AC: AudioContext | null | false = null;
function ctx(): AudioContext | null {
  if (AC === null) {
    try { AC = new ((window as any).AudioContext || (window as any).webkitAudioContext)(); }
    catch { AC = false; }
  }
  return AC || null;
}
function thump(freq: number, dur: number, vol: number) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.35), c.currentTime + dur);
  f.type = 'lowpass'; f.frequency.value = 900;
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + dur);
  o.connect(f); f.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + dur + 0.05);
}
function creak() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(320, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.9);
  f.type = 'lowpass'; f.frequency.value = 1400;
  g.gain.setValueAtTime(0.05, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + 0.95);
  o.connect(f); f.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + 1);
}

const DOOR_SHOTS = [
  '/images/shop-sign.webp',
  '/images/photos/cheval-blanc-1929.jpg',
  '/images/photos/shelf-row.jpg',
  '/images/photos/gillet.jpg',
  '/images/showa30.webp',
  '/images/photos/rouget.jpg',
  '/images/photos/roch.jpg',
];


/* 扉の下に小さく置く、店の覚書でございます。
   検索の目に留まるよう、文と行き先だけを素直に置いております。 */
const DOOR_SEO: Record<Lang, { lead: string; meta: string; nav: [string, string][] }> = {
  jp: {
    lead: 'すむら酒店（洲村酒店）は山口県宇部市のワイン専門店です。ブルゴーニュを中心にフランス銘醸ワインを正規ルートで。ドメーヌ ド ラ ロマネ コンティ、ルロワ、ドーヴネ正規取扱店。',
    meta: '〒755-0072 山口県宇部市中村3-6-20 ／ 10:00〜18:30（火曜定休） ／ 0836-21-4721',
    nav: [['/store', 'オンラインストア'], ['/producers', 'お取り扱い生産者'], ['/about', '会社概要'], ['/access', 'アクセス'], ['/blog', 'ブログ'], ['/news', 'ニュース'], ['/contact', '問い合わせ']],
  },
  en: {
    lead: 'Liquor Shop Sumura (すむら酒店・洲村酒店) — a wine merchant in Ube, Yamaguchi, Japan. Burgundy above all, through official channels. Authorised stockist of Domaine de la Romanée-Conti, Leroy and d’Auvenay.',
    meta: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japan / 10:00–18:30, closed Tuesdays / +81 836-21-4721',
    nav: [['/en/store', 'Online store'], ['/en/producers', 'Growers'], ['/en/about', 'About us'], ['/en/access', 'Access'], ['/en/blog', 'Journal'], ['/en/news', 'News'], ['/en/contact', 'Contact']],
  },
  fr: {
    lead: 'Liquor Shop Sumura (すむら酒店・洲村酒店) — caviste à Ube, Yamaguchi, au Japon. La Bourgogne avant tout, en filière officielle. Dépositaire agréé de la Romanée-Conti, de Leroy et d’Auvenay.',
    meta: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japon / 10h00–18h30, fermé le mardi / +81 836-21-4721',
    nav: [['/fr/store', 'Boutique'], ['/fr/producers', 'Vignerons'], ['/fr/about', 'La maison'], ['/fr/access', 'Accès'], ['/fr/blog', 'Journal'], ['/fr/news', 'Actualités'], ['/fr/contact', 'Contact']],
  },
  zh: {
    lead: 'すむら酒店（洲村酒店）是日本山口县宇部市的葡萄酒专门店。以勃艮第为中心，正规渠道进货。罗曼尼·康帝、勒桦、多维内正规代理店。',
    meta: '日本山口县宇部市中村3-6-20（〒755-0072） ／ 10:00〜18:30（周二休息） ／ +81 836-21-4721',
    nav: [['/zh/store', '在线商店'], ['/zh/producers', '合作生产者'], ['/zh/about', '关于本店'], ['/zh/access', '交通'], ['/zh/blog', '博客'], ['/zh/news', '最新消息'], ['/zh/contact', '联系我们']],
  },
  ko: {
    lead: '스무라 주점(洲村酒店)은 일본 야마구치현 우베시의 와인 전문점입니다. 부르고뉴를 중심으로 정규 루트 매입. 로마네 콩티, 르로이, 도브네 정규 취급점.',
    meta: '〒755-0072 일본 야마구치현 우베시 나카무라 3-6-20 / 10:00〜18:30 (화요일 휴무) / +81 836-21-4721',
    nav: [['/ko/store', '온라인 스토어'], ['/ko/producers', '취급 생산자'], ['/ko/about', '회사 소개'], ['/ko/access', '오시는 길'], ['/ko/blog', '블로그'], ['/ko/news', '소식'], ['/ko/contact', '문의']],
  },
};

export function DoorPage() {
  const { lang, eraView } = useSite();
  const router = useRouter();
  const modern = isModern(eraView as any);

  const [knocking, setKnocking] = useState(false);
  const [opening, setOpening] = useState(false);
  const [flash, setFlash] = useState(false);
  const [doorShot, setDoorShot] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setDoorShot((n) => (n + 1) % DOOR_SHOTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  const [txt, setTxt] = useState('');
  const [txtKey, setTxtKey] = useState(0);
  const busy = useRef(false);

  /* 満20歳以上であることを確かめてから、扉が開きます */
  const [aged, setAged] = useState(true);
  useEffect(() => { setAged(ageVerified()); }, []);

  const open = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!ageVerified()) { setAged(false); document.querySelector('.age-gate')?.scrollIntoView({ block: 'center' }); return; }
    if (busy.current) return;
    busy.current = true;
    const w = KN[lang] || KN.jp;
    let n = 0;
    const step = () => {
      if (n < 2) {
        setKnocking(false);
        requestAnimationFrame(() => setKnocking(true));
        setTxt(w[n]); setTxtKey((k) => k + 1);
        thump(190, 0.16, 0.22);
        n++;
        setTimeout(step, 430);
      } else {
        setKnocking(false);
        setTxt(w[2]); setTxtKey((k) => k + 1);
        setOpening(true);
        creak();
        setTimeout(() => setFlash(true), 760);
        setTimeout(() => router.push('/home'), 1220);
      }
    };
    step();
  }, [lang, router]);

  return (
    <div className="door-page">
      <div className="torch l" /><div className="torch r" />

      <div id="pixtitle">
        <div><img src={asset('/images/title-jp.png')} alt="すむら酒店" width={460} height={100} /></div>
        <div><img src={asset('/images/title-en.png')} alt="Liquor Shop Sumura" width={440} height={48} /></div>
      </div>

      <div id="stage" className={`${knocking ? 'knocking ' : ''}${opening ? 'opening' : ''}`.trim() || undefined}>
        <div className="door-glow" />
        <div id="knocktxt" key={txtKey} className={txt ? 'show' : undefined}>{txt}</div>
        <a href="/home" title="扉を開く" id="doorlink" onClick={open}>
          <img className="door" src={asset('/images/door.png')} alt="すむら酒店の扉" width={360} />
        </a>
      </div>

      <div className="enter">
        <span className="blink">▶</span>{' '}
        <a href="#" onClick={open}><T k="index-knock" as="span" /></a>{' '}
        <span className="blink">◀</span>
      </div>

      <div className="note">
        <T k="index-tagline" as="span" /><br />すむら酒店 ／ Liquor Shop Sumura
      </div>

      <div id="pixbadge" style={{ marginTop: 8 }}>
        <span className="badge blink" style={{ color: '#ff0', borderColor: '#ff0' }}>ENTER</span>
      </div>

      {modern ? (
        <div className="mx-door-bg" aria-hidden>
          {DOOR_SHOTS.map((src, i) => (
            <div key={src} className={`mx-door-shot${i === doorShot ? ' is-on' : ''}`}
                 style={{ backgroundImage: `url(${asset(src)})` }} />
          ))}
          <div className="mx-door-veil" />
        </div>
      ) : null}

      <div id="modern-entrance">
        <h1 className="me-jp">すむら酒店</h1>
        <div className="me-en">Liquor Shop Sumura</div>
        <div className="me-rule" />
        <div className="me-sub">{modern ? MODERN[lang].sub : '山口・宇部　フランス銘醸ワインの店'}</div>
        {aged ? <a className="me-btn" href="/home" onClick={(e) => {
          e.preventDefault();
          if (!ageVerified()) { setAged(false); document.querySelector('.age-gate')?.scrollIntoView({ block: 'center' }); return; }
          router.push('/home');
        }}>
          {modern ? MODERN[lang].enter : '入店する'}
        </a> : null}
      </div>

      {!aged ? <AgeGate lang={lang} onPass={() => { setAged(true); router.push('/home'); }} /> : null}

      <T k="index-age" as="div" id="age-note" />

      <footer className="door-seo">
        <p>{(DOOR_SEO[lang] || DOOR_SEO.jp).lead}</p>
        <p>{(DOOR_SEO[lang] || DOOR_SEO.jp).meta}</p>
        <nav>
          {(DOOR_SEO[lang] || DOOR_SEO.jp).nav.map(([to, label]) => (
            <A key={to} href={to}>{label}</A>
          ))}
        </nav>
      </footer>

      <div id="flash" className={flash ? 'on' : undefined} />
    </div>
  );
}
