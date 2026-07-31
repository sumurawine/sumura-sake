'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';
import { RoomBack } from '@/components/RoomBack';
import { RoomGuard } from '@/components/RoomGuard';

const ITEM = '秘密のセラー在庫リストのご請求';

export function RoomCellarPage() {
  return (
    <RoomGuard room="cellar">
    <Shell>
      <div className="panel">
        <T k="rc-head" as="div" kind="head" className="pixhead" />
        <T k="rc-sub" as="p" kind="sub" className="sub" />
        <T k="rc-p1" as="p" />
        <ul>
          <T k="rc-l1" as="li" />
          <T k="rc-l2" as="li" />
          <T k="rc-l3" as="li" />
          <T k="rc-l4" as="li" />
        </ul>
        <T k="rc-p2" as="p" />
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <A href={`/contact?item=${encodeURIComponent(ITEM)}`} style={{ textDecoration: 'none' }}>
            <T k="rc-btn" as="span" kind="btn" className="btn" />
          </A>
        </div>
      </div>
      <RoomBack />
    </Shell>
    </RoomGuard>
  );
}
