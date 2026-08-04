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

/** 画面全体のスクロールに粘りを持たせ、節目で気持ちよく止めます */
export function useSmoothScroll(enabled = true, ease = 0.11) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const mm = window.matchMedia;
    if (mm && mm('(prefers-reduced-motion: reduce)').matches) return;

    const SEL = '.mx-hero, .mx-sec, .mx-sec-tight, .mx-bleed, .mx-legacy, .mx-foot';
    const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const tops = () => Array.from(document.querySelectorAll(SEL))
      .map((el) => Math.round(window.scrollY + el.getBoundingClientRect().top))
      .filter((y) => y >= 0 && y <= maxY())
      .sort((a, b) => a - b);

    let target = window.scrollY;
    let current = target;
    let raf = 0;
    let gestureAt = 0;   // この一挙動が始まった時刻
    let lastAt = 0;
    let idle = 0;

    const tick = () => {
      // 動かしはじめは 0.18、0.4秒ほどで粘りが消えて 1 になります
      const e = Math.min(1, 0.18 + (performance.now() - gestureAt) / 400);
      current += (target - current) * e;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo(0, current);
        raf = 0;
        return;
      }
      window.scrollTo(0, current);
      raf = requestAnimationFrame(tick);
    };
    const run = () => { if (!raf) { current = window.scrollY; raf = requestAnimationFrame(tick); } };

    /** 手を止めたら、近くの節目にそっと寄せます */
    const settle = () => {
      const y = target;
      const list = tops();
      if (!list.length) return;
      let best = list[0];
      for (const t of list) if (Math.abs(t - y) < Math.abs(best - y)) best = t;
      const reach = window.innerHeight * 0.28;
      if (Math.abs(best - y) < reach) { target = Math.max(0, Math.min(best, maxY())); run(); }
    };
    const queueSettle = () => { clearTimeout(idle); idle = window.setTimeout(settle, 260); };

    const fine = !!mm && mm('(pointer: fine)').matches && !mm('(max-width: 900px)').matches;
    if (!fine) return;   // 指で操作する端末は、端末そのままの動きに任せます
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && el.closest('.mx-rail, select, textarea, .modal-ov')) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastAt > 420) gestureAt = now;   // 間があいたら、また新しい一挙動
      lastAt = now;
      /* 下りはゆっくり半歩ずつ。上りは軽やかにそのまま */
      const step = e.deltaY > 0 ? e.deltaY * 0.5 : e.deltaY;
      target = Math.max(0, Math.min(target + step, maxY()));
      run();
      queueSettle();
    };

    const sync = () => { if (!raf) { target = window.scrollY; current = target; } };

    if (fine) window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      clearTimeout(idle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);
}
