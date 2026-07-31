'use client';

import { asset } from '@/lib/paths';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite } from './Providers';
import type { Lang } from '@/lib/i18n';

const L: Record<Lang, { leave: string; bye: string; again: string }> = {
  jp: { leave: '退店', bye: 'またのお越しをお待ちしております。', again: '入口へ戻る' },
  en: { leave: 'LEAVE', bye: 'We look forward to welcoming you again.', again: 'Back to the entrance' },
  fr: { leave: 'SORTIE', bye: 'Au plaisir de vous revoir.', again: 'Retour à l’entrée' },
  zh: { leave: '离店', bye: '期待您的再次光临。', again: '返回入口' },
  ko: { leave: '퇴점', bye: '다음에 또 방문해 주시기를 기다리겠습니다.', again: '입구로 돌아가기' },
};

export function leaveLabel(lang: Lang) { return L[lang].leave; }

function thud() {
  try {
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    const a = new AC();
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(48, a.currentTime + 0.4);
    f.type = 'lowpass'; f.frequency.value = 700;
    g.gain.setValueAtTime(0.26, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + 0.45);
    o.connect(f); f.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + 0.5);
  } catch {}
}

const LEAVE_SHOTS = ['/images/photos/rouget.jpg','/images/photos/roch.jpg','/images/photos/gillet.jpg','/images/shop-sign.webp'];

export function LeaveOverlay({ open, lang }: { open: boolean; lang: Lang }) {
  const { era } = useSite();
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!open) return;
    const r = requestAnimationFrame(() => setGo(true));
    let id: any;
    if (era === '1995' || era === '2005') id = setTimeout(thud, 900);
    return () => { cancelAnimationFrame(r); if (id) clearTimeout(id); };
  }, [open, era]);
  if (!open) return null;
  const t = L[lang];
  return (
    <div id="tw-leave-ov" className={go ? 'go' : undefined}>
      <div className="tw-bye-bg" style={{ backgroundImage: `url(${asset(LEAVE_SHOTS[Math.floor(Math.random() * LEAVE_SHOTS.length)])})` }} />
      <div className="tw-door tw-door-l" />
      <div className="tw-door tw-door-r" />
      <div className="tw-bye">
        <div className="tw-bye-t">{t.bye}</div>
        <Link className="tw-bye-a" href="/">{t.again}</Link>
      </div>
    </div>
  );
}
