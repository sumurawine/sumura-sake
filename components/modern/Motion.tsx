'use client';

import { useEffect, useRef, useState } from 'react';

/** 画面に入ったら静かに立ち上がってくる箱 */
export function Reveal({
  children, as: Tag = 'div', delay = 0, className = '', threshold = 0.18, ...rest
}: {
  children?: React.ReactNode; as?: any; delay?: 0|1|2|3|4|5|6; className?: string; threshold?: number; [k: string]: any;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0, rootMargin: '0px 0px 26% 0px' });
    io.observe(el);
    // 速く動かしても取り残されないよう、少し経ったら必ず出します
    const t = setTimeout(() => setSeen(true), 2600);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [threshold]);
  return (
    <Tag ref={ref as any} className={`mx-rv${seen ? ' is-in' : ''}${className ? ' ' + className : ''}`} data-d={delay || undefined} {...rest}>
      {children}
    </Tag>
  );
}

/** 一文字ずつ立ち上がる見出し */
export function Chars({ text, className = '', step = 34 }: { text: string; className?: string; step?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0, rootMargin: '0px 0px 26% 0px' });
    io.observe(el);
    const t = setTimeout(() => setSeen(true), 2600);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <span ref={ref} className={`${seen ? 'is-in ' : ''}${className}`}>
      {Array.from(text).map((c, i) => (
        <span key={i} className="mx-ch" style={{ transitionDelay: `${i * step}ms` }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}

/** ゆっくり流れる背景 */
export function useParallax(strength = 0.14) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const on = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-mid * strength).toFixed(1)}px, 0)`;
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(on); };
    on();
    window.addEventListener('scroll', q, { passive: true });
    window.addEventListener('resize', q);
    return () => { window.removeEventListener('scroll', q); window.removeEventListener('resize', q); if (raf) cancelAnimationFrame(raf); };
  }, [strength]);
  return ref;
}

/** 粒子と周辺光量落ち */
export function Atmosphere() {
  return (<><div className="mx-grain" aria-hidden /><div className="mx-vign" aria-hidden /></>);
}

/** 少し下がると天の帯が締まる */
export function useStuck(px = 40) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > px);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [px]);
  return stuck;
}

/** 重い引き戸のスクロール。常に同じ粘りで、途切れも吸い付きもありません */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const mm = window.matchMedia;
    if (mm && mm('(prefers-reduced-motion: reduce)').matches) return;

    const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let target = window.scrollY;
    let current = target;
    let vel = 0;              /* 指を離したあとの惰性 */
    let alive = true;
    const K = 0.072;          /* 粘りの濃さ。小さいほど重い */
    const HOT = '.mx-rail, select, textarea, input, .modal-ov, .vs-panel';

    const tick = () => {
      if (!alive) return;
      if (Math.abs(vel) > 0.04) {
        target = Math.max(0, Math.min(target + vel, maxY()));
        vel *= 0.945;
      }
      const d = target - current;
      if (Math.abs(d) > 0.08) {
        current += d * K;
        window.scrollTo(0, current);
      } else {
        current = target;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && el.closest(HOT)) return;
      e.preventDefault();
      const step = e.deltaY > 0 ? e.deltaY * 0.28 : e.deltaY * 0.8;
      target = Math.max(0, Math.min(target + step, maxY()));
      vel = 0;
    };

    /* 指にも同じ粘りを。二本指（拡大）は端末に任せます */
    let ty = 0, tv = 0, tAt = 0, touching = false;
    const onTS = (e: TouchEvent) => {
      if (e.touches.length !== 1) { touching = false; return; }
      const el = e.target as HTMLElement | null;
      if (el && el.closest(HOT)) { touching = false; return; }
      touching = true; vel = 0;
      ty = e.touches[0].clientY; tv = 0; tAt = performance.now();
    };
    const onTM = (e: TouchEvent) => {
      if (!touching || e.touches.length !== 1) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = ty - y;
      const now = performance.now();
      const dt = Math.max(8, now - tAt);
      tv = (dy / dt) * 16;
      ty = y; tAt = now;
      const step = dy > 0 ? dy * 0.5 : dy * 0.85;
      target = Math.max(0, Math.min(target + step, maxY()));
    };
    const onTE = () => {
      if (!touching) return;
      touching = false;
      vel = tv > 0 ? tv * 0.45 : tv * 0.8;
    };

    /* 帯や検索ジャンプなど、よそから動かされたときは素直に従います */
    const sync = () => {
      if (Math.abs(window.scrollY - current) > 3) { target = window.scrollY; current = target; vel = 0; }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchmove', onTM, { passive: false });
    window.addEventListener('touchend', onTE, { passive: true });
    window.addEventListener('scroll', sync, { passive: true });
    return () => {
      alive = false;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchmove', onTM);
      window.removeEventListener('touchend', onTE);
      window.removeEventListener('scroll', sync);
    };
  }, [enabled]);
}

