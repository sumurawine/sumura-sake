import type { Lang } from './i18n';

export type GameKey = 'breakout' | 'tetris' | 'racer' | 'platform' | 'marble';

/** 時代ごとの遊び場のいろ。ブロックくずしの SKINS と歩調を合わせています */
export type GSkin = {
  bg: string; grid: string; ink: string; sub: string;
  a: string; b: string; c: string; d: string; e: string;
  wall: string; shade: string; round: number; pixel: number;
};
export const GSKINS: Record<string, GSkin> = {
  // 1995：黒地に蛍光グリーン。ドットの粗さをそのままに
  '1995': {
    bg: '#000000', grid: 'rgba(37,255,37,.07)', ink: '#25ff25', sub: '#ffb000',
    a: '#25ff25', b: '#00c000', c: '#ffb000', d: '#c0c0c0', e: '#00a0a0',
    wall: '#5a5a5a', shade: 'rgba(0,0,0,.5)', round: 0, pixel: 4,
  },
  // 2000年代：ネオンとパステル。にぎやかに
  '2005': {
    bg: '#1a0033', grid: 'rgba(255,255,255,.04)', ink: '#ffd23f', sub: '#ff4d94',
    a: '#ff4d94', b: '#ffd23f', c: '#55e0ff', d: '#8bff6b', e: '#c58bff',
    wall: '#9aa4b0', shade: 'rgba(255,255,255,.45)', round: 0, pixel: 3,
  },
  // 2010年代：白地にすっきり。角を丸く
  '2010': {
    bg: '#f7f7f7', grid: 'rgba(0,0,0,.04)', ink: '#3c4043', sub: '#5f6368',
    a: '#4d90fe', b: '#5bb974', c: '#f4b400', d: '#db4437', e: '#7e57c2',
    wall: '#b7b7b7', shade: 'rgba(255,255,255,.5)', round: 4, pixel: 2,
  },
};
export const gskin = (era: string) => GSKINS[era] || GSKINS['2005'];

/** どの時代にどのゲームを置くか */
export function gamesOf(era: string): GameKey[] {
  const base: GameKey[] = ['breakout', 'tetris', 'racer'];
  if (era === '2005') return [...base, 'platform'];
  if (era === '2010') return [...base, 'marble'];
  return base;
}

/** ゲームの名まえ（メニューのボタン） */
export const GAME_TITLES: Record<GameKey, Record<Lang, string>> = {
  breakout: {
    jp: 'ブロックくずし', en: 'Breakout', fr: 'Casse-briques', zh: '打砖块', ko: '벽돌깨기',
  },
  tetris: {
    jp: 'つみき落とし', en: 'Block Drop', fr: 'Chute de blocs', zh: '方块下落', ko: '블록 쌓기',
  },
  racer: {
    jp: 'ドット・カーレース', en: 'Pixel Racer', fr: 'Course en pixels', zh: '像素赛车', ko: '도트 카레이스',
  },
  platform: {
    jp: '前かけ小僧の大冒険', en: "Apron Boy's Adventure", fr: 'La grande aventure du petit tablier',
    zh: '围裙小子大冒险', ko: '앞치마 소년의 대모험',
  },
  marble: {
    jp: 'ころがしマーブル', en: 'Marble Roll', fr: 'Bille roulante', zh: '滚动弹珠', ko: '구슬 굴리기',
  },
};

/** どのゲームでも使う共通のことば */
export type GT = {
  start: string; again: string; next: string; over: string; clear: string; all: string;
  score: string; level: string; life: string; time: string; best: string;
  pause: string; resume: string;
};
/** ブロックくずしと同じ合言葉。最高ステージまで行った方へのごほうびです */
export const GAME_WORD = 'monozukidesune';

/** 合言葉を出すときの言い回し（ブロックくずしと同じ調子で） */
export const WORD_L: Record<Lang, { before: string; after: string }> = {
  jp: { before: 'おめでとうございます。合言葉は', after: 'です。秘密の部屋にどうぞ。' },
  en: { before: 'Congratulations. The passphrase is', after: '. Please visit the secret room.' },
  fr: { before: 'Félicitations. Le mot de passe est', after: '. Rendez-vous dans la chambre secrète.' },
  zh: { before: '恭喜您。暗号是', after: '。请前往秘密之间。' },
  ko: { before: '축하합니다. 암호는', after: ' 입니다. 비밀의 방으로 오세요.' },
};

export const GT_L: Record<Lang, GT> = {
  jp: { start: '▶ はじめる', again: '▶ もういちど', next: '▶ つぎへ', over: '☆ ざんねん！ ☆',
        clear: '★ クリア！ ★', all: '★★★ ぜんぶ クリア！ ★★★',
        score: 'スコア', level: 'レベル', life: 'のこり', time: 'のこり時間', best: '最高記録',
        pause: '‖ 一時停止', resume: '▶ 再開' },
  en: { start: '▶ START', again: '▶ PLAY AGAIN', next: '▶ NEXT', over: '☆ GAME OVER ☆',
        clear: '★ CLEAR! ★', all: '★★★ ALL CLEAR! ★★★',
        score: 'SCORE', level: 'LEVEL', life: 'LIVES', time: 'TIME', best: 'BEST',
        pause: '‖ PAUSE', resume: '▶ RESUME' },
  fr: { start: '▶ DÉPART', again: '▶ REJOUER', next: '▶ SUITE', over: '☆ PERDU ☆',
        clear: '★ RÉUSSI ! ★', all: '★★★ TOUT RÉUSSI ! ★★★',
        score: 'SCORE', level: 'NIVEAU', life: 'VIES', time: 'TEMPS', best: 'RECORD',
        pause: '‖ PAUSE', resume: '▶ REPRENDRE' },
  zh: { start: '▶ 开始', again: '▶ 再玩一次', next: '▶ 下一关', over: '☆ 很可惜 ☆',
        clear: '★ 通关！ ★', all: '★★★ 全部通关！ ★★★',
        score: '得分', level: '关卡', life: '剩余', time: '剩余时间', best: '最高纪录',
        pause: '‖ 暂停', resume: '▶ 继续' },
  ko: { start: '▶ 시작', again: '▶ 다시하기', next: '▶ 다음', over: '☆ 아쉽네요 ☆',
        clear: '★ 클리어! ★', all: '★★★ 전부 클리어! ★★★',
        score: '점수', level: '레벨', life: '남은 수', time: '남은 시간', best: '최고 기록',
        pause: '‖ 일시정지', resume: '▶ 재개' },
};

