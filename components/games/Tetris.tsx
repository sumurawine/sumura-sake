'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { gskin, GT_L, GAME_COPY } from '@/lib/games';
import { GameFrame, Pad, roundBox } from './Frame';

const COLS = 10, ROWS = 18, CELL = 18;
const BOARD_W = COLS * CELL;           // 180
const SIDE = 92;
const W = BOARD_W + SIDE;              // 272
const H = ROWS * CELL + 8;             // 332

/** 7種類のかたち。回転はそれぞれの形を素直に持たせています */
const SHAPES: number[][][][] = [
  // I
  [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]]],
  // O
  [[[1,0],[2,0],[1,1],[2,1]]],
  // T
  [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]],
  // S
  [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]]],
  // Z
  [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]]],
  // J
  [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]],
  // L
  [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]],
];

type Cell = number; // 0 = 空き、1〜7 = 色番号
type Piece = { s: number; r: number; x: number; y: number };

const empty = (): Cell[][] => Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
const cellsOf = (p: Piece) => SHAPES[p.s][p.r % SHAPES[p.s].length];

function fits(b: Cell[][], p: Piece) {
  for (const [cx, cy] of cellsOf(p)) {
    const x = p.x + cx, y = p.y + cy;
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y >= 0 && b[y][x]) return false;
  }
  return true;
}

