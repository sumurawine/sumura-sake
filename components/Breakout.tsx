'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';

const L: Record<Lang, { title: string; start: string; again: string; clear: string; over: string; score: string; hint: string }> = {
  jp: { title: '★☆★ すむら酒店 ブロックくずし ★☆★', start: '▶ ゲームスタート', again: '▶ もういちど', clear: '★ ぜんぶ こわした！ ★', over: '☆ ざんねん！ ☆', score: 'スコア', hint: '← → キー か マウスで バーをうごかす' },
  en: { title: '★☆★ SUMURA BREAKOUT ★☆★', start: '▶ START', again: '▶ PLAY AGAIN', clear: '★ ALL CLEAR! ★', over: '☆ GAME OVER ☆', score: 'SCORE', hint: 'Move the paddle with ← → or the mouse' },
  fr: { title: '★☆★ CASSE-BRIQUES SUMURA ★☆★', start: '▶ DÉPART', again: '▶ REJOUER', clear: '★ TOUT CASSÉ ! ★', over: '☆ PERDU ☆', score: 'SCORE', hint: 'Déplacez la raquette avec ← → ou la souris' },
  zh: { title: '★☆★ 打砖块 ★☆★', start: '▶ 开始游戏', again: '▶ 再玩一次', clear: '★ 全部打完！ ★', over: '☆ 很可惜 ☆', score: '得分', hint: '用 ← → 键或滑鼠移动挡板' },
  ko: { title: '★☆★ 벽돌깨기 ★☆★', start: '▶ 시작', again: '▶ 다시하기', clear: '★ 전부 깼다! ★', over: '☆ 아쉽네요 ☆', score: '점수', hint: '← → 키나 마우스로 막대를 움직이세요' },
};

const W = 420, H = 300, ROWS = 5, COLS = 8, BW = 46, BH = 14, GAP = 4, TOP = 30, LEFT = 16;
const COLORS = ['#ff4d94', '#ffd23f', '#55e0ff', '#8bff6b', '#c58bff'];

export function Breakout({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'clear' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const t = L[lang] || L.jp;

  useEffect(() => {
    if (phase !== 'play') return;
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;

    let px = W / 2 - 34;
    const pw = 68, ph = 9;
    let bx = W / 2, by = H - 40, vx = 2.4, vy = -3.0, r = 5;
    let sc = 0;
    const bricks: Array<{ x: number; y: number; on: boolean; c: string }> = [];
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++)
        bricks.push({ x: LEFT + col * (BW + GAP), y: TOP + row * (BH + GAP), on: true, c: COLORS[row % COLORS.length] });

    let left = false, right = false, raf = 0, dead = false;
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { right = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') left = false;
      if (e.key === 'ArrowRight') right = false;
    };
    const mv = (e: MouseEvent) => {
      const b = cv.getBoundingClientRect();
      px = Math.max(0, Math.min(((e.clientX - b.left) / b.width) * W - pw / 2, W - pw));
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    cv.addEventListener('mousemove', mv);

    const loop = () => {
      if (left) px = Math.max(0, px - 6);
      if (right) px = Math.min(W - pw, px + 6);
      bx += vx; by += vy;
      if (bx < r || bx > W - r) vx = -vx;
      if (by < r) vy = -vy;
      if (by > H - 18 - ph - r && by < H - 18 + ph && bx > px && bx < px + pw && vy > 0) {
        vy = -Math.abs(vy);
        vx += ((bx - (px + pw / 2)) / (pw / 2)) * 1.4;
        vx = Math.max(-4.6, Math.min(4.6, vx));
      }
      for (const b of bricks) {
        if (!b.on) continue;
        if (bx > b.x - r && bx < b.x + BW + r && by > b.y - r && by < b.y + BH + r) {
          b.on = false; vy = -vy; sc += 10; setScore(sc); break;
        }
      }
      g.fillStyle = '#1a0033';
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 20) { g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(i, 0, 1, H); }
      for (const b of bricks) {
        if (!b.on) continue;
        g.fillStyle = b.c; g.fillRect(b.x, b.y, BW, BH);
        g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(b.x, b.y, BW, 3);
      }
      g.fillStyle = '#fff'; g.fillRect(px, H - 18 - ph, pw, ph);
      g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill();

      if (!bricks.some((b) => b.on)) { dead = true; setPhase('clear'); }
      else if (by > H + 20) { dead = true; setPhase('over'); }
      if (!dead) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('mousemove', mv);
    };
  }, [phase]);

  return (
    <div className="panel bk-wrap" style={{ textAlign: 'center' }}>
      <div className="pixhead">{t.title}</div>
      <div className="bk-stage">
        <canvas ref={ref} width={W} height={H} className="bk-canvas" />
        {phase !== 'play' ? (
          <div className="bk-cover">
            {phase === 'clear' ? <div className="bk-msg blink">{t.clear}</div> : null}
            {phase === 'over' ? <div className="bk-msg blink">{t.over}</div> : null}
            <button className="btn" onClick={() => { setScore(0); setPhase('play'); }}>
              {phase === 'idle' ? t.start : t.again}
            </button>
          </div>
        ) : null}
      </div>
      <div className="bk-score">{t.score}：<b>{score}</b></div>
      <div className="hint">{t.hint}</div>
    </div>
  );
}
