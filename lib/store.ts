import type { Lang } from './i18n';

export type Item = {
  id: string; name: string; price: string; img: string;
  cat: string; prod?: string; stock: string; desc?: string;
  notes?: string[]; ap?: string;
};
export type ProductData = { generated: string; count: number; items: Item[] };
export type I18nData = {
  notes?: Record<string, Record<string, string>>;
  items?: Record<string, { name?: Record<string, string> }>;
  descs?: Record<string, Record<string, string>>;
  producers?: Record<string, Record<string, string>>;
  aps?: Record<string, Record<string, string>>;
};

export const CATS: Record<string, Record<Lang, string>> = {
  burgundy: { jp: 'フランス ブルゴーニュ', en: 'Burgundy, France', fr: 'Bourgogne, France', zh: '法国 勃艮第', ko: '프랑스 부르고뉴' },
  rhone: { jp: 'フランス コート デュ ローヌ', en: 'Côtes du Rhône, France', fr: 'Côtes du Rhône, France', zh: '法国 罗讷河谷', ko: '프랑스 코트 뒤 론' },
  jura: { jp: 'フランス ジュラ', en: 'Jura, France', fr: 'Jura, France', zh: '法国 汝拉', ko: '프랑스 쥐라' },
  loire: { jp: 'フランス ヴァル ド ロワール', en: 'Val de Loire, France', fr: 'Val de Loire, France', zh: '法国 卢瓦尔河谷', ko: '프랑스 발 드 루아르' },
  alsace: { jp: 'フランス アルザス', en: 'Alsace, France', fr: 'Alsace, France', zh: '法国 阿尔萨斯', ko: '프랑스 알자스' },
  bordeaux: { jp: 'フランス ボルドー', en: 'Bordeaux, France', fr: 'Bordeaux, France', zh: '法国 波尔多', ko: '프랑스 보르도' },
  usa: { jp: 'アメリカ', en: 'United States', fr: 'États-Unis', zh: '美国', ko: '미국' },
  australia: { jp: 'オーストラリア', en: 'Australia', fr: 'Australie', zh: '澳大利亚', ko: '호주' },
  italy: { jp: 'イタリア', en: 'Italy', fr: 'Italie', zh: '意大利', ko: '이탈리아' },
  whisky: { jp: 'ウイスキー', en: 'Whisky', fr: 'Whisky', zh: '威士忌', ko: '위스키' },
  other: { jp: 'その他', en: 'Other', fr: 'Autres', zh: '其他', ko: '기타' },
};

export const ORDER = ['burgundy','rhone','jura','loire','alsace','bordeaux','italy','usa','australia','whisky','other'];

export const UI: Record<string, Record<Lang, string>> = {
  soldout: { jp: '在庫切れ', en: 'Sold out', fr: 'Épuisé', zh: '售罄', ko: '품절' },
  detail: { jp: '▶ 詳細', en: '▶ Details', fr: '▶ Détails', zh: '▶ 详情', ko: '▶ 상세' },
  items: { jp: '点', en: ' items', fr: ' articles', zh: '款', ko: '점' },
  cta: { jp: '■ この商品について問い合わせる', en: '■ Enquire about this bottle', fr: '■ Nous contacter à ce sujet', zh: '■ 点此咨询本商品', ko: '■ 이 상품에 대해 문의하기' },
  page: { jp: '専用ページ', en: 'Full page', fr: 'Fiche complète', zh: '专属页面', ko: '전용 페이지' },
  prod: { jp: '生産者', en: 'Producer', fr: 'Producteur', zh: '生产者', ko: '생산자' },
  err: { jp: '商品情報を読み込めませんでした。', en: 'Could not load the product list.', fr: 'Impossible de charger la liste des produits.', zh: '无法载入商品资讯。', ko: '상품 정보를 불러올 수 없습니다.' },
  modeArea: { jp: '◆ 産地から選ぶ', en: '◆ By region', fr: '◆ Par région', zh: '◆ 按产地选择', ko: '◆ 산지로 고르기' },
  modeProd: { jp: '◆ 生産者から選ぶ', en: '◆ By producer', fr: '◆ Par producteur', zh: '◆ 按生产者选择', ko: '◆ 생산자로 고르기' },
  subArea: { jp: '▼ さらに細かい産地・村名で絞り込む', en: '▼ Narrow down by appellation', fr: '▼ Affiner par appellation', zh: '▼ 按更细的产区・村庄筛选', ko: '▼ 더 세부 산지・마을로 좁히기' },
  subProd: { jp: '▼ 生産者を選ぶ', en: '▼ Choose a producer', fr: '▼ Choisir un producteur', zh: '▼ 选择生产者', ko: '▼ 생산자 선택' },
  allArea: { jp: 'すべての産地', en: 'All appellations', fr: 'Toutes les appellations', zh: '全部产区', ko: '모든 산지' },
  allProd: { jp: 'すべての生産者', en: 'All producers', fr: 'Tous les producteurs', zh: '全部生产者', ko: '모든 생산자' },
  allCat: { jp: 'すべて', en: 'All', fr: 'Tout', zh: '全部', ko: '전체' },
  stockOff: { jp: '□ 在庫のある商品のみ表示', en: '□ Show in-stock only', fr: '□ Afficher seulement les vins en stock', zh: '□ 仅显示有货商品', ko: '□ 재고 있는 상품만 표시' },
  stockOn: { jp: '■ 在庫のある商品のみ表示中', en: '■ Showing in-stock only', fr: '■ Seulement les vins en stock', zh: '■ 正在仅显示有货商品', ko: '■ 재고 있는 상품만 표시 중' },
  hits: { jp: '該当 %n 点', en: '%n items', fr: '%n articles', zh: '共 %n 款', ko: '%n 점' },
  none: { jp: '該当する商品がありません。条件を変えてお試しください。', en: 'No wines match. Please try different filters.', fr: 'Aucun vin ne correspond. Essayez d’autres critères.', zh: '没有符合条件的商品，请更换条件试试。', ko: '해당하는 상품이 없습니다. 조건을 바꿔 보세요.' },
};

