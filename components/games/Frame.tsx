'use client';

import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n';
import { GAME_WORD, WORD_L } from '@/lib/games';

/** どのゲームでも同じ額ぶち。時代ごとの見た目は .bk-* の CSS がつけてくれます */
export function GameFrame({
  era, title, hint, children, cover, stats, narrow,
}: {
  era: string; title: string; hint: string; children: ReactNode;
  cover?: ReactNode; stats?: ReactNode; narrow?: boolean;
}) {
  return (
    <div className={`panel bk-wrap gm-wrap bk-e${era}`} style={{ textAlign: 'center' }}>
      <div className="pixhead">{title}</div>
      <div className={`bk-stage${narrow ? ' gm-narrow' : ''}`}>
        {children}
        {cover ? <div className="bk-cover">{cover}</div> : null}
      </div>
      {stats ? <div className="bk-score">{stats}</div> : null}
      <div className="hint">{hint}</div>
    </div>
  );
}

/** スマホ用の十字ボタン。押しっぱなしにも対応します */
export function Pad({
  keys, onDown, onUp,
}: {
  keys: Array<{ k: string; label: string; wide?: boolean }>;
  onDown: (k: string) => void; onUp: (k: string) => void;
}) {
  return (
    <div className="gm-pad">
      {keys.map((b) => (
        <button
          key={b.k}
          type="button"
          className={`gm-key${b.wide ? ' gm-key-wide' : ''}`}
          onPointerDown={(e) => { e.preventDefault(); onDown(b.k); }}
          onPointerUp={(e) => { e.preventDefault(); onUp(b.k); }}
          onPointerLeave={() => onUp(b.k)}
          onPointerCancel={() => onUp(b.k)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

/** 角を丸めた四角。古い Safari には roundRect が無いので、その時は普通の四角にします */
export function roundBox(
  g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
) {
  if (!r) { g.fillRect(x, y, w, h); return; }
  const rr = (g as any).roundRect;
  if (typeof rr === 'function') { g.beginPath(); rr.call(g, x, y, w, h, r); g.fill(); return; }
  const k = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + k, y);
  g.arcTo(x + w, y, x + w, y + h, k);
  g.arcTo(x + w, y + h, x, y + h, k);
  g.arcTo(x, y + h, x, y, k);
  g.arcTo(x, y, x + w, y, k);
  g.closePath();
  g.fill();
}


/** 最高ステージまで行った方に、秘密の部屋の合言葉をお伝えします */
export function WordPrize({ lang }: { lang: Lang }) {
  const w = WORD_L[lang] || WORD_L.jp;
  return (
    <div className="bk-word">{w.before}<b>{GAME_WORD}</b>{w.after}</div>
  );
}
