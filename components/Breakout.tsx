'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';

const L: Record<Lang, Record<string, string>> = {
  jp: { title: '★☆★ すむら酒店 ブロックくずし ★☆★', start: '▶ ゲームスタート', next: '▶ つぎのレベルへ', again: '▶ もういちど',
        clear: '★ レベル %n クリア！ ★', over: '☆ ざんねん！ ☆', all: '★★★ 全25レベル 制覇！ ★★★',
        score: 'スコア', level: 'レベル', life: 'のこり', hint: '← → キー・マウス・指で バーをうごかす',
        word: 'おめでとうございます。合言葉は', wordAfter: 'です。秘密の部屋にどうぞ。' },
  en: { title: '★☆★ SUMURA BREAKOUT ★☆★', start: '▶ START', next: '▶ NEXT LEVEL', again: '▶ PLAY AGAIN',
        clear: '★ LEVEL %n CLEAR! ★', over: '☆ GAME OVER ☆', all: '★★★ ALL 25 LEVELS CLEARED! ★★★',
        score: 'SCORE', level: 'LEVEL', life: 'LIVES', hint: 'Move the paddle with ← →, the mouse or your finger',
        word: 'Congratulations. The passphrase is', wordAfter: '. Please visit the secret room.' },
  fr: { title: '★☆★ CASSE-BRIQUES SUMURA ★☆★', start: '▶ DÉPART', next: '▶ NIVEAU SUIVANT', again: '▶ REJOUER',
        clear: '★ NIVEAU %n TERMINÉ ! ★', over: '☆ PERDU ☆', all: '★★★ LES 25 NIVEAUX TERMINÉS ! ★★★',
        score: 'SCORE', level: 'NIVEAU', life: 'VIES', hint: 'Déplacez la raquette avec ← →, la souris ou le doigt',
        word: 'Félicitations. Le mot de passe est', wordAfter: '. Rendez-vous dans la chambre secrète.' },
  zh: { title: '★☆★ 打砖块 ★☆★', start: '▶ 开始游戏', next: '▶ 下一关', again: '▶ 再玩一次',
        clear: '★ 第 %n 关 通过！ ★', over: '☆ 很可惜 ☆', all: '★★★ 全25关 通关！ ★★★',
        score: '得分', level: '关卡', life: '剩余', hint: '用 ← → 键、滑鼠或手指移动挡板',
        word: '恭喜您。暗号是', wordAfter: '。请前往秘密之间。' },
  ko: { title: '★☆★ 벽돌깨기 ★☆★', start: '▶ 시작', next: '▶ 다음 레벨', again: '▶ 다시하기',
        clear: '★ 레벨 %n 클리어! ★', over: '☆ 아쉽네요 ☆', all: '★★★ 전 25레벨 제패! ★★★',
        score: '점수', level: '레벨', life: '남은 수', hint: '← → 키, 마우스, 손가락으로 막대를 움직이세요',
        word: '축하합니다. 암호는', wordAfter: ' 입니다. 비밀의 방으로 오세요.' },
};

export const GAME_WORD = 'monozukidesune';

type Skin = {
  bg: string; grid: string; ball: string; paddle: string;
  bricks: string[]; steel: string; tough: string; shade: string; round: number;
};
const SKINS: Record<string, Skin> = {
  // 1995：黒地に蛍光グリーン。ドットの粗さをそのままに
  '1995': { bg: '#000000', grid: 'rgba(37,255,37,.07)', ball: '#25ff25', paddle: '#25ff25',
    bricks: ['#25ff25', '#00c000', '#ffb000', '#c0c0c0', '#00a0a0', '#8b6914', '#25ff25'],
    steel: '#5a5a5a', tough: '#ffffff', shade: 'rgba(0,0,0,.5)', round: 0 },
  // 2000年代：ネオンとパステル。にぎやかに
  '2005': { bg: '#1a0033', grid: 'rgba(255,255,255,.03)', ball: '#ffd23f', paddle: '#ffffff',
    bricks: ['#ff4d94', '#ffd23f', '#55e0ff', '#8bff6b', '#c58bff', '#ff8a3d', '#7ad7ff'],
    steel: '#9aa4b0', tough: '#ffffff', shade: 'rgba(255,255,255,.45)', round: 0 },
  // 2010年代：白地にすっきり。角を丸く
  '2010': { bg: '#f7f7f7', grid: 'rgba(0,0,0,.03)', ball: '#4d90fe', paddle: '#4d90fe',
    bricks: ['#4d90fe', '#5bb974', '#f4b400', '#db4437', '#7e57c2', '#00acc1', '#8d6e63'],
    steel: '#b7b7b7', tough: '#3c4043', shade: 'rgba(255,255,255,.5)', round: 3 },
};
const skinOf = (era: string) => SKINS[era] || SKINS['2005'];
const MAX_LEVEL = 25;
const W = 420, H = 320, COLS = 8, BW = 46, BH = 13, GAP = 4, TOP = 26, LEFT = 16;


/** レベルごとの盤面。進むほど段が増え、固い煉瓦と鉄の煉瓦が混ざります */
function layout(level: number, colors: string[]) {
  const rows = Math.min(3 + Math.floor((level - 1) / 3), 8);
  const cells: Array<{ x: number; y: number; hp: number; c: string; steel: boolean }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      // 高いレベルでは市松や隙間の模様が現れます
      if (level >= 8 && (r + c) % 7 === 0 && level % 2 === 0) continue;
      const steel = level >= 12 && r === 0 && c % 4 === 1;
      const hp = steel ? 99 : level >= 5 && r < Math.floor(level / 7) ? 2 : 1;
      cells.push({ x: LEFT + c * (BW + GAP), y: TOP + r * (BH + GAP), hp, c: colors[r % colors.length], steel });
    }
  }
  return cells;
}
const speedOf = (level: number) => 2.7 + Math.min(level - 1, 24) * 0.12;

