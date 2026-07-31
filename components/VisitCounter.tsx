'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiReady } from '@/lib/api';

export function VisitCounter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!apiReady()) return;
    let fresh = true;
    try { fresh = !sessionStorage.getItem('sumura-seen'); } catch {}
    apiGet({ action: fresh ? 'hit' : 'peek' })
      .then((r) => {
        if (fresh) { try { sessionStorage.setItem('sumura-seen', '1'); } catch {} }
        if (r && r.ok) setN(r.count);
      })
      .catch(() => {});
  }, []);
  const s = String(Math.max(0, n | 0)).padStart(6, '0').split('');
  return (
    <span className="counter" id="visit-counter">
      {s.map((c, i) => (
        <span key={i}>
          {i === s.length - 1 ? <span className="blink">{c}</span> : c}
          {i < s.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
