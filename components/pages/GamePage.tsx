'use client';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Breakout } from '@/components/Breakout';
import { Tetris } from '@/components/games/Tetris';
import { Racer } from '@/components/games/Racer';
import { Platformer } from '@/components/games/Platformer';
import { Marble } from '@/components/games/Marble';
import { useSite } from '@/components/Providers';
import { decorate } from '@/lib/decor';
import { GAME_PAGE } from '@/lib/gameNav';
import { gamesOf, GAME_TITLES, type GameKey } from '@/lib/games';

export function GamePage() {
  const { lang, eraView } = useSite();
  const c = GAME_PAGE[lang];
  const d = (s: string, kind: 'head' | 'sub' | 'plain' = 'plain') => decorate(s, eraView, lang, kind);
  const era = eraView === 'mukashi' ? '2005' : eraView;
  const list = gamesOf(era);
  const [pick, setPick] = useState<GameKey>('breakout');
  const cur = list.includes(pick) ? pick : list[0];

  return (
    <Shell>
      <div className="panel">
        <div className="pixhead" dangerouslySetInnerHTML={{ __html: d(c.head, 'head') }} />
        <p className="sub" dangerouslySetInnerHTML={{ __html: d(c.sub, 'sub') }} />
        <p>{c.p1}</p>
        <div className="gm-menu">
          {list.map((k) => (
            <button
              key={k}
              type="button"
              className={`gm-tab${k === cur ? ' is-on' : ''}`}
              onClick={() => setPick(k)}
            >
              {GAME_TITLES[k][lang]}
            </button>
          ))}
        </div>
      </div>

      {cur === 'breakout' ? <Breakout lang={lang} era={era} /> : null}
      {cur === 'tetris' ? <Tetris lang={lang} era={era} /> : null}
      {cur === 'racer' ? <Racer lang={lang} era={era} /> : null}
      {cur === 'platform' ? <Platformer lang={lang} era={era} /> : null}
      {cur === 'marble' ? <Marble lang={lang} era={era} /> : null}

      <div className="panel">
        <p className="hint">{c.p2}</p>
      </div>
    </Shell>
  );
}