export function Breakout({ lang, era = '2005' }: { lang: Lang; era?: string }) {
  const sk = skinOf(era);
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'clear' | 'over' | 'all'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [life, setLife] = useState(3);
  const t = L[lang] || L.jp;

  const begin = useCallback((lv: number, keepScore: boolean) => {
    setLevel(lv);
    if (!keepScore) { setScore(0); setLife(3); }
    setPhase('play');
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const cv = ref.current;
    const g = cv?.getContext('2d');
    if (!cv || !g) return;

    const pw = Math.max(44, 74 - level), ph = 9;
    let px = W / 2 - pw / 2;
    const sp = speedOf(level);
    let bx = W / 2, by = H - 46, vx = sp * 0.62, vy = -sp, r = 5;
    let sc = score, lf = life, done = false, raf = 0;
    const bricks = layout(level, sk.bricks);

    let left = false, right = false;
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { right = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') left = false;
      if (e.key === 'ArrowRight') right = false;
    };
    const at = (clientX: number) => {
      const b = cv.getBoundingClientRect();
      px = Math.max(0, Math.min(((clientX - b.left) / b.width) * W - pw / 2, W - pw));
    };
    const mv = (e: MouseEvent) => at(e.clientX);
    const tv = (e: TouchEvent) => { if (e.touches[0]) { e.preventDefault(); at(e.touches[0].clientX); } };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    cv.addEventListener('mousemove', mv);
    cv.addEventListener('touchstart', tv, { passive: false });
    cv.addEventListener('touchmove', tv, { passive: false });

    const loop = () => {
      if (left) px = Math.max(0, px - 6.5);
      if (right) px = Math.min(W - pw, px + 6.5);
      bx += vx; by += vy;
      if (bx < r || bx > W - r) { vx = -vx; bx = Math.max(r, Math.min(bx, W - r)); }
      if (by < r) vy = -vy;
      if (by > H - 18 - ph - r && by < H - 18 + ph && bx > px - r && bx < px + pw + r && vy > 0) {
        vy = -Math.abs(vy);
        vx += ((bx - (px + pw / 2)) / (pw / 2)) * 1.5;
        vx = Math.max(-sp * 1.5, Math.min(sp * 1.5, vx));
      }
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        if (bx > b.x - r && bx < b.x + BW + r && by > b.y - r && by < b.y + BH + r) {
          vy = -vy;
          if (!b.steel) { b.hp -= 1; sc += b.hp === 0 ? 10 * level : 4 * level; setScore(sc); }
          break;
        }
      }
      g.fillStyle = sk.bg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 20) { g.fillStyle = sk.grid; g.fillRect(i, 0, 1, H); }
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        g.fillStyle = b.steel ? sk.steel : b.hp > 1 ? sk.tough : b.c;
        if (sk.round) { g.beginPath(); (g as any).roundRect(b.x, b.y, BW, BH, sk.round); g.fill(); }
        else g.fillRect(b.x, b.y, BW, BH);
        g.fillStyle = sk.shade; g.fillRect(b.x, b.y, BW, sk.round ? 2 : 3);
        if (b.steel) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(b.x + 4, b.y + 5, BW - 8, 3); }
      }
      g.fillStyle = sk.paddle;
      if (sk.round) { g.beginPath(); (g as any).roundRect(px, H - 18 - ph, pw, ph, ph / 2); g.fill(); }
      else g.fillRect(px, H - 18 - ph, pw, ph);
      g.fillStyle = sk.ball; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill();

      if (!bricks.some((b) => b.hp > 0 && !b.steel)) {
        done = true;
        setPhase(level >= MAX_LEVEL ? 'all' : 'clear');
      } else if (by > H + 20) {
        lf -= 1; setLife(lf);
        if (lf <= 0) { done = true; setPhase('over'); }
        else { bx = W / 2; by = H - 46; vx = sp * 0.62; vy = -sp; px = W / 2 - pw / 2; }
      }
      if (!done) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('mousemove', mv);
      cv.removeEventListener('touchstart', tv);
      cv.removeEventListener('touchmove', tv);
    };
  }, [phase, level, era]);

  return (
    <div className={`panel bk-wrap bk-e${era}`} style={{ textAlign: 'center' }}>
      <div className="pixhead">{t.title}</div>
      <div className="bk-stage">
        <canvas ref={ref} width={W} height={H} className="bk-canvas" />
        {phase !== 'play' ? (
          <div className="bk-cover">
            {phase === 'clear' ? <div className="bk-msg blink">{t.clear.replace('%n', String(level))}</div> : null}
            {phase === 'over' ? <div className="bk-msg blink">{t.over}</div> : null}
            {phase === 'all' ? (
              <>
                <div className="bk-msg blink">{t.all}</div>
                <div className="bk-word">{t.word}<b>{GAME_WORD}</b>{t.wordAfter}</div>
              </>
            ) : null}
            <button className="btn" onClick={() => {
              if (phase === 'clear') begin(level + 1, true);
              else if (phase === 'idle') begin(1, false);
              else begin(1, false);
            }}>
              {phase === 'idle' ? t.start : phase === 'clear' ? t.next : t.again}
            </button>
          </div>
        ) : null}
      </div>
      <div className="bk-score">
        {t.level}：<b>{level}</b> ／ {t.score}：<b>{score}</b> ／ {t.life}：<b>{life}</b>
      </div>
      <div className="hint">{t.hint}</div>
    </div>
  );
}
