import type { Metadata } from 'next';
import { SITE } from './siteMeta';
import type { Lang } from './i18n';
import type { Item, I18nData } from './store';
import { OTHER_LANGS, winePath, makerPath } from './slug';
import { catName, localized, vintageOf } from './wineText';

const LOC: Record<Lang, string> = { jp: 'ja_JP', en: 'en_US', fr: 'fr_FR', zh: 'zh_CN', ko: 'ko_KR' };
const TAG: Record<Lang, string> = { jp: 'ja', en: 'en', fr: 'fr', zh: 'zh', ko: 'ko' };

const SUF: Record<Lang, string> = {
  jp: '｜すむら酒店・洲村酒店（山口県宇部市のワイン専門店）',
  en: ' | Sumura すむら酒店, Ube, Japan',
  fr: ' | Liquor Shop Sumura, Ube, Japon',
  zh: ' | 日本宇部 すむら酒店',
  ko: ' | 일본 우베 스무라 주점',
};

const LEAD: Record<Lang, (n: string, p: string, r: string, pr: string, st: boolean) => string> = {
  jp: (n, p, r, pr, st) => `${n}${p ? `（${p}）` : ''}。${r}${pr ? `、${pr}` : ''}。${st ? '在庫がございます。' : 'お取り寄せのご相談を承ります。'}山口県宇部市のワイン専門店すむら酒店が、正規のルートでお届けいたします。`,
  en: (n, p, r, pr, st) => `${n}${p ? ` — ${p}` : ''}. ${r}${pr ? `, ${pr}` : ''}. ${st ? 'In stock now.' : 'Sold out — we may be able to source it.'} From Liquor Shop Sumura, a wine merchant in Ube, Yamaguchi, Japan.`,
  fr: (n, p, r, pr, st) => `${n}${p ? ` — ${p}` : ''}. ${r}${pr ? `, ${pr}` : ''}. ${st ? 'En stock.' : 'Épuisé — nous pouvons tenter de le trouver.'} Liquor Shop Sumura, caviste à Ube, Yamaguchi, Japon.`,
  zh: (n, p, r, pr, st) => `${n}${p ? `（${p}）` : ''}。${r}${pr ? `、${pr}` : ''}。${st ? '现有库存。' : '售罄，可代为寻找。'}日本山口县宇部市葡萄酒专门店すむら酒店。`,
  ko: (n, p, r, pr, st) => `${n}${p ? `(${p})` : ''}. ${r}${pr ? `, ${pr}` : ''}. ${st ? '재고 있습니다.' : '품절 — 구해 드릴 수 있습니다.'} 일본 야마구치현 우베시의 와인 전문점 스무라 주점.`,
};

