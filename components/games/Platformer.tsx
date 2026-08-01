'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { gskin, GT_L, GAME_COPY } from '@/lib/games';
import { GameFrame, Pad, roundBox, WordPrize } from './Frame';

const W = 420, H = 220, TS = 20;

/*  X 地面／ = 足場／ o ぶどう（あつめる）／ k 栓ぬけオバケ／ N 暖簾（ゴール）／ ^ とげ  */
const MAPS: string[][] = [
  [
    '                                                            ',
    '                                                            ',
    '                        o o o                               ',
    '                       =======                              ',
    '            o                                    o o        ',
    '          =====            k              o     =======     ',
    '                        ======         =====                ',
    '                                                        N   ',
    '   k                 o          k                  k        ',
    'XXXXXXXXXX   XXXXXXXXXXXXXX   XXXXXXXXXX   XXXXXXXXXXXXXXXXX',
    'XXXXXXXXXX   XXXXXXXXXXXXXX   XXXXXXXXXX   XXXXXXXXXXXXXXXXX',
  ],
  [
    '                                                            ',
    '                  o o                          o o o        ',
    '                 ======                       =======       ',
    '        o                     k                             ',
    '      =====      k        =======        o                  ',
    '                                       =====          N     ',
    '   o        k          o         k                          ',
    ' =====   =======    =======   ========          =========   ',
    '                                                            ',
    '                                                            ',
    'XXXX^^XXXXXX^^XXXXXXXX^^XXXXXXXXX^^XXXXXXXX^^XXXXXXXXXXXXXXX',
  ],
  [
    '                                                            ',
    '            o o o                    o o o                  ',
    '           ========                 ========                ',
    '                          o o                               ',
    '     k              k    =====    k              k     N    ',
    '  ======         ======          ======       ==========    ',
    '            o                o                              ',
    '         =======          =======          o o              ',
    '                                        ==========          ',
    '   k                  k                              k      ',
    'XXXXXXXX^^^XXXXXXXXXXXXXXXX^^^XXXXXXXXXXXX^^^XXXXXXXXXXXXXXX',
  ],
  [
    '                                                            ',
    '       o o          o o o           o o          o o o      ',
    '      ======       ========        ======       ========    ',
    '                              o                             ',
    '   k        k           k    ===        k    k         N    ',
    ' ======  ======      ======           ======        ======= ',
    '           o                  o                 o           ',
    '        =====     k        ======            ======         ',
    '                =======                  o                  ',
    '   k                          k       ========         k    ',
    'XXXX^^XXXXX^^^XXXXX^^XXXXXXX^^^XXXXX^^^XXXXXX^^XXXXXXXXXXXXX',
  ],
];

type Ent = { x: number; y: number; vx: number; alive: boolean };

