'use client';
import { Shell } from '@/components/Shell';
import { Breakout } from '@/components/Breakout';
import { useSite } from '@/components/Providers';
import { decorate } from '@/lib/decor';
import { GAME_PAGE } from '@/lib/gameNav';

export function GamePage() {
  const { lang, eraView } = useSite();
  const c = GAME_PAGE[lang];
  const d = (s: string, kind: 'head' | 'sub' | 'plain' = 'plain') => decorate(s, eraView, lang, kind);
  const era = eraView === 'mukashi' ? '2005' : eraView;

  return (
    <Shell>
      <div className="panel">
        <div className="pixhead" dangerouslySetInnerHTML={{ __html: d(c.head, 'head') }} />
        <p className="sub" dangerouslySetInnerHTML={{ __html: d(c.sub, 'sub') }} />
        <p>{c.p1}</p>
      </div>
      <Breakout lang={lang} era={era} />
      <div className="panel">
        <p className="hint">{c.p2}</p>
      </div>
    </Shell>
  );
}
