'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { RoomBack } from '@/components/RoomBack';
import { RoomGuard } from '@/components/RoomGuard';

export function RoomNotePage() {
  return (
    <RoomGuard room="note">
    <Shell>
      <div className="panel">
        <T k="rn-head" as="div" kind="head" className="pixhead" />
        <T k="rn-sub" as="p" kind="sub" className="sub" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div className="panel" key={i}>
          <T k={`rn-t${i}`} as="div" kind="head" className="pixhead" style={{ fontSize: 17 }} />
          <T k={`rn-b${i}`} as="p" />
        </div>
      ))}
      <RoomBack />
    </Shell>
    </RoomGuard>
  );
}
