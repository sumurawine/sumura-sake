import type { Lang } from './i18n';

/** ページ見出しまわりの文言 */
export const PR_COPY: Record<Lang, {
  head: string; sub: string; lead: string;
  rareHead: string; rareLead: string;
  listHead: string; listLead: string;
  askHead: string; askBody: string; askBtn: string;
  storeBtn: string; itemsUnit: string;
}> = {
  jp: {
    head: '■ お取り扱い生産者 ■',
    sub: '▼ 当店がお届けしている造り手 ▼',
    lead: 'すむら酒店は山口県宇部市の酒販店でございます。ブルゴーニュを軸に、ボルドー、コート デュ ローヌ、ジュラ、ロワール、アルザス、そしてイタリア・アメリカ・オーストラリアの造り手まで、正規のルートで仕入れたワインをお届けしております。以下は現在お取り扱いのある主な生産者でございます。',
    rareHead: '◆ とりわけ入手の難しい造り手',
    rareLead: '次の三者につきましては、正規のお取り扱いがございます。いずれも割り当てが極めて少なく、オンラインストアには掲載しておりません。ご希望の銘柄・年号がございましたら、お問い合わせよりお知らせくださいませ。入荷の折にご案内を差し上げております。',
    listHead: '◆ 産地別 お取り扱い生産者',
    listLead: 'オンラインストアに掲載のある生産者でございます。生産者名を押していただきますと、その造り手のワインをご覧いただけます。',
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
    rareHead: '◆ The hardest bottles to find',
    rareLead: 'We are an authorised stockist for the three domaines below. Allocations are minuscule, so they do not appear in the online store. If you are looking for a particular cuvée or vintage, please get in touch and we will let you know when it arrives.',
    listHead: '◆ Producers by region',
    listLead: 'These growers appear in our online store. Select a name to see their wines.',
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
    rareHead: '◆ Les flacons les plus difficiles à trouver',
    rareLead: 'Nous sommes dépositaire officiel des trois domaines ci-dessous. Les allocations étant infimes, ils ne figurent pas dans la boutique en ligne. Indiquez-nous la cuvée et le millésime recherchés : nous vous préviendrons dès l’arrivage.',
    listHead: '◆ Vignerons par région',
    listLead: 'Ces domaines figurent dans notre boutique en ligne. Cliquez sur un nom pour voir ses vins.',
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
    rareHead: '◆ 尤其一瓶难求的造酒人',
    rareLead: '以下三家酒庄，本店拥有正规经销资格。因配额极少，未在网上商店刊载。如您有心仪的酒款或年份，欢迎与我们联系，到货时将第一时间奉告。',
    listHead: '◆ 按产地分类的生产者',
    listLead: '以下为网上商店刊载的生产者。点击名称即可查看该造酒人的葡萄酒。',
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
    rareHead: '◆ 특히 구하기 어려운 생산자',
    rareLead: '아래 세 도멘은 정규 취급 자격을 갖추고 있습니다. 배정량이 극히 적어 온라인 숍에는 게재하지 않습니다. 원하시는 퀴베나 빈티지가 있으시면 문의해 주세요. 입고 시 안내해 드립니다.',
    listHead: '◆ 산지별 취급 생산자',
    listLead: '온라인 숍에 게재된 생산자입니다. 이름을 누르시면 해당 생산자의 와인을 보실 수 있습니다.',
    askHead: '찾으시는 한 병이 있다면',
    askBody: '여기에 실린 것은 재고의 극히 일부입니다. 생산자·밭 이름·빈티지를 알려 주시면 찾아 드립니다. 백 빈티지와 대용량 보틀도 가능합니다.',
    askBtn: '■ 재고 문의하기',
    storeBtn: '■ 온라인 숍 보기',
    itemsUnit: '점',
  },
};

export type Featured = {
  key: string;
  jp: string;      // 日本語の呼び名
  latin: string;   // 現地表記
  also: string[];  // よく使われる別の呼び方
  region: Record<Lang, string>;
  body: Record<Lang, string>;
};

