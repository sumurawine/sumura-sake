'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { RoomBack } from '@/components/RoomBack';
import { RoomGuard } from '@/components/RoomGuard';
import { useSite } from '@/components/Providers';
import { AP, CL, W, UI, yen, type Lang5 } from '@/lib/primeur';

const ITEM = 'ボルドー2024 プリムール 予約希望';

function apName(i: number, l: Lang5) {
  const a = AP[i];
  return l === 'jp' ? a.jp : l === 'zh' ? a.zh : l === 'ko' ? a.ko : a.la;
}
function wName(w: (typeof W)[number], l: Lang5) {
  return l === 'jp' ? w[2] : l === 'zh' ? w[4] : l === 'ko' ? w[5] : w[3];
}

export function RoomPrimeurPage() {
  const { lang } = useSite();
  const l = lang as Lang5;
  const u = UI[l] ?? UI.jp;

  const groups: number[] = [];
  W.forEach((w) => { if (!groups.includes(w[1])) groups.push(w[1]); });

  return (
    <RoomGuard room="primeur">
    <Shell>
      <div className="panel">
        <T k="rp-head" as="div" kind="head" className="pixhead" />
        <T k="rp-sub" as="p" kind="sub" className="sub" />
        <T k="rp-p1" as="p" />
        <T k="rp-p2" as="p" />
        <table>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i}><T k={`rp-l${i}`} as="th" /><T k={`rp-v${i}`} as="td" /></tr>
            ))}
          </tbody>
        </table>
        <T k="rp-note1" as="p" className="hint" />
      </div>

      <div id="pr-list">
        {groups.map((g) => {
          const list = W.filter((w) => w[1] === g);
          return (
            <div className="panel" key={g}>
              <div className="pixhead" style={{ fontSize: 17 }}>
                ◆ {apName(g, l)}{' '}
                <span className="hint" style={{ fontSize: 13 }}>{list.length} {u.cnt}</span>
              </div>
              {list.map((w) => {
                const cl = w[6] ? (CL[w[6]][l] || CL[w[6]].jp) : '';
                return (
                  <div key={w[0]} style={{ borderTop: '1px dashed #5a4626', padding: '9px 0' }} className="x-dash">
                    <div>
                      <span className="hint">{('0' + w[0]).slice(-2)}</span>{' '}
                      <b className="x-gold">{wName(w, l)}</b>
                    </div>
                    <div className="hint">
                      {cl ? cl + ' ／ ' : ''}WA ({w[7]}) · JS {w[8]}
                    </div>
                    <div style={{ marginTop: 3 }}>
                      {u.one} <b>{yen(w[9], l)}</b>　／　{u.six} <b>{yen(w[10], l)}</b>
                    </div>
                    {w[11] ? <div className="hint" style={{ color: '#ffb3b3' }}>{u.adj}</div> : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="panel">
        <T k="rp-terms-head" as="div" kind="head" className="pixhead" style={{ fontSize: 17 }} />
        <ul>
          {[1, 2, 3, 4, 5, 6].map((i) => <T key={i} k={`rp-t${i}`} as="li" />)}
        </ul>
      </div>

      <div className="panel" style={{ textAlign: 'center' }}>
        <A href={`/contact?item=${encodeURIComponent(ITEM)}`} style={{ textDecoration: 'none' }}>
          <T k="rp-btn" as="span" kind="btn" className="btn" />
        </A>
        <T k="rp-btn-note" as="div" className="hint" style={{ marginTop: 8 }} />
      </div>

      <RoomBack />
    </Shell>
    </RoomGuard>
  );
}
