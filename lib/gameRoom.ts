import type { Lang } from './i18n';

/** ブロックくずし レベル25 達成の方だけがご覧になれる一室 */
export const GAME_ROOM: Record<Lang, {
  head: string; sub: string; p1: string; p2: string;
  l1: string; l2: string; l3: string; note: string; btn: string; item: string;
}> = {
  jp: {
    head: '■ レベル25 達成の記 ■',
    sub: '▼ ものずきな方へ ▼',
    p1: '全25レベル、お疲れさまでございました。ここまでたどり着かれた方は、そう多くはございません。ものずきな方に、ものずきな一本を。',
    p2: '下のご請求をいただいた方には、店主が「これはちょっと変わっている」と思って仕入れた一本を、そのときの在庫からお選びしてご案内いたします。定番からは少し外れた、けれども確かなものばかりです。',
    l1: '通常はご案内していない、少量入荷の変わり種',
    l2: '造り手の遊び心が出た、その年だけの一本',
    l3: '飲み頃を迎えた、店主の私蔵からのおすそ分け',
    note: '※ 数に限りがございます。品切れの節はご容赦ください。',
    btn: '▶ 達成特典について問い合わせる',
    item: 'ブロックくずし レベル25 達成特典',
  },
  en: {
    head: '■ LEVEL 25 ■',
    sub: '▼ For the curious ▼',
    p1: 'All twenty-five levels — well played. Not many people get this far. A curious bottle, for a curious person.',
    p2: 'Write to us using the button below and we will pick, from what is in the shop that day, a bottle the owner bought simply because he found it unusual. A little off the beaten track, but never careless.',
    l1: 'Oddities that arrived in too few bottles to list',
    l2: 'One-off cuvées where the grower was clearly enjoying himself',
    l3: 'A bottle from the owner’s own cellar, now at its peak',
    note: 'Numbers are limited; please forgive us if a bottle has already gone.',
    btn: '▶ Ask about the level 25 reward',
    item: 'Breakout — level 25 reward',
  },
  fr: {
    head: '■ NIVEAU 25 ■',
    sub: '▼ Pour les curieux ▼',
    p1: 'Vingt-cinq niveaux, bravo. Peu de gens arrivent jusqu’ici. Une bouteille curieuse, pour une personne curieuse.',
    p2: 'Écrivez-nous avec le bouton ci-dessous : nous choisirons, parmi ce qui est en boutique ce jour-là, un flacon que le propriétaire a acheté simplement parce qu’il le trouvait singulier. Un peu à côté des sentiers battus, jamais au hasard.',
    l1: 'Curiosités arrivées en trop peu de bouteilles pour être listées',
    l2: 'Cuvées uniques où le vigneron s’est manifestement amusé',
    l3: 'Une bouteille de la cave personnelle du propriétaire, à son apogée',
    note: 'Les quantités sont limitées ; pardonnez-nous si la bouteille est déjà partie.',
    btn: '▶ Se renseigner sur la récompense du niveau 25',
    item: 'Casse-briques — récompense du niveau 25',
  },
  zh: {
    head: '■ 第25关 达成之记 ■',
    sub: '▼ 致好奇的您 ▼',
    p1: '全25关，辛苦了。能走到这一步的人并不多。为好奇的人，备一瓶好奇的酒。',
    p2: '通过下方按钮联系我们，我们将从当日库存中，挑选一瓶店主纯粹因为「有点特别」而进的酒为您介绍。稍稍偏离常规，但绝非随意。',
    l1: '到货极少、未曾上架的稀奇酒款',
    l2: '酿造者玩心大发、仅此一年的一瓶',
    l3: '正值适饮期，店主私藏中分出的一瓶',
    note: '※ 数量有限，售罄时敬请见谅。',
    btn: '▶ 咨询达成特典',
    item: '打砖块 第25关 达成特典',
  },
  ko: {
    head: '■ 레벨 25 달성의 기록 ■',
    sub: '▼ 호기심 많은 분께 ▼',
    p1: '전 25레벨, 수고 많으셨습니다. 여기까지 오시는 분은 그리 많지 않습니다. 호기심 많은 분께, 호기심 어린 한 병을.',
    p2: '아래 버튼으로 연락 주시면, 그날의 재고 중에서 점주가 「조금 별나다」고 여겨 들여온 한 병을 골라 안내해 드립니다. 정석에서 살짝 벗어났지만, 결코 허투루 고른 것은 아닙니다.',
    l1: '입고가 적어 게재하지 않은 별난 와인',
    l2: '만드는 이의 장난기가 드러난, 그 해만의 한 병',
    l3: '마시기 좋은 때를 맞은, 점주의 개인 셀러에서 나눠 드리는 한 병',
    note: '※ 수량이 한정되어 있습니다. 품절 시에는 양해 부탁드립니다.',
    btn: '▶ 달성 특전에 대해 문의하기',
    item: '벽돌깨기 레벨 25 달성 특전',
  },
};
