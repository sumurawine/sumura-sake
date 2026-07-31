import type { Lang } from './i18n';

/** メニューの「ゲームコーナー」 */
export const GAME_NAV: Record<Lang, string> = {
  jp: 'ゲームコーナー', en: 'GAME CORNER', fr: 'COIN JEUX', zh: '游戏角', ko: '게임 코너',
};
/** ゲームコーナーの案内文 */
export const GAME_PAGE: Record<Lang, { head: string; sub: string; p1: string; p2: string }> = {
  jp: {
    head: '■ ゲームコーナー ■', sub: '▼ ひまつぶしに一局 ▼',
    p1: '店番の合間に作りました。全25レベル、遊んでいってください。',
    p2: '※ 時代を切り替えると、遊び場の見た目も変わります。',
  },
  en: {
    head: '■ GAME CORNER ■', sub: '▼ A little diversion ▼',
    p1: 'Made between customers. Twenty-five levels — please help yourself.',
    p2: 'Switch eras and the arcade changes its clothes.',
  },
  fr: {
    head: '■ COIN JEUX ■', sub: '▼ Une petite distraction ▼',
    p1: 'Fait entre deux clients. Vingt-cinq niveaux, servez-vous.',
    p2: 'Changez d’époque et la salle de jeux change de tenue.',
  },
  zh: {
    head: '■ 游戏角 ■', sub: '▼ 闲时来一局 ▼',
    p1: '看店的间隙做的。全25关，请随意玩。',
    p2: '※ 切换时代，游戏场的样子也会跟着变。',
  },
  ko: {
    head: '■ 게임 코너 ■', sub: '▼ 심심풀이로 한 판 ▼',
    p1: '가게를 보는 틈틈이 만들었습니다. 전 25레벨, 마음껏 즐겨 주세요.',
    p2: '※ 시대를 바꾸면 놀이터의 모습도 함께 바뀝니다.',
  },
};
