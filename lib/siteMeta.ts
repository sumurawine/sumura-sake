import type { Metadata } from 'next';

export const SITE = {
  url: 'https://sumura-sake.jp',
  name: 'すむら酒店',
  nameEn: 'Liquor Shop Sumura',
  tel: '0836-21-4721',
  zip: '755-0072',
  addr: '山口県宇部市中村3-6-20',
  addrEn: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japan',
  hours: '10:00〜18:30',
  closed: '火曜',
  ogImage: '/images/shop-sign.webp',
};

/** すべてのページに共通で付ける言い回し */
const SUFFIX = '｜すむら酒店（山口県宇部市のワイン専門店）';

type Page = { path: string; title: string; desc: string };

/**
 * ページごとの題名と説明文。
 * 題名は32文字前後、説明文は120文字前後を目安にしております
 * （検索結果で切られない長さです）。
 */
export const PAGES: Page[] = [
  {
    path: '/home',
    title: 'フランス銘醸ワインの専門店',
    desc: 'すむら酒店は山口県宇部市のワイン専門店です。ブルゴーニュを中心にボルドー、ローヌ、ジュラ、ロワールの銘醸ワインを正規ルートで取り揃えております。DRC、ルロワ、ドーヴネの正規取り扱いもございます。',
  },
  {
    path: '/producers',
    title: 'お取り扱い生産者｜DRC・ルロワ・ドーヴネほか',
    desc: 'ドメーヌ・ド・ラ・ロマネ・コンティ（DRC）、ドメーヌ・ルロワ、ドメーヌ・ドーヴネを正規でお取り扱いしております。そのほかブルゴーニュを中心とした60を超える生産者を、産地別にご紹介いたします。',
  },
  {
    path: '/store',
    title: 'オンラインストア｜在庫のワインを産地・生産者から',
    desc: '当店の在庫を産地別・生産者別にご覧いただけます。ブルゴーニュ、ボルドー、コート デュ ローヌ、ジュラ、ロワール、アルザス、イタリア、アメリカ、ウイスキーまで。',
  },
  {
    path: '/about',
    title: '会社概要',
    desc: '山口県宇部市中村のすむら酒店。店舗のご案内と、ワインを選ぶ私どもの考え方についてご説明しております。',
  },
  {
    path: '/access',
    title: 'アクセス｜山口県宇部市中村の実店舗',
    desc: `〒${SITE.zip} ${SITE.addr}。営業時間 ${SITE.hours}、${SITE.closed}定休。お電話 ${SITE.tel}。宇部市の実店舗へどうぞお越しくださいませ。`,
  },
  {
    path: '/news',
    title: 'お知らせ',
    desc: '入荷情報、プリムールのご予約受付、営業のご案内など、すむら酒店からのお知らせでございます。',
  },
  {
    path: '/blog',
    title: 'ブログ',
    desc: 'ワインのこと、造り手のこと、店先のこと。すむら酒店の店主が書き留めております。',
  },
  {
    path: '/contact',
    title: 'お問い合わせ',
    desc: 'ご希望の生産者・畑・年号をお知らせくださいませ。オンラインストアに掲載のない在庫、バックヴィンテージ、大判ボトルもお探しいたします。',
  },
  {
    path: '/legal',
    title: '特定商取引法に基づく表記',
    desc: 'すむら酒店の特定商取引法に基づく表記でございます。',
  },
  {
    path: '/secret',
    title: '非公開在庫',
    desc: 'web上に掲載しておりませんワインについてのご案内でございます。',
  },
  {
    path: '/',
    title: 'すむら酒店｜山口県宇部市のワイン専門店',
    desc: 'ブルゴーニュを中心としたフランス銘醸ワインを、山口県宇部市からお届けしております。DRC、ルロワ、ドーヴネの正規お取り扱いもございます。日本語・英語・フランス語・中国語・韓国語に対応しております。',
  },
  {
    path: '/mukashi',
    title: '昔のすむら酒店',
    desc: '昭和のころのすむら酒店の様子でございます。',
  },
  {
    path: '/game',
    title: 'ゲームコーナー',
    desc: '店番の合間に作りました、ちょっとした遊び場でございます。',
  },
];

/** 合言葉で入る部屋など、検索に載せないページ用 */
export function metaPrivate(title: string): Metadata {
  return {
    title: `${title}｜${SITE.name}`,
    robots: { index: false, follow: false },
  };
}

/** 各ページの page.tsx から呼びます */
export function metaFor(path: string): Metadata {
  const p = PAGES.find((x) => x.path === path);
  const title = p ? `${p.title}${SUFFIX}` : `${SITE.name} ｜ ${SITE.nameEn}`;
  const desc = p ? p.desc : `${SITE.name}は山口県宇部市のワイン専門店でございます。`;
  const canonical = SITE.url + path + '.html';
  const langs = ['en', 'fr', 'zh', 'ko'] as const;
  return {
    title,
    description: desc,
    alternates: {
      canonical,
      languages: {
        ja: canonical,
        ...Object.fromEntries(langs.map((l) => [l, `${canonical}?lang=${l}`])),
        'x-default': canonical,
      },
    },
    openGraph: {
      type: 'website',
      siteName: `${SITE.name} ｜ ${SITE.nameEn}`,
      title,
      description: desc,
      url: canonical,
      locale: 'ja_JP',
      alternateLocale: ['en_US', 'fr_FR', 'zh_CN', 'ko_KR'],
      images: [{ url: SITE.url + SITE.ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description: desc },
    robots: { index: true, follow: true },
  };
}
