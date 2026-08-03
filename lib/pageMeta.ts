import type { Lang } from './i18n';

/** 主要ページの、言語ごとの題名と説明文（検索結果に出る文言でございます） */
export const PAGE_I18N: Record<string, Partial<Record<Lang, { t: string; d: string }>>> = {
  '/home': {
    en: { t: 'Fine French wines from Ube, Japan', d: 'Liquor Shop Sumura is a wine merchant in Ube, Yamaguchi, Japan. Burgundy above all, with Bordeaux, the Rhône, Jura, the Loire and Alsace, sourced through official channels. An authorised stockist of Domaine de la Romanée-Conti, Domaine Leroy and Domaine d’Auvenay.' },
    fr: { t: 'Grands vins de France, depuis Ube au Japon', d: 'Liquor Shop Sumura est un caviste à Ube, Yamaguchi, au Japon. La Bourgogne avant tout, mais aussi Bordeaux, le Rhône, le Jura, la Loire et l’Alsace, en filière officielle. Dépositaire agréé de la Romanée-Conti, du Domaine Leroy et du Domaine d’Auvenay.' },
    zh: { t: '法国名酿葡萄酒专门店｜日本宇部', d: '本店位于日本山口县宇部市，专营法国名酿葡萄酒。以勃艮第为中心，兼备波尔多、罗讷河谷、汝拉、卢瓦尔与阿尔萨斯，均循正规渠道进口。罗曼尼·康帝（DRC）、勒桦、奥维那均为正规经销。' },
    ko: { t: '프랑스 명양 와인 전문점｜일본 우베', d: '스무라 주점은 일본 야마구치현 우베시의 와인 전문점입니다. 부르고뉴를 중심으로 보르도, 론, 쥐라, 루아르, 알자스의 명양 와인을 정규 경로로 갖추고 있습니다. DRC·르로이·도브네 정규 취급점입니다.' },
  },
  '/producers': {
    en: { t: 'Producers we carry — DRC, Leroy, d’Auvenay and more', d: 'An authorised stockist of Domaine de la Romanée-Conti, Domaine Leroy and Domaine d’Auvenay, together with more than sixty growers, chiefly of Burgundy, presented region by region.' },
    fr: { t: 'Nos producteurs — DRC, Leroy, d’Auvenay et bien d’autres', d: 'Dépositaire agréé de la Romanée-Conti, du Domaine Leroy et du Domaine d’Auvenay, ainsi que de plus de soixante vignerons, surtout bourguignons, présentés par région.' },
    zh: { t: '经营生产者一览｜DRC・勒桦・奥维那等', d: '罗曼尼·康帝（DRC）、勒桦、奥维那均为正规经销。此外还有以勃艮第为中心的六十余家优秀生产者，按产地分别介绍。' },
    ko: { t: '취급 생산자｜DRC·르로이·도브네 외', d: 'DRC, 도멘 르로이, 도멘 도브네를 정규로 취급합니다. 그 밖에 부르고뉴를 중심으로 60곳이 넘는 생산자를 산지별로 소개합니다.' },
  },
  '/store': {
    en: { t: 'Online shop — browse by region and producer', d: 'Our cellar, arranged by region and by grower: Burgundy, Bordeaux, the Rhône, Jura, the Loire, Alsace, Italy, the United States, and whisky. Each bottle has its own page.' },
    fr: { t: 'Boutique en ligne — par région et par producteur', d: 'Notre cave, classée par région et par vigneron : Bourgogne, Bordeaux, Rhône, Jura, Loire, Alsace, Italie, États-Unis et whisky. Chaque flacon a sa fiche.' },
    zh: { t: '在线商店｜按产地与生产者浏览库存', d: '可按产地与生产者浏览本店库存。勃艮第、波尔多、罗讷河谷、汝拉、卢瓦尔、阿尔萨斯、意大利、美国，以及威士忌。每款酒均设专属页面。' },
    ko: { t: '온라인 스토어｜산지·생산자로 재고 보기', d: '재고를 산지별·생산자별로 보실 수 있습니다. 부르고뉴, 보르도, 론, 쥐라, 루아르, 알자스, 이탈리아, 미국, 위스키까지. 각 병마다 전용 페이지가 있습니다.' },
  },
  '/about': {
    en: { t: 'About us', d: 'Liquor Shop Sumura, in Nakamura, Ube, Yamaguchi. About the shop, and about how we go about choosing wine.' },
    fr: { t: 'À propos', d: 'Liquor Shop Sumura, à Nakamura, Ube, Yamaguchi. La maison, et notre façon de choisir les vins.' },
    zh: { t: '关于本店', d: '位于日本山口县宇部市中村的すむら酒店。店铺介绍，以及我们挑选葡萄酒的想法。' },
    ko: { t: '회사 개요', d: '야마구치현 우베시 나카무라의 스무라 주점. 매장 안내와, 와인을 고르는 저희의 생각에 대하여.' },
  },
  '/access': {
    en: { t: 'Visiting us — the shop in Ube, Yamaguchi', d: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japan. Open 10:00–18:30, closed Tuesdays. Telephone +81-836-21-4721. Do come and see us.' },
    fr: { t: 'Nous trouver — la boutique à Ube, Yamaguchi', d: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japon. Ouvert de 10h00 à 18h30, fermé le mardi. Téléphone +81-836-21-4721.' },
    zh: { t: '交通指南｜山口县宇部市中村的实体店', d: '〒755-0072 山口县宇部市中村3-6-20。营业时间 10:00–18:30，周二定休。电话 0836-21-4721。诚邀莅临。' },
    ko: { t: '오시는 길｜야마구치현 우베시 나카무라 매장', d: '〒755-0072 야마구치현 우베시 나카무라 3-6-20. 영업시간 10:00–18:30, 화요일 휴무. 전화 0836-21-4721.' },
  },
  '/news': {
    en: { t: 'News', d: 'New arrivals, en primeur bookings, and notices from Liquor Shop Sumura.' },
    fr: { t: 'Actualités', d: 'Arrivages, réservations en primeur et informations de Liquor Shop Sumura.' },
    zh: { t: '最新消息', d: '到货情况、期酒预订受理、营业通知等本店消息。' },
    ko: { t: '소식', d: '입고 정보, 프리뫼르 예약 접수, 영업 안내 등 스무라 주점의 소식입니다.' },
  },
  '/blog': {
    en: { t: 'Journal', d: 'On wine, on the people who make it, and on the days in the shop. Written by the owner of Liquor Shop Sumura.' },
    fr: { t: 'Journal', d: 'Sur le vin, sur ceux qui le font, et sur les jours passés à la boutique. Par le patron de Liquor Shop Sumura.' },
    zh: { t: '博客', d: '关于葡萄酒、关于酿造者、关于店头的日常。すむら酒店店主随笔。' },
    ko: { t: '블로그', d: '와인에 대하여, 만드는 사람에 대하여, 가게 앞의 나날에 대하여. 스무라 주점 주인이 적어 둡니다.' },
  },
  '/contact': {
    en: { t: 'Contact us', d: 'Tell us the region, the grower, the vintage and the budget, and we will tell you what we can offer. We are glad to advise on gifts as well.' },
    fr: { t: 'Nous écrire', d: 'Dites-nous la région, le vigneron, le millésime et le budget, et nous vous dirons ce que nous pouvons proposer. Conseils pour les cadeaux également.' },
    zh: { t: '联系我们', d: '请告知产地、生产者、年份与预算，我们将为您介绍可提供的酒款。赠礼咨询亦欢迎。' },
    ko: { t: '문의하기', d: '산지·생산자·연도·예산을 알려 주시면 안내해 드릴 수 있는 것을 전해 드립니다. 선물 상담도 받고 있습니다.' },
  },
  '/legal': {
    en: { t: 'Legal notice (Act on Specified Commercial Transactions)', d: 'Statutory information for Liquor Shop Sumura under the Japanese Act on Specified Commercial Transactions.' },
    fr: { t: 'Mentions légales', d: 'Informations légales de Liquor Shop Sumura au titre de la loi japonaise sur les transactions commerciales déterminées.' },
    zh: { t: '基于特定商业交易法的标示', d: '依据日本《特定商业交易法》所作的すむら酒店相关标示。' },
    ko: { t: '특정상거래법에 근거한 표기', d: '일본 특정상거래법에 근거한 스무라 주점의 표기입니다.' },
  },
};