/** ゲームごとの見出しと操作の説明 */
export const GAME_COPY: Record<GameKey, Record<Lang, { title: string; hint: string }>> = {
  breakout: {
    jp: { title: '★☆★ すむら酒店 ブロックくずし ★☆★', hint: '← → キー・マウス・指で バーをうごかす' },
    en: { title: '★☆★ SUMURA BREAKOUT ★☆★', hint: 'Move the paddle with ← →, the mouse or your finger' },
    fr: { title: '★☆★ CASSE-BRIQUES SUMURA ★☆★', hint: 'Déplacez la raquette avec ← →, la souris ou le doigt' },
    zh: { title: '★☆★ 打砖块 ★☆★', hint: '用 ← → 键、滑鼠或手指移动挡板' },
    ko: { title: '★☆★ 벽돌깨기 ★☆★', hint: '← → 키, 마우스, 손가락으로 막대를 움직이세요' },
  },
  tetris: {
    jp: { title: '★☆★ つみき落とし ★☆★', hint: '← → よこ移動／↑ まわす／↓ 早おとし／スペース 一気に落とす' },
    en: { title: '★☆★ BLOCK DROP ★☆★', hint: '← → move · ↑ rotate · ↓ soft drop · Space hard drop' },
    fr: { title: '★☆★ CHUTE DE BLOCS ★☆★', hint: '← → déplacer · ↑ tourner · ↓ descendre · Espace chute rapide' },
    zh: { title: '★☆★ 方块下落 ★☆★', hint: '← → 移动／↑ 旋转／↓ 加速下落／空格 直接落下' },
    ko: { title: '★☆★ 블록 쌓기 ★☆★', hint: '← → 이동 · ↑ 회전 · ↓ 빨리 내리기 · 스페이스 한 번에 떨어뜨리기' },
  },
  racer: {
    jp: { title: '★☆★ ドット・カーレース ★☆★', hint: '← → キー・指で左右へ。対向車をよけて、どこまでも' },
    en: { title: '★☆★ PIXEL RACER ★☆★', hint: '← → or your finger to steer. Dodge the traffic and keep going' },
    fr: { title: '★☆★ COURSE EN PIXELS ★☆★', hint: '← → ou le doigt pour diriger. Évitez les voitures et continuez' },
    zh: { title: '★☆★ 像素赛车 ★☆★', hint: '用 ← → 键或手指左右移动，躲开来车一直往前' },
    ko: { title: '★☆★ 도트 카레이스 ★☆★', hint: '← → 키나 손가락으로 좌우 이동. 마주 오는 차를 피해 계속 달리세요' },
  },
  platform: {
    jp: { title: '★☆★ 前かけ小僧の大冒険 ★☆★', hint: '← → あるく／↑・スペース ジャンプ。ぶどうを集めて、栓ぬけオバケは踏んでやっつけます' },
    en: { title: "★☆★ APRON BOY'S ADVENTURE ★☆★", hint: '← → walk · ↑ or Space to jump. Gather the grapes and stomp the cork goblins' },
    fr: { title: '★☆★ LA GRANDE AVENTURE DU PETIT TABLIER ★☆★', hint: '← → marcher · ↑ ou Espace pour sauter. Ramassez les raisins et écrasez les lutins-bouchons' },
    zh: { title: '★☆★ 围裙小子大冒险 ★☆★', hint: '← → 走动／↑ 或空格 跳跃。收集葡萄，踩扁软木塞小怪' },
    ko: { title: '★☆★ 앞치마 소년의 대모험 ★☆★', hint: '← → 걷기 · ↑ 또는 스페이스로 점프. 포도를 모으고, 코르크 도깨비는 밟아서 물리칩니다' },
  },
  marble: {
    jp: { title: '★☆★ ころがしマーブル ★☆★', hint: '矢印キー・指でころがす。宝石をぜんぶ集めてゴールへ。穴に落ちないよう' },
    en: { title: '★☆★ MARBLE ROLL ★☆★', hint: 'Arrow keys or your finger to roll. Collect every gem, then reach the pad. Mind the holes' },
    fr: { title: '★☆★ BILLE ROULANTE ★☆★', hint: 'Flèches ou doigt pour rouler. Ramassez toutes les gemmes puis rejoignez la plateforme. Attention aux trous' },
    zh: { title: '★☆★ 滚动弹珠 ★☆★', hint: '用方向键或手指滚动。收集全部宝石后前往终点，小心别掉进洞里' },
    ko: { title: '★☆★ 구슬 굴리기 ★☆★', hint: '방향키나 손가락으로 굴리세요. 보석을 모두 모아 골인 지점으로. 구멍에 빠지지 않도록' },
  },
};
