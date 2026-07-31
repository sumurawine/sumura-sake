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