export function wineMeta(it: Item, i18n: I18nData | null, lang: Lang, slug: string): Metadata {
  const L = localized(it, i18n, lang);
  const region = catName(it.cat, lang);
  const vin = vintageOf(it.name);
  const st = String(it.stock || '0') !== '0';
  const title = `${L.name}${SUF[lang]}`;
  const desc = LEAD[lang](L.name, L.producer, region, it.price, st).slice(0, 300);
  const canonical = SITE.url + winePath(slug, lang);
  const languages: Record<string, string> = { ja: SITE.url + winePath(slug, 'jp'), 'x-default': SITE.url + winePath(slug, 'jp') };
  OTHER_LANGS.forEach((l) => { languages[TAG[l]] = SITE.url + winePath(slug, l); });
  return {
    title, description: desc,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website', siteName: SITE.name, title, description: desc, url: canonical,
      locale: LOC[lang], images: [{ url: it.img || SITE.url + SITE.ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description: desc },
    robots: { index: true, follow: true },
  };
}

export function makerMeta(name: string, shown: string, lang: Lang, slug: string, n: number): Metadata {
  const H: Record<Lang, string> = {
    jp: `${shown}のワイン｜取り扱い${n}点`,
    en: `${shown} — wines we carry (${n})`,
    fr: `${shown} — nos vins (${n})`,
    zh: `${shown} 的葡萄酒｜共${n}款`,
    ko: `${shown}의 와인｜취급 ${n}점`,
  };
  const D: Record<Lang, string> = {
    jp: `${shown}のワインを${n}点お取り扱いしております。山口県宇部市のワイン専門店すむら酒店が、正規のルートでお届けいたします。在庫やヴィンテージのご相談も承ります。`,
    en: `We carry ${n} wines from ${shown}. Liquor Shop Sumura is a wine merchant in Ube, Yamaguchi, Japan, sourcing through official channels. Ask us about vintages and availability.`,
    fr: `Nous proposons ${n} vins de ${shown}. Liquor Shop Sumura, caviste à Ube, Yamaguchi, Japon, en filière officielle. Écrivez-nous pour les millésimes et la disponibilité.`,
    zh: `本店经营 ${shown} 的葡萄酒共 ${n} 款。日本山口县宇部市葡萄酒专门店すむら酒店，正规渠道进口。年份与库存欢迎垂询。`,
    ko: `${shown}의 와인을 ${n}점 취급하고 있습니다. 일본 야마구치현 우베시의 와인 전문점 스무라 주점이 정규 경로로 전해 드립니다.`,
  };
  const title = `${H[lang]}${SUF[lang]}`;
  const desc = D[lang];
  const canonical = SITE.url + makerPath(slug, lang);
  const languages: Record<string, string> = { ja: SITE.url + makerPath(slug, 'jp'), 'x-default': SITE.url + makerPath(slug, 'jp') };
  OTHER_LANGS.forEach((l) => { languages[TAG[l]] = SITE.url + makerPath(slug, l); });
  return {
    title, description: desc,
    alternates: { canonical, languages },
    openGraph: { type: 'website', siteName: SITE.name, title, description: desc, url: canonical, locale: LOC[lang] },
    robots: { index: true, follow: true },
  };
}

const IX: Record<Lang, { t: string; d: string }> = {
  jp: { t: '取り扱い銘柄の一覧｜産地・造り手から探す', d: 'すむら酒店がお取り扱いしてまいりましたワインの全銘柄を、産地ごと・造り手ごとに一覧にしております。一本ずつのページに生産者、アペラシオン、ヴィンテージ、在庫の別を記しております。' },
  en: { t: 'All the wines we carry — by region and producer', d: 'Every bottle Liquor Shop Sumura carries, listed by region and by producer. Each wine has its own page with producer, appellation, vintage and availability. A wine merchant in Ube, Yamaguchi, Japan.' },
  fr: { t: 'Tous nos vins — par région et par producteur', d: 'Tous les flacons proposés par Liquor Shop Sumura, classés par région et par producteur. Chaque vin a sa fiche : producteur, appellation, millésime, disponibilité. Caviste à Ube, Yamaguchi, Japon.' },
  zh: { t: '全部经营酒款一览｜按产地与生产者查找', d: '本店经营的全部葡萄酒，按产地与生产者列出。每款均设专属页面，载明生产者、法定产区、年份与库存。日本山口县宇部市葡萄酒专门店。' },
  ko: { t: '취급 전 품목 목록｜산지·생산자로 찾기', d: '스무라 주점이 취급해 온 모든 와인을 산지별·생산자별로 정리했습니다. 각 와인마다 생산자·아펠라시옹·빈티지·재고를 적은 전용 페이지가 있습니다.' },
};

export function indexMeta(lang: Lang): Metadata {
  const path = (l: Lang) => SITE.url + (l === 'jp' ? '' : '/' + l) + '/wines';
  const canonical = path(lang);
  const languages: Record<string, string> = { ja: path('jp'), 'x-default': path('jp') };
  OTHER_LANGS.forEach((l) => { languages[TAG[l]] = path(l); });
  const title = `${IX[lang].t}${SUF[lang]}`;
  return {
    title, description: IX[lang].d,
    alternates: { canonical, languages },
    openGraph: { type: 'website', siteName: SITE.name, title, description: IX[lang].d, url: canonical, locale: LOC[lang] },
    robots: { index: true, follow: true },
  };
}
