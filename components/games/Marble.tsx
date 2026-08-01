'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { gskin, GT_L, GAME_COPY } from '@/lib/games';
import { GameFrame, Pad } from './Frame';

const W = 360, H = 270, TS = 30;

/*  # かべ／. ゆか／空白 穴（落ちたらやり直し）／* 宝石／G ゴール／S 出発点  */
const MAPS: string[][] = [
  [
    '############',
    '#S...#....*#',
    '#.##.#.##..#',
    '#..#...#..##',
    '##.#.###..*#',
    '#*.....#...#',
    '#.####.#.#.#',
    '#....#...#G#',
    '############',
  ],
  [
    '############',
    '#S..*  ...G#',
    '#.##.###.###',
    '#..#   #...#',
    '#*.#.#.#.#*#',
    '#..#.#...#.#',
    '##.# ###.#.#',
    '#....*.....#',
    '############',
  ],
  [
    '############',
    '#S.*.#..*..#',
    '#.##.#.#.#.#',
    '#..#.#.#.#.#',
    '#.#........#',
    '#.*.#....#.#',
    '#.#.###.##.#',
    '#...*..*..G#',
    '############',
  ],
];

export function Marble({ lang, era = '2010' }: { lang: Lang; era?: string }) {
  const sk = gskin(era);
  const t = GT_L[lang] || GT_L.jp;
  const copy = GAME_COPY.marble[lang] || GAME_COPY.marble.jp;
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'clear' | 'over' | 'all'>('idle');
  const [stage, setStage] = useState(1);
  const [gems, setGems] = useState(0);
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(60);
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
    const wall = (c: number, r: number) => at(c, r) === '#';
    const floor = (c: number, r: number) => at(c, r) !== ' ' && at(c, r) !== '#';

    let jewels: Array<{ x: number; y: number; got: boolean }> = [];
    let start = { x: TS * 1.5, y: TS * 1.5 }, goal = { x: 0, y: 0 };
    for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
      const ch = at(c, r);
      if (ch === '*') jewels.push({ x: c * TS + TS / 2, y: r * TS + TS / 2, got: false });
      if (ch === 'S') start = { x: c * TS + TS / 2, y: r * TS + TS / 2 };
      if (ch === 'G') goal = { x: c * TS + TS / 2, y: r * TS + TS / 2 };
    }
    setTotal(jewels.length);
    setGems(0);

    const R = 9;
    let bx = start.x, by = start.y, vx = 0, vy = 0;
    let got = 0, done = false, raf = 0, tick = 0, fell = 0;
    let time = 60;
    const t0 = performance.now();

    const kd = (e: KeyboardEvent) => {
      const m: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' };
      if (m[e.key]) { held.current[m[e.key]] = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      const m: Record<string, string> = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' };
      if (m[e.key]) held.current[m[e.key]] = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    // 指ですべらせた向きに傾けます
    let tilt = { x: 0, y: 0 };
    let ox = 0, oy = 0, touching = false;
    const ts = (e: TouchEvent) => { const p = e.touches[0]; if (!p) return; e.preventDefault(); ox = p.clientX; oy = p.clientY; touching = true; };
    const tm = (e: TouchEvent) => {
      const p = e.touches[0]; if (!p || !touching) return; e.preventDefault();
      tilt.x = Math.max(-1, Math.min((p.clientX - ox) / 55, 1));
      tilt.y = Math.max(-1, Math.min((p.clientY - oy) / 55, 1));
    };
    const te = (e: TouchEvent) => { e.preventDefault(); touching = false; tilt.x = tilt.y = 0; };
    cv.addEventListener('touchstart', ts, { passive: false });
    cv.addEventListener('touchmove', tm, { passive: false });
    cv.addEventListener('touchend', te, { passive: false });
    cv.addEventListener('touchcancel', te, { passive: false });

    const reset = () => { bx = start.x; by = start.y; vx = vy = 0; fell = 26; };

    const loop = () => {
      tick++;
      time = Math.max(0, 60 - (performance.now() - t0) / 1000);
      setLeft(Math.ceil(time));
      if (time <= 0) { done = true; setPhase('over'); return; }

      const acc = 0.30;
      let ax = tilt.x * acc, ay = tilt.y * acc;
      if (held.current.l) ax -= acc;
      if (held.current.r) ax += acc;
      if (held.current.u) ay -= acc;
      if (held.current.d) ay += acc;
      vx = (vx + ax) * 0.965;
      vy = (vy + ay) * 0.965;
      const sp = Math.hypot(vx, vy);
      if (sp > 5.4) { vx = (vx / sp) * 5.4; vy = (vy / sp) * 5.4; }

      // かべとのあたり（軸ごとに見ます）
      const hitWall = (x: number, y: number) => {
        for (const [dx, dy] of [[-R, 0], [R, 0], [0, -R], [0, R], [-R * .7, -R * .7], [R * .7, -R * .7], [-R * .7, R * .7], [R * .7, R * .7]]) {
          if (wall(Math.floor((x + dx) / TS), Math.floor((y + dy) / TS))) return true;
        }
        return false;
      };
      if (!hitWall(bx + vx, by)) bx += vx; else vx = -vx * 0.45;
      if (!hitWall(bx, by + vy)) by += vy; else vy = -vy * 0.45;

      if (fell > 0) fell--;
      // 穴に落ちる
      if (fell === 0 && !floor(Math.floor(bx / TS), Math.floor(by / TS)) && !wall(Math.floor(bx / TS), Math.floor(by / TS))) reset();

      for (const j of jewels) {
        if (j.got) continue;
        if (Math.hypot(j.x - bx, j.y - by) < R + 8) { j.got = true; got++; setGems(got); }
      }
      if (got >= jewels.length && Math.hypot(goal.x - bx, goal.y - by) < R + 12) {
        done = true;
        setPhase(stage >= MAPS.length ? 'all' : 'clear');
      }

      // 描く
      const camX = Math.max(0, Math.min(bx - W / 2, MW * TS - W));
      const camY = Math.max(0, Math.min(by - H / 2, MH * TS - H));
      g.fillStyle = era === '2010' ? '#0d1b2a' : sk.bg;
      g.fillRect(0, 0, W, H);
      g.save();
      g.translate(-camX, -camY);

      for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
        const ch = at(c, r), x = c * TS, y = r * TS;
        if (ch === ' ') continue;               // 穴はそのまま暗いまま
        if (ch === '#') {
          g.fillStyle = era === '2010' ? '#37474f' : sk.wall;
          g.fillRect(x, y, TS, TS);
          g.fillStyle = 'rgba(255,255,255,.13)'; g.fillRect(x, y, TS, 4);
          g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, y + TS - 5, TS, 5);
        } else {
          // ゆか。市松にうっすら濃淡をつけて立体に見せます
          g.fillStyle = (c + r) % 2 ? (era === '2010' ? '#cfd8dc' : '#3a2a5a') : (era === '2010' ? '#b0bec5' : '#32234f');
          g.fillRect(x, y, TS, TS);
          g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x, y, TS, 1);
        }
      }
      // ゴールのふみ台
      const pulse = 4 + Math.sin(tick / 9) * 2;
      g.fillStyle = got >= jewels.length ? sk.b : 'rgba(255,255,255,.20)';
      g.beginPath(); g.arc(goal.x, goal.y, 13 + pulse * 0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = era === '2010' ? '#0d1b2a' : sk.bg;
      g.beginPath(); g.arc(goal.x, goal.y, 7, 0, Math.PI * 2); g.fill();

      // 宝石
      for (const j of jewels) {
        if (j.got) continue;
        const s = 7 + Math.sin((tick + j.x) / 12) * 1.2;
        g.fillStyle = sk.c;
        g.beginPath();
        g.moveTo(j.x, j.y - s); g.lineTo(j.x + s, j.y); g.lineTo(j.x, j.y + s); g.lineTo(j.x - s, j.y);
        g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.6)';
        g.beginPath(); g.moveTo(j.x, j.y - s); g.lineTo(j.x + s * .45, j.y - s * .2); g.lineTo(j.x, j.y); g.closePath(); g.fill();
      }

      // 玉。影とハイライトで丸みを出します
      g.fillStyle = 'rgba(0,0,0,.35)';
      g.beginPath(); g.ellipse(bx + 3, by + 5, R, R * .8, 0, 0, Math.PI * 2); g.fill();
      const grd = g.createRadialGradient(bx - 3, by - 4, 1, bx, by, R);
      grd.addColorStop(0, '#ffffff');
      grd.addColorStop(0.45, sk.a);
      grd.addColorStop(1, era === '2010' ? '#1a4a8a' : '#5a2a7a');
      g.fillStyle = grd;
      g.beginPath(); g.arc(bx, by, R, 0, Math.PI * 2); g.fill();
      g.restore();

      if (!done) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('touchstart', ts);
      cv.removeEventListener('touchmove', tm);
      cv.removeEventListener('touchend', te);
      cv.removeEventListener('touchcancel', te);
      held.current = {};
    };
  }, [phase, stage, era]);

  const begin = (st: number) => { setStage(st); setLeft(60); setPhase('play'); };

  return (
    <>
      <GameFrame
        era={era} title={copy.title} hint={copy.hint}
        stats={<>{t.level}：<b>{stage}</b> ／ ◆：<b>{gems}</b>/<b>{total}</b> ／ {t.time}：<b>{left}</b></>}
        cover={phase === 'play' ? undefined : (
          <>
            {phase === 'clear' ? <div className="bk-msg blink">{t.clear}</div> : null}
            {phase === 'over' ? <div className="bk-msg blink">{t.over}</div> : null}
            {phase === 'all' ? <div className="bk-msg blink">{t.all}</div> : null}
            <button className="btn" onClick={() => begin(phase === 'clear' ? stage + 1 : 1)}>
              {phase === 'idle' ? t.start : phase === 'clear' ? t.next : t.again}
            </button>
          </>
        )}
      >
        <canvas ref={ref} width={W} height={H} className="bk-canvas gm-marble" />
      </GameFrame>
      {phase === 'play' ? (
        <Pad onDown={press} onUp={release}
          keys={[{ k: 'l', label: '←' }, { k: 'u', label: '↑' }, { k: 'd', label: '↓' }, { k: 'r', label: '→' }]} />
      ) : null}
    </>
  );
}
