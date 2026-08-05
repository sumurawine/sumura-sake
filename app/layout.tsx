import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { LangBar } from '@/components/LangBar';
import { Tidy } from '@/components/Tidy';
import { EditorMount } from '@/components/editor/Mount';
import { TimeTravel } from '@/components/TimeTravel';
import { SITE } from '@/lib/siteMeta';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
/** CSSを変えたら数字を上げてください（ブラウザのキャッシュ対策） */
const CSSV = process.env.NEXT_PUBLIC_CSSV || String(Date.now());

export const metadata: Metadata = {
  title: 'すむら酒店 ｜ Liquor Shop Sumura',
};

/** お店そのものの情報。Googleに「宇部市のワイン専門店」だと伝えます */
const shopLd = {
  '@context': 'https://schema.org',
  '@type': ['Store', 'LocalBusiness'],
  '@id': SITE.url + '/#shop',
  name: SITE.name,
  alternateName: [
    SITE.nameEn, 'すむら酒店', '洲村酒店', 'スムラ酒店', 'すむら', '洲村',
    'Sumura', 'Sumura Sake', 'Sumura Saketen', 'Liquor Shop SUMURA',
  ],
  url: SITE.url + '/home.html',
  sameAs: [
    'https://sumura-sake.com/',
    'https://www.instagram.com/sumurasake',
  ],
  telephone: '+81-836-21-4721',
  image: SITE.url + SITE.ogImage,
  priceRange: '¥¥¥',
  description:
    'すむら酒店（洲村酒店／Liquor Shop Sumura）は山口県宇部市のワイン専門店でございます。ブルゴーニュを中心に、ボルドー、コート デュ ローヌ、ジュラ、ロワール、アルザスの銘醸ワインを正規のルートでお届けしております。ドメーヌ・ド・ラ・ロマネ・コンティ（DRC）、ドメーヌ・ルロワ、ドメーヌ・ドーヴネの正規お取り扱いもございます。',
  address: {
    '@type': 'PostalAddress',
    postalCode: SITE.zip,
    addressCountry: 'JP',
    addressRegion: '山口県',
    addressLocality: '宇部市',
    streetAddress: '中村3-6-20',
  },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '10:00',
    closes: '18:30',
  }],
  areaServed: { '@type': 'Country', name: '日本' },
  /* 取扱い銘柄は brand として持たせます（名無しの Product を作らないため） */
  brand: [
    'Domaine de la Romanée-Conti',
    'Domaine Leroy',
    "Domaine d'Auvenay",
  ].map((n) => ({ '@type': 'Brand', name: n })),
};

const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE.url + '/#site',
  url: SITE.url + '/home.html',
  sameAs: [
    'https://sumura-sake.com/',
    'https://www.instagram.com/sumurasake',
  ],
  name: SITE.name + ' ｜ ' + SITE.nameEn,
  inLanguage: ['ja', 'en', 'fr', 'zh', 'ko'],
  publisher: { '@id': SITE.url + '/#shop' },
};

/** 描画前に時代を反映してチラつきを防ぎます */
const eraInit = `(function(){try{
var e=localStorage.getItem('era');if(e==='2000'){e='2005';localStorage.setItem('era',e);}
var ok=['1995','2005','2010','now'];if(ok.indexOf(e)<0)e='now';
if(/\\/mukashi\\/?$/.test(location.pathname))e='mukashi';
document.documentElement.setAttribute('data-era',e);
}catch(x){document.documentElement.setAttribute('data-era','now');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-era="now">
      <head>
        <link rel="stylesheet" href={`${BP}/base.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/eras.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/modern.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/couture.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/editor.css?v=${CSSV}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=DotGothic16&family=Shippori+Mincho:wght@400;600&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: eraInit }} />
        <script src={`${BP}/ov.js?v=${CSSV}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shopLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body>
        <Providers>
          {children}
          <LangBar />
          <TimeTravel />
          <Tidy />
          <EditorMount />
        </Providers>
      </body>
    </html>
  );
}
