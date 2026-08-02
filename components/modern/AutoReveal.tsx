'use client';

import { useEffect } from 'react';

/**
 * 画面に入った文章を、静かに浮かび上がらせます。
 * すでに Reveal で包んである箱はそのまま。それ以外の文字を拾って同じ動きにします。
 */
const PICK = 'h1,h2,h3,h4,h5,p,li,dd,dt,blockquote,figcaption,td,th,.mx-btn,.mx-link,.mx-cap,.mx-note,.mx-kicker,.mx-lead,.mx-num';
const SKIP = '.ed-bar,.ed-panel,.ed-msg,.ed-new,.ed-form,.mx-head,.mx-nav,#lang-bar,#timewarp,.mx-veil,.mx-rv,.mx-fade';

export function AutoReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    const mark = () => {
      document.querySelectorAll<HTMLElement>(PICK).forEach((el) => {
        if (el.dataset.rv === '1') return;
        if (el.closest(SKIP)) return;
        if (!(el.textContent || '').trim()) return;
        el.dataset.rv = '1';
        el.classList.add('mx-fade');
        io.observe(el);
      });
    };

    let t = 0;
    const soon = () => { window.clearTimeout(t); t = window.setTimeout(mark, 80); };
    mark();

    const mo = new MutationObserver(soon);
    mo.observe(document.body, { childList: true, subtree: true });

    /* 何かの拍子に見えないままにならないよう、少し経ったら必ず出します */
    const safety = window.setInterval(() => {
      document.querySelectorAll<HTMLElement>('.mx-fade:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2) el.classList.add('is-in');
      });
    }, 1200);

    return () => { io.disconnect(); mo.disconnect(); window.clearTimeout(t); window.clearInterval(safety); };
  }, []);

  return null;
}