export function Platformer({ lang, era = '2005' }: { lang: Lang; era?: string }) {
  const sk = gskin(era);
  const t = GT_L[lang] || GT_L.jp;
  const copy = GAME_COPY.platform[lang] || GAME_COPY.platform.jp;
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'clear' | 'over' | 'all'>('idle');
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [life, setLife] = useState(3);
  const held = useRef<Record<string, boolean>>({});
  const press = useCallback((k: string) => { held.current[k] = true; }, []);
  const release = useCallback((k: string) => { held.current[k] = false; }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const cv = ref.current, g = cv?.getContext('2d');
    if (!cv || !g) return;

    const map = MAPS[(stage - 1) % MAPS.length];
    const MH = map.length, MW = map[0].length;
    const at = (c: number, r: number) => (r < 0 || r >= MH || c < 0 || c >= MW ? ' ' : map[r][c] || ' ');
    const solid = (c: number, r: number) => at(c, r) === 'X' || at(c, r) === '=';
    const spike = (c: number, r: number) => at(c, r) === '^';

    let grapes: Ent[] = [];
    let goblins: Ent[] = [];
    let goal = { x: 0, y: 0 };
    for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
      const ch = at(c, r);
      if (ch === 'o') grapes.push({ x: c * TS + 4, y: r * TS + 2, vx: 0, alive: true });
      if (ch === 'k') goblins.push({ x: c * TS, y: r * TS + 2, vx: 0.8, alive: true });
      if (ch === 'N') goal = { x: c * TS, y: r * TS };
    }

    const PW = 14, PH = 18;
    let px = 20, py = (MH - 3) * TS, vx = 0, vy = 0, onGround = false, face = 1;
    let sc = score, lf = life, done = false, raf = 0, cam = 0, hurt = 0, tick = 0;

    const kd = (e: KeyboardEvent) => {
      const m: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'j', ' ': 'j', Spacebar: 'j' };
      if (m[e.key]) { held.current[m[e.key]] = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      const m: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'j', ' ': 'j', Spacebar: 'j' };
      if (m[e.key]) held.current[m[e.key]] = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    // 画面の左半分＝歩く、右半分＝ジャンプ（スマホ）
    const tap = (e: TouchEvent) => {
      e.preventDefault();
      const b = cv.getBoundingClientRect();
      held.current.l = held.current.r = held.current.j = false;
      for (let i = 0; i < e.touches.length; i++) {
        const rx = (e.touches[i].clientX - b.left) / b.width;
        const ry = (e.touches[i].clientY - b.top) / b.height;
        if (ry > 0.55 && rx < 0.25) held.current.l = true;
        else if (ry > 0.55 && rx < 0.5) held.current.r = true;
        else held.current.j = true;
      }
    };
    const tend = (e: TouchEvent) => { e.preventDefault(); if (!e.touches.length) held.current.l = held.current.r = held.current.j = false; };
    cv.addEventListener('touchstart', tap, { passive: false });
    cv.addEventListener('touchmove', tap, { passive: false });
    cv.addEventListener('touchend', tend, { passive: false });

    const hitsSolid = (x: number, y: number) => {
      for (const [cx, cy] of [[x, y], [x + PW, y], [x, y + PH], [x + PW, y + PH], [x + PW / 2, y + PH]]) {
        if (solid(Math.floor(cx / TS), Math.floor(cy / TS))) return true;
      }
      return false;
    };
    const hitsSpike = (x: number, y: number) => spike(Math.floor((x + PW / 2) / TS), Math.floor((y + PH) / TS));

    const respawn = () => { px = 20; py = (MH - 3) * TS; vx = vy = 0; hurt = 60; };

    /** 前かけ小僧。頭に手ぬぐい、紺の前かけ、いつも笑顔 */
    const drawHero = (x: number, y: number) => {
      const s = 2; // ドットの大きさ
      const skin = '#f7d9b0', cloth = '#1f3f8f', band = '#e8534a', hair = '#2a1a12';
      const P = (cx: number, cy: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x + cx * s, y + cy * s, w * s, h * s); };
      P(1, 0, 5, 1, band);          // 手ぬぐい
      P(1, 1, 5, 1, hair);          // 前がみ
      P(1, 2, 5, 3, skin);          // かお
      g.fillStyle = '#20140c';
      g.fillRect(x + 2 * s, y + 3 * s, s, s);
      g.fillRect(x + 4 * s, y + 3 * s, s, s);
      P(2, 5, 3, 1, '#c98a63');     // 口もと
      P(0, 6, 7, 4, cloth);         // 前かけ（からだ）
      P(2, 7, 3, 2, '#f4ece4');     // 前かけの白いところ（屋号）
      g.fillStyle = cloth;
      g.fillRect(x + 3 * s, y + 7 * s, s, 2 * s);
      P(0, 6, 7, 1, '#16306e');     // 肩ひも
      const step = Math.floor(tick / 6) % 2;
      P(1, 10, 2, 2, step ? skin : '#3a2a1a');   // あし
      P(4, 10, 2, 2, step ? '#3a2a1a' : skin);
      if (face < 0) { /* 向きは目の位置で表します */ }
    };

    const loop = () => {
      tick++;
      // うごき
      const acc = 0.7, max = 3.1;
      if (held.current.l) { vx = Math.max(-max, vx - acc); face = -1; }
      else if (held.current.r) { vx = Math.min(max, vx + acc); face = 1; }
      else vx *= 0.78;
      if (held.current.j && onGround) { vy = -8.2; onGround = false; }
      vy = Math.min(vy + 0.46, 11);

      // 横
      let nx = px + vx;
      if (hitsSolid(nx, py)) { vx = 0; nx = px; }
      px = Math.max(0, Math.min(nx, MW * TS - PW));
      // 縦
      let ny = py + vy;
      if (hitsSolid(px, ny)) {
        if (vy > 0) { ny = Math.floor((ny + PH) / TS) * TS - PH - 0.01; onGround = true; }
        else ny = Math.floor(ny / TS) * TS + TS + 0.01;
        vy = 0;
      } else onGround = false;
      py = ny;

      if (hurt > 0) hurt--;

      // 落ちた・とげ
      if (py > MH * TS + 20 || (hurt === 0 && hitsSpike(px, py))) {
        lf -= 1; setLife(lf);
        if (lf <= 0) { done = true; setPhase('over'); }
        else respawn();
      }

      // 栓ぬけオバケ
      for (const k of goblins) {
        if (!k.alive) continue;
        const nxk = k.x + k.vx;
        const footC = Math.floor((nxk + (k.vx > 0 ? 16 : 0)) / TS);
        const footR = Math.floor((k.y + 18) / TS);
        if (!solid(footC, footR) || solid(footC, footR - 1)) k.vx = -k.vx;
        else k.x = nxk;
        if (px + PW > k.x + 2 && px < k.x + 14 && py + PH > k.y + 2 && py < k.y + 16) {
          if (vy > 1.5 && py + PH < k.y + 14) { k.alive = false; vy = -6.4; sc += 120; setScore(sc); }
          else if (hurt === 0) {
            lf -= 1; setLife(lf); hurt = 70;
            if (lf <= 0) { done = true; setPhase('over'); } else { vy = -5; vx = -face * 4; }
          }
        }
      }

      // ぶどう
      for (const b of grapes) {
        if (!b.alive) continue;
        if (px + PW > b.x && px < b.x + 12 && py + PH > b.y && py < b.y + 16) { b.alive = false; sc += 60; setScore(sc); }
      }

      // ゴール（暖簾）
      if (px + PW > goal.x && px < goal.x + TS && py + PH > goal.y && py < goal.y + TS * 2) {
        done = true;
        sc += 400 + grapes.filter((b) => !b.alive).length * 20; setScore(sc);
        setPhase(stage >= MAPS.length ? 'all' : 'clear');
      }

      // カメラ
      cam = Math.max(0, Math.min(px - W / 2 + PW / 2, MW * TS - W));

      // 描く
      g.fillStyle = era === '2010' ? '#eaf3ff' : sk.bg;
      g.fillRect(0, 0, W, H);
      // 遠くの町なみ
      g.fillStyle = era === '1995' ? '#003c00' : era === '2010' ? '#d5e6f7' : '#2b0f57';
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 96 - cam * 0.35) % (W + 120)) - 60;
        g.fillRect(bx, H - 90 - (i % 3) * 26, 62, 90 + (i % 3) * 26);
      }
      g.save();
      g.translate(-cam, 0);
      const c0 = Math.floor(cam / TS), c1 = Math.min(MW, c0 + Math.ceil(W / TS) + 2);
      for (let r = 0; r < MH; r++) for (let c = c0; c < c1; c++) {
        const ch = at(c, r), x = c * TS, y = r * TS;
        if (ch === 'X' || ch === '=') {
          g.fillStyle = ch === 'X' ? (era === '2010' ? '#8d6e63' : sk.wall) : sk.a;
          roundBox(g, x, y, TS, TS, sk.round);
          g.fillStyle = sk.shade; g.fillRect(x, y, TS, 3);
        } else if (ch === '^') {
          g.fillStyle = era === '2010' ? '#db4437' : sk.d;
          g.beginPath(); g.moveTo(x, y + TS); g.lineTo(x + TS / 2, y + 4); g.lineTo(x + TS, y + TS); g.closePath(); g.fill();
        }
      }
      // ぶどう（ワインの実。ひと房ずつ、ふわりと揺れます）
      for (const b of grapes) {
        if (!b.alive) continue;
        const bob = Math.sin((tick + b.x) / 14) * 2;
        const ox = b.x + 6, oy = b.y + 5 + bob;
        g.fillStyle = '#4a7c2f';                       // つる
        g.fillRect(ox - 1, oy - 6, 2, 4);
        g.fillStyle = '#5fa03c';                       // 葉っぱ
        g.fillRect(ox + 1, oy - 7, 5, 3);
        for (const [gx, gy] of [[-3, 0], [0, 0], [3, 0], [-2, 3], [1, 3], [-1, 6]]) {
          g.fillStyle = '#7b2d8e';                     // 実
          g.fillRect(ox + gx - 1, oy + gy, 3, 3);
          g.fillStyle = 'rgba(255,255,255,.45)';       // つや
          g.fillRect(ox + gx - 1, oy + gy, 1, 1);
        }
      }
      // 栓ぬけオバケ
      for (const k of goblins) {
        if (!k.alive) continue;
        g.fillStyle = era === '2010' ? '#a1887f' : '#c98a3d';
        g.fillRect(k.x, k.y + 4, 15, 12);
        g.fillStyle = '#7a4f1d'; g.fillRect(k.x + 2, k.y, 11, 5);
        g.fillStyle = '#fff'; g.fillRect(k.x + 3, k.y + 7, 3, 3); g.fillRect(k.x + 9, k.y + 7, 3, 3);
        g.fillStyle = '#000';
        const e = k.vx > 0 ? 1 : 0;
        g.fillRect(k.x + 4 + e, k.y + 8, 2, 2); g.fillRect(k.x + 10 + e, k.y + 8, 2, 2);
      }
      // 暖簾（ゴール）
      g.fillStyle = '#1f3f8f'; g.fillRect(goal.x - 4, goal.y, TS + 8, 6);
      for (let i = 0; i < 3; i++) g.fillRect(goal.x - 4 + i * 10, goal.y + 6, 8, 20);
      g.fillStyle = '#f4ece4'; g.fillRect(goal.x + 1, goal.y + 12, 4, 4);
      // 主人公
      if (hurt === 0 || Math.floor(hurt / 5) % 2 === 0) drawHero(px, py);
      g.restore();

      if (!done) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('touchstart', tap);
      cv.removeEventListener('touchmove', tap);
      cv.removeEventListener('touchend', tend);
      held.current = {};
    };
  }, [phase, stage, era]);

  const begin = (st: number, keep: boolean) => {
    setStage(st);
    if (!keep) { setScore(0); setLife(3); }
    setPhase('play');
  };

  return (
    <>
      <GameFrame
        era={era} title={copy.title} hint={copy.hint}
        stats={<>{t.level}：<b>{stage}</b>/{MAPS.length} ／ {t.score}：<b>{score}</b> ／ {t.life}：<b>{Math.max(0, life)}</b></>}
        cover={phase === 'play' ? undefined : (
          <>
            {phase === 'clear' ? <div className="bk-msg blink">{t.clear}</div> : null}
            {phase === 'over' ? <div className="bk-msg blink">{t.over}</div> : null}
            {phase === 'all' ? (<><div className="bk-msg blink">{t.all}</div><WordPrize lang={lang} /></>) : null}
            <button className="btn" onClick={() => (phase === 'clear' ? begin(stage + 1, true) : begin(1, false))}>
              {phase === 'idle' ? t.start : phase === 'clear' ? t.next : t.again}
            </button>
          </>
        )}
      >
        <canvas ref={ref} width={W} height={H} className="bk-canvas gm-plat" />
      </GameFrame>
      {phase === 'play' ? (
        <Pad onDown={press} onUp={release}
          keys={[{ k: 'l', label: '←' }, { k: 'r', label: '→' }, { k: 'j', label: '↥', wide: true }]} />
      ) : null}
    </>
  );
}