export const u = (k: string, lang: Lang) => UI[k]?.[lang] ?? UI[k]?.jp ?? '';

export function dkey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 'd' + h.toString(36) + '_' + s.length;
}

/** 値の見せ方。日本語は「3,300円」、ほかの言語では「¥3,300」 */
export function yenOf(p: string | undefined, lang: Lang): string {
  const s = String(p || '').trim();
  if (!s || lang === 'jp') return s;
  const n = s.replace(/[^0-9,]/g, '');
  return n ? '¥' + n : s;
}

export const isOut = (it: Item) => String(it.stock).trim() === '0';

export function nameOf(it: Item, lang: Lang, I: I18nData | null) {
  if (lang === 'jp') return it.name;
  return I?.items?.[it.id]?.name?.[lang] || it.name;
}
export function descOf(it: Item, lang: Lang, I: I18nData | null) {
  if (!it.desc) return '';
  if (lang === 'jp') return it.desc;
  return I?.descs?.[dkey(it.desc)]?.[lang] || it.desc;
}
export function notesOf(it: Item, lang: Lang, I: I18nData | null) {
  const ns = it.notes || [];
  if (!ns.length) return [];
  if (lang === 'jp') return ns;
  return ns.map((k) => I?.notes?.[k]?.[lang] || k);
}
export function prodOf(name: string | undefined, lang: Lang, I: I18nData | null) {
  if (!name) return '';
  if (lang === 'jp') return name;
  return I?.producers?.[name]?.[lang] || name;
}
export function apOf(key: string | undefined, lang: Lang, I: I18nData | null) {
  const k = key || 'other';
  const o = I?.aps?.[k];
  return (o && (o[lang] || o.jp)) || k;
}
export const catOf = (c: string, lang: Lang) => (CATS[c] || CATS.other)[lang] || (CATS[c] || CATS.other).jp;


/** 日付の中の日本語の曜日「(水)」を、その言語の言い方に置き換えます */
const DOW: Record<string, Record<Lang, string>> = {
  '日': { jp: '日', en: 'Sun', fr: 'dim', zh: '日', ko: '일' },
  '月': { jp: '月', en: 'Mon', fr: 'lun', zh: '一', ko: '월' },
  '火': { jp: '火', en: 'Tue', fr: 'mar', zh: '二', ko: '화' },
  '水': { jp: '水', en: 'Wed', fr: 'mer', zh: '三', ko: '수' },
  '木': { jp: '木', en: 'Thu', fr: 'jeu', zh: '四', ko: '목' },
  '金': { jp: '金', en: 'Fri', fr: 'ven', zh: '五', ko: '금' },
  '土': { jp: '土', en: 'Sat', fr: 'sam', zh: '六', ko: '토' },
};
export function dateOf(s: string | undefined, lang: Lang): string {
  const v = String(s || '').trim();
  if (!v || lang === 'jp') return v;
  return v
    .replace(/[（(]\s*([日月火水木金土])\s*[）)]/g, (_m, d) => '(' + (DOW[d]?.[lang] || d) + ')')
    .replace(/(\d+)年\s*(\d+)月\s*(\d+)日/g, (_m, y, mo, da) => y + '.' + mo + '.' + da)
    .replace(/(\d+)年\s*(\d+)月/g, (_m, y, mo) => y + '.' + mo);
}

/** ブログの分類。表にない言葉は、そのまま出します */
export const BLOG_CATS: Record<string, Record<Lang, string>> = {
  '雑感': { jp: '雑感', en: 'Musings', fr: 'Réflexions', zh: '随想', ko: '단상' },
  '試飲': { jp: '試飲', en: 'Tastings', fr: 'Dégustations', zh: '试饮', ko: '시음' },
  'プリムール': { jp: 'プリムール', en: 'En primeur', fr: 'Primeurs', zh: '期酒', ko: '프리뫼르' },
  '入荷': { jp: '入荷', en: 'New arrivals', fr: 'Arrivages', zh: '到货', ko: '입고' },
  'お知らせ': { jp: 'お知らせ', en: 'Notices', fr: 'Annonces', zh: '通知', ko: '공지' },
  '催し': { jp: '催し', en: 'Events', fr: 'Événements', zh: '活动', ko: '행사' },
  '造り手': { jp: '造り手', en: 'Producers', fr: 'Vignerons', zh: '生产者', ko: '생산자' },
  '産地': { jp: '産地', en: 'Regions', fr: 'Régions', zh: '产区', ko: '산지' },
  '食卓': { jp: '食卓', en: 'At the table', fr: 'À table', zh: '餐桌', ko: '식탁' },
  '店より': { jp: '店より', en: 'From the shop', fr: 'De la boutique', zh: '来自本店', ko: '가게에서' },
};
export const blogCatOf = (c: string | undefined, lang: Lang): string => {
  const v = String(c || '').trim();
  if (!v || lang === 'jp') return v;
  return BLOG_CATS[v]?.[lang] || v;
};
