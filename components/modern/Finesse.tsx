'use client';

import { useEffect } from 'react';

/**
 * 現代の頁の「手ざわり」。
 * ・金の輪：カーソルにそっと遅れてついてくる輪。押せるものの上でひらきます
 * ・磁力：ボタンが指先へわずかに寄ります
 * ・読み進みの金の線：頁をどこまで読んだかを、天の際に細く示します
 * ・金の粒：蝋燭の光に舞う塵。ごく淡く、ゆっくりと
 * 触摸端末と「動きを控える」設定では、静かにしています。
 */
export function Finesse() {
  useEffect(() => {
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const undo: Array<() => void> = [];

    /* ── 読み進みの金の線 ── */
    const bar = document.createElement('div');
    bar.className = 'fx-progress';
    const barHost = document.querySelector('.mx-head') as HTMLElement | null;
    (barHost || document.body).appendChild(bar);
    let pCur = 0, pRaf = 0;
    const pTick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const t = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      pCur += (t - pCur) * 0.22;
      if (Math.abs(t - pCur) < 0.0004) pCur = t;
      bar.style.transform = 'scaleX(' + pCur.toFixed(4) + ')';
      pRaf = requestAnimationFrame(pTick);
    };
    pRaf = requestAnimationFrame(pTick);
    undo.push(() => { cancelAnimationFrame(pRaf); bar.remove(); });

    if (fine && !calm) {
      /* ── 金の輪 ── */
      const ring = document.createElement('div');
      ring.className = 'fx-ring';
      document.body.appendChild(ring);
      let mx = -100, my = -100, rx = -100, ry = -100, on = false, raf = 0;
      const HOT = 'a, button, [role="button"], input, select, textarea, label';
      const move = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        const t = e.target as Element | null;
        on = !!(t && t.closest && t.closest(HOT));
      };
      const tick = () => {
        rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%) scale(' + (on ? 1.9 : 1) + ')';
        ring.style.opacity = mx < 0 ? '0' : (on ? '.95' : '.6');
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      window.addEventListener('mousemove', move, { passive: true });
      undo.push(() => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', move); ring.remove(); });

      /* ── 磁力を帯びたボタン ── */
      const mag = (e: MouseEvent) => {
        const el = (e.target as Element | null)?.closest?.('.mx-btn') as HTMLElement | null;
        document.querySelectorAll<HTMLElement>('.mx-btn.is-mag').forEach((b) => {
          if (b !== el) { b.style.removeProperty('--mag-x'); b.style.removeProperty('--mag-y'); b.classList.remove('is-mag'); }
        });
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.setProperty('--mag-x', (dx * 4).toFixed(1) + 'px');
        el.style.setProperty('--mag-y', (dy * 3).toFixed(1) + 'px');
        el.classList.add('is-mag');
      };
      window.addEventListener('mousemove', mag, { passive: true });
      undo.push(() => window.removeEventListener('mousemove', mag));

      /* ── 蝋燭の光に舞う金の粒 ── */
      if (window.innerWidth > 760) {
        const cv = document.createElement('canvas');
        cv.className = 'fx-dust';
        document.body.appendChild(cv);
        const cx = cv.getContext('2d');
        let W = 0, H = 0, raf2 = 0;
        const DPR = Math.min(2, window.devicePixelRatio || 1);
        const size = () => { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; };
        size();
        window.addEventListener('resize', size);
        type P = { x: number; y: number; r: number; s: number; w: number; a: number; t: number };
        const ps: P[] = Array.from({ length: 26 }, () => ({
          x: Math.random() * 100, y: Math.random() * 100,
          r: 0.6 + Math.random() * 1.4, s: 0.006 + Math.random() * 0.014,
          w: 8 + Math.random() * 26, a: 0.05 + Math.random() * 0.16, t: Math.random() * 628,
        }));
        const draw = () => {
          if (!cx) return;
          cx.clearRect(0, 0, cv.width, cv.height);
          for (const p of ps) {
            p.t += 0.9; p.y -= p.s; if (p.y < -2) { p.y = 102; p.x = Math.random() * 100; }
            const x = (p.x / 100) * W + Math.sin(p.t / p.w) * 14;
            const y = (p.y / 100) * H;
            const tw = 0.6 + 0.4 * Math.sin(p.t / 17);
            cx.beginPath();
            cx.arc(x * DPR, y * DPR, p.r * DPR, 0, 6.284);
            cx.fillStyle = 'rgba(214,186,140,' + (p.a * tw).toFixed(3) + ')';
            cx.fill();
          }
          raf2 = requestAnimationFrame(draw);
        };
        const vis = () => { if (document.hidden) cancelAnimationFrame(raf2); else raf2 = requestAnimationFrame(draw); };
        document.addEventListener('visibilitychange', vis);
        raf2 = requestAnimationFrame(draw);
        undo.push(() => { cancelAnimationFrame(raf2); document.removeEventListener('visibilitychange', vis); window.removeEventListener('resize', size); cv.remove(); });
      }
    }

    return () => undo.forEach((f) => f());
  }, []);
  return null;
}
