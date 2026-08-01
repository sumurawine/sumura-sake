import type { Lang } from './i18n';

/** ページ見出しまわりの文言 */
export const PR_COPY: Record<Lang, {
  head: string; sub: string; lead: string;
  listHead: string; listLead: string;
  askHead: string; askBody: string; askBtn: string;
  storeBtn: string; itemsUnit: string;
}> = {
  jp: {
    head: '■ お取り扱い生産者 ■',
    sub: '▼ 当店がお届けしている造り手 ▼',
    lead: 'すむら酒店は山口県宇部市の酒販店でございます。ブルゴーニュを軸に、ボルドー、コート デュ ローヌ、ジュラ、ロワール、アルザス、そしてイタリア・アメリカ・オーストラリアの造り手まで、正規のルートで仕入れたワインをお届けしております。以下は現在お取り扱いのある主な生産者でございます。',
    listHead: '◆ 産地別 お取り扱い生産者',
    listLead: '生産者名を押していただきますと、その造り手のワイン、またはお問い合わせにお進みいただけます。',
    askHead: 'お探しの一本がございましたら',
    askBody: 'こちらに載せておりますのは、当店の在庫のごく一部でございます。生産者名・畑名・年号をお知らせいただければ、お探しいたします。バックヴィンテージやマグナム以上の大判ボトルも承っております。',
    askBtn: '■ 在庫をお問い合わせいただく',
    storeBtn: '■ オンラインストアを見る',
    itemsUnit: '点',
  },
  en: {
    head: '■ PRODUCERS WE CARRY ■',
    sub: '▼ The growers behind our shelves ▼',
    lead: 'Liquor Shop Sumura is a wine merchant in Ube, Yamaguchi, Japan. Burgundy is our backbone, alongside Bordeaux, the Rhône, the Jura, the Loire and Alsace, as well as growers in Italy, the United States and Australia — all sourced through official channels. Below are the principal producers we currently carry.',
    listHead: '◆ Producers by region',
    listLead: 'Select a name to see that grower’s wines, or to send us an enquiry.',
    askHead: 'Looking for something in particular?',
    askBody: 'What is shown here is only a fraction of our cellar. Tell us the grower, the vineyard and the vintage, and we will look for it — including back vintages and large formats.',
    askBtn: '■ Ask us about stock',
    storeBtn: '■ Visit the online store',
    itemsUnit: ' wines',
  },
  fr: {
    head: '■ NOS VIGNERONS ■',
    sub: '▼ Les domaines que nous représentons ▼',
    lead: 'Liquor Shop Sumura est un caviste établi à Ube, préfecture de Yamaguchi, au Japon. La Bourgogne est notre colonne vertébrale, aux côtés de Bordeaux, du Rhône, du Jura, de la Loire et de l’Alsace, ainsi que de vignerons d’Italie, des États-Unis et d’Australie — le tout par les circuits officiels. Voici les principaux domaines actuellement disponibles.',
    listHead: '◆ Vignerons par région',
    listLead: 'Cliquez sur un nom pour voir les vins du domaine ou nous adresser une demande.',
    askHead: 'Vous cherchez une bouteille précise ?',
    askBody: 'Ce qui figure ici ne représente qu’une part infime de notre cave. Donnez-nous le domaine, le climat et le millésime : nous chercherons pour vous, y compris les vieux millésimes et les grands formats.',
    askBtn: '■ Nous interroger sur le stock',
    storeBtn: '■ Voir la boutique en ligne',
    itemsUnit: ' vins',
  },
  zh: {
    head: '■ 经销生产者 ■',
    sub: '▼ 本店供应的造酒人 ▼',
    lead: '寿村酒店（すむら酒店）是位于日本山口县宇部市的葡萄酒专门店。以勃艮第为核心，兼及波尔多、罗讷河谷、汝拉、卢瓦尔、阿尔萨斯，以及意大利、美国、澳大利亚的生产者，全部经由正规渠道进货。以下为目前经销的主要生产者。',
    listHead: '◆ 按产地分类的生产者',
    listLead: '点击名称即可查看该造酒人的葡萄酒，或向我们咨询。',
    askHead: '若有想寻的一瓶',
    askBody: '此处所列仅为本店库存的极小部分。请告知生产者、园名与年份，我们代为寻找。陈年份与大瓶装亦可承接。',
    askBtn: '■ 咨询库存',
    storeBtn: '■ 前往网上商店',
    itemsUnit: '款',
  },
  ko: {
    head: '■ 취급 생산자 ■',
    sub: '▼ 저희가 전해 드리는 造り手 ▼',
    lead: '스무라 주점(すむら酒店)은 일본 야마구치현 우베시의 와인 전문점입니다. 부르고뉴를 중심으로 보르도, 론, 쥐라, 루아르, 알자스, 그리고 이탈리아·미국·호주의 생산자까지 정규 루트로 들여온 와인을 전해 드리고 있습니다. 아래는 현재 취급 중인 주요 생산자입니다.',
    listHead: '◆ 산지별 취급 생산자',
    listLead: '이름을 누르시면 해당 생산자의 와인을 보시거나 문의로 이동하실 수 있습니다.',
    askHead: '찾으시는 한 병이 있다면',
    askBody: '여기에 실린 것은 재고의 극히 일부입니다. 생산자·밭 이름·빈티지를 알려 주시면 찾아 드립니다. 백 빈티지와 대용량 보틀도 가능합니다.',
    askBtn: '■ 재고 문의하기',
    storeBtn: '■ 온라인 숍 보기',
    itemsUnit: '점',
  },
};

/** オンラインストアに載せていない造り手。産地別の一覧にそのまま並べます */
export type Extra = { jp: string; latin: string; cat: string };

export const EXTRA: Extra[] = [
  { jp: 'ドメーヌ ド ラ ロマネ コンティ', latin: 'Domaine de la Romanée-Conti', cat: 'burgundy' },
  { jp: 'ドメーヌ ルロワ', latin: 'Domaine Leroy', cat: 'burgundy' },
  { jp: 'ドメーヌ ドーヴネ', latin: "Domaine d'Auvenay", cat: 'burgundy' },
  { jp: 'エマニュエル ルジェ', latin: 'Emmanuel Rouget', cat: 'burgundy' },
  { jp: 'ドメーヌ ジョルジュ ルーミエ', latin: 'Domaine Georges Roumier', cat: 'burgundy' },
];
