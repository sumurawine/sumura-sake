import type { Lang } from './i18n';

/** メニューの「ゲームコーナー」 */
export const GAME_NAV: Record<Lang, string> = {
  jp: 'ゲームコーナー', en: 'GAME CORNER', fr: 'COIN JEUX', zh: '游戏角', ko: '게임 코너',
};
/** ゲームコーナーの案内文 */
export const GAME_PAGE: Record<Lang, { head: string; sub: string; p1: string; p2: string }> = {
  jp: {
    head: '■ ゲームコーナー ■', sub: '▼ ひまつぶしに一局 ▼',
    p1: '店番の合間に作りました。下からお好きなゲームをお選びください。',
    p2: '※ 時代を切り替えると、遊び場の見た目も、置いてあるゲームも変わります。いちばん奥のステージまでたどり着いた方には、秘密の部屋の合言葉をお教えしています。',
  },
  en: {
    head: '■ GAME CORNER ■', sub: '▼ A little diversion ▼',
    p1: 'Made between customers. Pick a game below and help yourself.',
    p2: 'Switch eras and the arcade changes its clothes — and its line-up. Reach the final stage and we will tell you the passphrase to the secret room.',
  },
  fr: {
    head: '■ COIN JEUX ■', sub: '▼ Une petite distraction ▼',
    p1: 'Fait entre deux clients. Choisissez un jeu ci-dessous et servez-vous.',
    p2: 'Changez d’époque : la salle de jeux change de tenue et de programme. Atteignez le dernier niveau et nous vous confierons le mot de passe de la chambre secrète.',
  },
  zh: {
    head: '■ 游戏角 ■', sub: '▼ 闲时来一局 ▼',
    p1: '看店的间隙做的。请从下面挑一个游戏，随意玩。',
    p2: '※ 切换时代，游戏场的样子和摆放的游戏都会跟着变。抵达最后一关的客人，我们会奉上秘密之间的暗号。',
  },
  ko: {
    head: '■ 게임 코너 ■', sub: '▼ 심심풀이로 한 판 ▼',
    p1: '가게를 보는 틈틈이 만들었습니다. 아래에서 원하는 게임을 골라 주세요.',
    p2: '※ 시대를 바꾸면 놀이터의 모습도, 놓여 있는 게임도 함께 바뀝니다. 마지막 스테이지까지 도달하신 분께는 비밀의 방 암호를 알려 드립니다.',
  },
};