/** 正規のお取り扱いがあり、オンラインストアには載せていない造り手 */
export const FEATURED: Featured[] = [
  {
    key: 'drc',
    jp: 'ドメーヌ・ド・ラ・ロマネ・コンティ',
    latin: 'Domaine de la Romanée-Conti',
    also: ['DRC', 'ロマネ・コンティ', 'Romanée-Conti', 'ラ・ターシュ', 'La Tâche', 'リシュブール', 'Richebourg', 'エシェゾー', 'Échézeaux'],
    region: {
      jp: 'ブルゴーニュ ／ ヴォーヌ・ロマネ', en: 'Burgundy / Vosne-Romanée', fr: 'Bourgogne / Vosne-Romanée',
      zh: '勃艮第 / 沃恩·罗曼尼', ko: '부르고뉴 / 본 로마네',
    },
    body: {
      jp: 'ヴォーヌ・ロマネの特級畑を擁する、ブルゴーニュの頂点に立つドメーヌでございます。ロマネ・コンティ、ラ・ターシュ、リシュブール、ロマネ・サン・ヴィヴァン、グラン・エシェゾー、エシェゾー、そしてモンラッシェ。当店では正規のお取り扱いがございますが、年間の割り当ては数えるほどでございます。',
      en: 'The domaine at the summit of Burgundy, holding the grand cru vineyards of Vosne-Romanée: Romanée-Conti, La Tâche, Richebourg, Romanée-Saint-Vivant, Grands-Échézeaux, Échézeaux and Montrachet. We are an authorised stockist, though our yearly allocation can be counted on one hand.',
      fr: 'Le domaine au sommet de la Bourgogne, détenteur des grands crus de Vosne-Romanée : Romanée-Conti, La Tâche, Richebourg, Romanée-Saint-Vivant, Grands-Échézeaux, Échézeaux et Montrachet. Nous en sommes dépositaire officiel, même si notre allocation annuelle se compte sur les doigts d’une main.',
      zh: '坐拥沃恩·罗曼尼特级园、立于勃艮第之巅的酒庄。罗曼尼·康帝、拉塔希、里奇堡、罗曼尼·圣维望、大依瑟索、依瑟索，以及蒙拉榭。本店拥有正规经销资格，但每年配额屈指可数。',
      ko: '본 로마네의 그랑 크뤼를 보유한, 부르고뉴의 정점에 선 도멘입니다. 로마네 콩티, 라 타슈, 리쉬부르, 로마네 생 비방, 그랑 에셰조, 에셰조, 그리고 몽라셰. 저희는 정규 취급점이지만 연간 배정량은 손에 꼽을 정도입니다.',
    },
  },
  {
    key: 'leroy',
    jp: 'ドメーヌ・ルロワ',
    latin: 'Domaine Leroy',
    also: ['ルロワ', 'Leroy', 'メゾン・ルロワ', 'Maison Leroy', 'ラルー・ビーズ・ルロワ', 'Lalou Bize-Leroy'],
    region: {
      jp: 'ブルゴーニュ ／ ヴォーヌ・ロマネ', en: 'Burgundy / Vosne-Romanée', fr: 'Bourgogne / Vosne-Romanée',
      zh: '勃艮第 / 沃恩·罗曼尼', ko: '부르고뉴 / 본 로마네',
    },
    body: {
      jp: 'ラルー・ビーズ・ルロワ女史が、ビオディナミを徹底し、極限まで収量を落として造るブルゴーニュでございます。ミュジニー、シャンベルタン、リシュブール、ロマネ・サン・ヴィヴァン、クロ・ド・ラ・ロシュ。ドメーヌ・ルロワ、メゾン・ルロワともに正規のお取り扱いがございます。',
      en: 'Burgundy as made by Madame Lalou Bize-Leroy — uncompromising biodynamics and yields cut to the bone. Musigny, Chambertin, Richebourg, Romanée-Saint-Vivant, Clos de la Roche. We are an authorised stockist for both Domaine Leroy and Maison Leroy.',
      fr: 'La Bourgogne selon Madame Lalou Bize-Leroy : biodynamie sans concession et rendements réduits à l’extrême. Musigny, Chambertin, Richebourg, Romanée-Saint-Vivant, Clos de la Roche. Nous sommes dépositaire officiel du Domaine Leroy comme de la Maison Leroy.',
      zh: '由拉露·比兹·勒桦女士以彻底的生物动力法、将产量压至极限所酿的勃艮第。慕西尼、香贝丹、里奇堡、罗曼尼·圣维望、罗希园。勒桦酒庄与勒桦酒商，本店均有正规经销。',
      ko: '랄루 비즈 르로이 여사가 철저한 비오디나미와 극한까지 낮춘 수확량으로 빚는 부르고뉴입니다. 뮈지니, 샹베르탱, 리쉬부르, 로마네 생 비방, 클로 드 라 로슈. 도멘 르로이와 메종 르로이 모두 정규 취급하고 있습니다.',
    },
  },
  {
    key: 'auvenay',
    jp: 'ドメーヌ・ドーヴネ',
    latin: 'Domaine d’Auvenay',
    also: ['ドーヴネ', 'Auvenay', 'd’Auvenay', "d'Auvenay", 'オーヴネ'],
    region: {
      jp: 'ブルゴーニュ ／ サン・ロマン', en: 'Burgundy / Saint-Romain', fr: 'Bourgogne / Saint-Romain',
      zh: '勃艮第 / 圣罗曼', ko: '부르고뉴 / 생 로맹',
    },
    body: {
      jp: 'ラルー・ビーズ・ルロワ女史が個人で所有する、サン・ロマンの小さなドメーヌでございます。総生産量がごくわずかで、一つの畑から数百本しか生まれません。シュヴァリエ・モンラッシェ、クリオ・バタール・モンラッシェ、ムルソー・ナルヴォー、ボンヌ・マールなど。当店では正規のお取り扱いがございます。',
      en: 'The small Saint-Romain domaine owned personally by Madame Lalou Bize-Leroy. Total production is tiny — a few hundred bottles from a single vineyard. Chevalier-Montrachet, Criots-Bâtard-Montrachet, Meursault Narvaux, Bonnes-Mares. We are an authorised stockist.',
      fr: 'Le petit domaine de Saint-Romain que Madame Lalou Bize-Leroy possède à titre personnel. La production totale est infime : quelques centaines de bouteilles pour un climat. Chevalier-Montrachet, Criots-Bâtard-Montrachet, Meursault Narvaux, Bonnes-Mares. Nous en sommes dépositaire officiel.',
      zh: '拉露·比兹·勒桦女士个人拥有的圣罗曼小酒庄。总产量极微，一块园地仅得数百瓶。骑士蒙拉榭、克利欧·巴塔尔·蒙拉榭、默尔索·纳尔沃、邦马尔等。本店拥有正规经销资格。',
      ko: '랄루 비즈 르로이 여사가 개인으로 소유한 생 로맹의 작은 도멘입니다. 총생산량이 극히 적어 한 밭에서 수백 병밖에 나오지 않습니다. 슈발리에 몽라셰, 크리오 바타르 몽라셰, 뫼르소 나르보, 본 마르 등. 저희는 정규 취급점입니다.',
    },
  },
];
