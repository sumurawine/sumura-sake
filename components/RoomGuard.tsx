'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/** 合言葉を通っていない場合は入口へ戻します */
export function RoomGuard({ room, children }: { room: string; children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let pass = false;
    try { pass = sessionStorage.getItem('sumura-room-' + room) === '1'; } catch {}
    if (pass) setOk(true);
    else router.replace('/secret?locked=1');
  }, [room, router]);
  if (!ok) return null;
  return <>{children}</>;
}
