'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { gskin, GT_L, GAME_COPY } from '@/lib/games';
import { GameFrame, Pad, WordPrize } from './Frame';

const W = 260, H = 340;
const ROAD_L = 34, ROAD_R = W - 34;
const LANES = 4;
const LANE_W = (ROAD_R - ROAD_L) / LANES;
const CAR_W = 26, CAR_H = 40;
const MAX_STAGE = 5;
/** ステージごとの道のり（ここまで走り切れば次へ）と、混みぐあい */
const GOAL = (st: number) => 500 + st * 320;

/** 8×10 のドット絵。1 が車体、2 が窓、3 がライト */
const CAR: number[][] = [
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,3,1,1,3,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1],
];

export function Racer({ lang, era = '2005' }: { lang: Lang; era?: string }) {
  const sk = gskin(era);
  const t = GT_L[lang] || GT_L.jp;
  const copy = GAME_COPY.racer[lang] || GAME_COPY.racer.jp;
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

    const px = sk.pixel;
    const enemyColors = [sk.a, sk.c, sk.d, sk.e];
    let carX = W / 2 - CAR_W / 2;
    const goal = GOAL(stage);
    let sc = 0, lf = life, dist = 0, dead = false, raf = 0, hurt = 0;
    let cars: Array<{ x: number; y: number; v: number; c: string }> = [];
    let trees: Array<{ x: number; y: number; s: number }> = [];
    let tick = 0;

    const speed = () => 2.9 + stage * 0.45 + Math.min(dist / 1100, 3.6);

    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { held.current.l = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { held.current.r = true; e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') held.current.l = false;
      if (e.key === 'ArrowRight') held.current.r = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const at = (clientX: number) => {
      const b = cv.getBoundingClientRect();
      carX = Math.max(ROAD_L, Math.min(((clientX - b.left) / b.width) * W - CAR_W / 2, ROAD_R - CAR_W));
    };
    const tv = (e: TouchEvent) => { if (e.touches[0]) { e.preventDefault(); at(e.touches[0].clientX); } };
    const mv = (e: MouseEvent) => at(e.clientX);
    cv.addEventListener('touchstart', tv, { passive: false });
    cv.addEventListener('touchmove', tv, { passive: false });
    cv.addEventListener('mousemove', mv);

    /** ドット絵を大きなマス目で描きます */
    const sprite = (x: number, y: number, body: string, glass: string, lamp: string, flip: boolean) => {
      const cw = CAR_W / 8, ch = CAR_H / 10;
      for (let r = 0; r < 10; r++) {
        const row = flip ? CAR[9 - r] : CAR[r];
        for (let c = 0; c < 8; c++) {
          const v = row[c];
          if (!v) continue;
          g.fillStyle = v === 1 ? body : v === 2 ? glass : lamp;
          g.fillRect(Math.round(x + c * cw), Math.round(y + r * ch), Math.ceil(cw), Math.ceil(ch));
        }
      }
    };

    const loop = () => {
      tick++;
      const v = speed();
      dist += v;
      sc = Math.floor(dist / 10);
      setScore(sc);

      if (held.current.l) carX = Math.max(ROAD_L, carX - 4.6);
      if (held.current.r) carX = Math.min(ROAD_R - CAR_W, carX + 4.6);

      // 対向車を出す
      if (tick % Math.max(16, 56 - stage * 5 - Math.floor(dist / 700)) === 0) {
        const lane = Math.floor(Math.random() * LANES);
        const x = ROAD_L + lane * LANE_W + (LANE_W - CAR_W) / 2;
        if (!cars.some((c) => c.y < 70 && Math.abs(c.x - x) < CAR_W + 6)) {
          cars.push({ x, y: -CAR_H, v: v * (0.55 + Math.random() * 0.5), c: enemyColors[(Math.random() * enemyColors.length) | 0] });
        }
      }
      if (tick % 9 === 0) trees.push({ x: Math.random() < 0.5 ? 8 : W - 24, y: -20, s: 10 + Math.random() * 8 });

      cars.forEach((c) => { c.y += v + c.v; });
      trees.forEach((c) => { c.y += v; });
      cars = cars.filter((c) => c.y < H + 60);
      trees = trees.filter((c) => c.y < H + 30);

      // ぶつかったか
      if (hurt > 0) hurt--;
      const cy = H - CAR_H - 14;
      for (const c of cars) {
        if (hurt > 0) break;
        if (c.y + CAR_H - 6 > cy && c.y + 6 < cy + CAR_H && c.x + CAR_W - 5 > carX && c.x + 5 < carX + CAR_W) {
          lf -= 1; setLife(lf); hurt = 70;
          cars = cars.filter((o) => o !== c);
          if (lf <= 0) { dead = true; setPhase('over'); }
          break;
        }
      }

      // ゴール（この道のりを走り切ったら次のステージへ）
      if (!dead && sc >= goal) {
        dead = true;
        setPhase(stage >= MAX_STAGE ? 'all' : 'clear');
      }

      // 描く
      g.fillStyle = era === '2010' ? '#e8f0e8' : sk.bg;
      g.fillRect(0, 0, W, H);
      // 路肩（道とはっきり分かれるように、暗く沈ませます）
      g.fillStyle = era === '1995' ? '#002800' : era === '2010' ? '#c8ddc8' : '#150029';
      g.fillRect(0, 0, ROAD_L, H); g.fillRect(ROAD_R, 0, W - ROAD_R, H);
      // 道
      g.fillStyle = era === '2010' ? '#6b7075' : era === '1995' ? '#242424' : '#3d2a63';
      g.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);
      // 道のふちに落ちる影。立体感が出ます
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.fillRect(ROAD_L, 0, 5, H); g.fillRect(ROAD_R - 5, 0, 5, H);
      // 白線（ドット風の点線）
      g.fillStyle = sk.wall;
      for (let l = 1; l < LANES; l++) {
        const x = ROAD_L + l * LANE_W - px / 2;
        for (let y = -((dist * 1.2) % 40); y < H; y += 40) g.fillRect(x, y, px, 18);
      }
      g.fillStyle = sk.ink;
      g.fillRect(ROAD_L - px, 0, px, H); g.fillRect(ROAD_R, 0, px, H);
      // 沿道の木
      for (const tr of trees) {
        g.fillStyle = era === '1995' ? '#00c000' : era === '2010' ? '#5bb974' : '#8bff6b';
        g.fillRect(tr.x, tr.y, tr.s, tr.s);
        g.fillStyle = sk.shade; g.fillRect(tr.x, tr.y, tr.s, px);
      }
      // 対向車
      for (const c of cars) sprite(c.x, c.y, c.c, sk.bg, sk.ink, true);
      // じぶんの車（ぶつかった直後は点滅）
      if (hurt === 0 || Math.floor(hurt / 5) % 2 === 0) {
        sprite(carX, cy, sk.b, sk.bg, sk.ink, false);
      }
      // のこりの道のり（上の帯）
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, 12);
      g.fillStyle = sk.b; g.fillRect(0, 0, Math.min(W, (sc / goal) * W), 12);
      g.fillStyle = sk.ink; g.font = 'bold 9px monospace'; g.textAlign = 'center';
      g.fillText(String(Math.max(0, goal - sc)), W / 2, 9);

      if (!dead) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv.removeEventListener('touchstart', tv);
      cv.removeEventListener('touchmove', tv);
      cv.removeEventListener('mousemove', mv);
      held.current = {};
    };
  }, [phase, stage, era]);

  const begin = (st: number, keep: boolean) => {
    setStage(st);
    setScore(0);
    if (!keep) setLife(3);
    setPhase('play');
  };

  return (
    <>
      <GameFrame
        era={era} title={copy.title} hint={copy.hint} narrow
        stats={<>{t.level}：<b>{stage}</b>/{MAX_STAGE} ／ {t.score}：<b>{score}</b> ／ {t.life}：<b>{Math.max(0, life)}</b></>}
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
        <canvas ref={ref} width={W} height={H} className="bk-canvas gm-racer" />
      </GameFrame>
      {phase === 'play' ? (
        <Pad onDown={press} onUp={release} keys={[{ k: 'l', label: '←', wide: true }, { k: 'r', label: '→', wide: true }]} />
      ) : null}
    </>
  );
}