export function Tetris({ lang, era = '2005' }: { lang: Lang; era?: string }) {
  const sk = gskin(era);
  const t = GT_L[lang] || GT_L.jp;
  const copy = (GAME_COPY.tetris[lang] || GAME_COPY.tetris.jp);
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const held = useRef<Record<string, boolean>>({});

  const press = useCallback((k: string) => { held.current[k] = true; }, []);
  const release = useCallback((k: string) => { held.current[k] = false; }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const cv = ref.current, g = cv?.getContext('2d');
    if (!cv || !g) return;

    const colors = [sk.a, sk.b, sk.c, sk.d, sk.e, sk.ink, sk.sub];
    let board = empty();
    let bag: number[] = [];
    const draw = () => { if (!bag.length) bag = [0,1,2,3,4,5,6].sort(() => Math.random() - 0.5); return bag.pop() as number; };
    let cur: Piece = { s: draw(), r: 0, x: 3, y: -1 };
    let nxt = draw();
    let sc = 0, ln = 0, lv = 1, dead = false, raf = 0;
    let fall = 0, rep = 0, softRep = 0;
    let lastRotate = false, lastDrop = false;

    const spawn = () => {
      cur = { s: nxt, r: 0, x: 3, y: -1 };
      nxt = draw();
      if (!fits(board, cur)) { dead = true; setPhase('over'); }
    };

    const lock = () => {
      for (const [cx, cy] of cellsOf(cur)) {
        const y = cur.y + cy;
        if (y >= 0) board[y][cur.x + cx] = cur.s + 1;
      }
      let cleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every((v) => v)) {
          board.splice(y, 1);
          board.unshift(Array<Cell>(COLS).fill(0));
          cleared++; y++;
        }
      }
      if (cleared) {
        ln += cleared;
        sc += [0, 40, 100, 300, 1200][cleared] * lv;
        lv = 1 + Math.floor(ln / 8);
        setScore(sc); setLines(ln); setLevel(lv);
      }
      spawn();
    };

    const move = (dx: number) => { const q = { ...cur, x: cur.x + dx }; if (fits(board, q)) cur = q; };
    const rotate = () => {
      const q = { ...cur, r: (cur.r + 1) % SHAPES[cur.s].length };
      for (const kick of [0, -1, 1, -2, 2]) {
        const k = { ...q, x: q.x + kick };
        if (fits(board, k)) { cur = k; return; }
      }
    };
    const hardDrop = () => { while (fits(board, { ...cur, y: cur.y + 1 })) cur.y++; sc += 2; setScore(sc); lock(); };

    const kd = (e: KeyboardEvent) => {
      const map: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', ' ': 's', Spacebar: 's' };
      const k = map[e.key];
      if (k) { held.current[k] = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      const map: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', ' ': 's', Spacebar: 's' };
      const k = map[e.key];
      if (k) held.current[k] = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    // 指ですべらせても動かせるように
    let tx0 = 0, ty0 = 0, moved = false;
    const ts = (e: TouchEvent) => { const p = e.touches[0]; if (!p) return; tx0 = p.clientX; ty0 = p.clientY; moved = false; e.preventDefault(); };
    const tm = (e: TouchEvent) => {
      const p = e.touches[0]; if (!p) return; e.preventDefault();
      const dx = p.clientX - tx0, dy = p.clientY - ty0;
      if (Math.abs(dx) > 20) { move(dx > 0 ? 1 : -1); tx0 = p.clientX; moved = true; }
      if (dy > 26) { if (fits(board, { ...cur, y: cur.y + 1 })) cur.y++; ty0 = p.clientY; moved = true; }
    };
    const te = (e: TouchEvent) => { e.preventDefault(); if (!moved) rotate(); };
    cv.addEventListener('touchstart', ts, { passive: false });
    cv.addEventListener('touchmove', tm, { passive: false });
    cv.addEventListener('touchend', te, { passive: false });

    const box = (x: number, y: number, col: string) => {
      g.fillStyle = col;
      roundBox(g, x + 1, y + 1, CELL - 2, CELL - 2, sk.round);
      g.fillStyle = sk.shade;
      g.fillRect(x + 1, y + 1, CELL - 2, sk.round ? 2 : 3);
    };

    const loop = () => {
      const speed = Math.max(5, 34 - lv * 3);
      // 押しっぱなしの取りまわし
      rep++;
      if (held.current.l && rep % 5 === 0) move(-1);
      if (held.current.r && rep % 5 === 0) move(1);
      if (held.current.u && !lastRotate) rotate();
      lastRotate = !!held.current.u;
      if (held.current.s && !lastDrop) hardDrop();
      lastDrop = !!held.current.s;
      if (held.current.d) { softRep++; if (softRep % 3 === 0 && fits(board, { ...cur, y: cur.y + 1 })) cur.y++; }

      fall++;
      if (fall >= speed) {
        fall = 0;
        if (fits(board, { ...cur, y: cur.y + 1 })) cur.y++;
        else lock();
      }

      // 描く
      g.fillStyle = sk.bg; g.fillRect(0, 0, W, H);
      g.fillStyle = sk.grid;
      for (let x = 0; x <= COLS; x++) g.fillRect(x * CELL, 4, 1, ROWS * CELL);
      for (let y = 0; y <= ROWS; y++) g.fillRect(0, 4 + y * CELL, BOARD_W, 1);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        if (board[y][x]) box(x * CELL, 4 + y * CELL, colors[(board[y][x] - 1) % colors.length]);
      }
      if (!dead) {
        // 落ちる先のうすい影
        let gy = cur.y; while (fits(board, { ...cur, y: gy + 1 })) gy++;
        for (const [cx, cy] of cellsOf(cur)) {
          const y = gy + cy; if (y < 0) continue;
          g.fillStyle = sk.grid;
          g.fillRect((cur.x + cx) * CELL + 1, 4 + y * CELL + 1, CELL - 2, CELL - 2);
        }
        for (const [cx, cy] of cellsOf(cur)) {
          const y = cur.y + cy; if (y < 0) continue;
          box((cur.x + cx) * CELL, 4 + y * CELL, colors[cur.s % colors.length]);
        }
      }
      // 右のわき
      g.fillStyle = sk.bg; g.fillRect(BOARD_W, 0, SIDE, H);
      g.fillStyle = sk.wall; g.fillRect(BOARD_W, 0, 1, H);
      g.fillStyle = sk.sub;
      g.font = 'bold 11px monospace'; g.textAlign = 'left';
      g.fillText('NEXT', BOARD_W + 14, 24);
      for (const [cx, cy] of SHAPES[nxt][0]) box(BOARD_W + 16 + cx * CELL, 34 + cy * CELL, colors[nxt % colors.length]);
      g.fillStyle = sk.sub; g.fillText(t.score, BOARD_W + 14, 130);
      g.fillStyle = sk.ink; g.font = 'bold 15px monospace'; g.fillText(String(sc), BOARD_W + 14, 148);
      g.fillStyle = sk.sub; g.font = 'bold 11px monospace'; g.fillText('LINES', BOARD_W + 14, 176);
      g.fillStyle = sk.ink; g.font = 'bold 15px monospace'; g.fillText(String(ln), BOARD_W + 14, 194);
      g.fillStyle = sk.sub; g.font = 'bold 11px monospace'; g.fillText(t.level, BOARD_W + 14, 222);
      g.fillStyle = sk.ink; g.font = 'bold 15px monospace'; g.fillText(String(lv), BOARD_W + 14, 240);

      if (!dead) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('touchstart', ts);
      cv.removeEventListener('touchmove', tm);
      cv.removeEventListener('touchend', te);
      held.current = {};
    };
  }, [phase, era, lang]);

  const begin = () => { setScore(0); setLines(0); setLevel(1); setPhase('play'); };

  return (
    <>
      <GameFrame
        era={era} title={copy.title} hint={copy.hint}
        stats={<>{t.score}：<b>{score}</b> ／ LINES：<b>{lines}</b> ／ {t.level}：<b>{level}</b></>}
        cover={phase === 'play' ? undefined : (
          <>
            {phase === 'over' ? <div className="bk-msg blink">{t.over}</div> : null}
            <button className="btn" onClick={begin}>{phase === 'idle' ? t.start : t.again}</button>
          </>
        )}
      >
        <canvas ref={ref} width={W} height={H} className="bk-canvas gm-tetris" />
      </GameFrame>
      {phase === 'play' ? (
        <Pad
          onDown={press} onUp={release}
          keys={[{ k: 'l', label: '←' }, { k: 'u', label: '⟳' }, { k: 'r', label: '→' },
                 { k: 'd', label: '↓' }, { k: 's', label: '⤓', wide: true }]}
        />
      ) : null}
    </>
  );
}
