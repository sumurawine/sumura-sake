'use client';
import { Shell } from '@/components/Shell';
import { A } from '@/components/A';
import { RoomBack } from '@/components/RoomBack';
import { RoomGuard } from '@/components/RoomGuard';
import { useSite } from '@/components/Providers';
import { decorate } from '@/lib/decor';
import { GAME_ROOM } from '@/lib/gameRoom';

export function RoomGamePage() {
  const { lang, eraView } = useSite();
  const c = GAME_ROOM[lang];
  const d = (s: string, kind: 'head' | 'sub' | 'btn' | 'plain' = 'plain') => decorate(s, eraView, lang, kind);

  return (
    <RoomGuard room="game">
      <Shell>
        <div className="panel">
          <div className="pixhead" dangerouslySetInnerHTML={{ __html: d(c.head, 'head') }} />
          <p className="sub" dangerouslySetInnerHTML={{ __html: d(c.sub, 'sub') }} />
          <p>{c.p1}</p>
          <ul>
            <li>{c.l1}</li>
            <li>{c.l2}</li>
            <li>{c.l3}</li>
          </ul>
          <p>{c.p2}</p>
          <p className="hint">{c.note}</p>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <A href={`/contact?item=${encodeURIComponent(c.item)}`} style={{ textDecoration: 'none' }}>
              <span className="btn" dangerouslySetInnerHTML={{ __html: d(c.btn, 'btn') }} />
            </A>
          </div>
        </div>
        <RoomBack />
      </Shell>
    </RoomGuard>
  );
}
