'use client';

/**
 * バーチャル店舗の三次元の間取り。
 * 岩を穿った穴倉（カーヴ）のなかに、そのまま店をこしらえてあります。
 * three.js は網の上から借りてきて使いますので、荷物は増えません。
 */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export type Bottle = { id: string; name: string; price: string; prod: string; cat: string };

export type ShopHandle = {
  dispose: () => void;
  pause: (v: boolean) => void;
  lock: () => void;
  sound: (v: boolean) => void;
  moveVec: (x: number, y: number) => void;
  lookVel: (x: number, y: number) => void;
  use: () => void;
  callClerk: () => void;
};

export type ShopOpts = {
  mount: HTMLElement;
  bottles: Bottle[];
  onLook: (kind: 'clerk' | 'bottle' | null, id?: string) => void;
  onUse: (kind: 'clerk' | 'bottle', id?: string) => void;
  onNear: (v: boolean) => void;
  onArrive: () => void;
  onDoor: () => void;
  onReady: () => void;
};

/* ── 音 ─────────────────────────────────────────────
   足音も扉の軋みも、店内の演奏も、その場でこしらえます。
   曲は当店のために書き下ろした八つの小品。ハーレムの跳ねる左手、
   夜更けのバラード、緩やかなブルウス。弾き手は言葉のない声で
   旋律をなぞります。ひと巡りするのに、ゆうに三十分はかかります。 */
function makeAudio() {
  let ctx: any = null;
  let bus: any = null;      // 効果音
  let mus: any = null;      // 演奏
  let conv: any = null;     // 穴倉の響き
  let noise: any = null;
  let on = true;
  let foot = 0;
  let timer: any = null;
  let next = 0;

  /* 和音の作り。根音からの隔たりで書きます */
  const CH: Record<string, number[]> = {
    m9: [0, 3, 7, 10, 14], M9: [0, 4, 7, 11, 14], d9: [0, 4, 7, 10, 14],
    m7b5: [0, 3, 6, 10], alt: [0, 4, 7, 10, 13], m6: [0, 3, 7, 9],
    d7: [0, 4, 7, 10], M6: [0, 4, 7, 9],
  };
  const SC: Record<string, number[]> = {
    m9: [0, 2, 3, 5, 7, 8, 10], M9: [0, 2, 4, 5, 7, 9, 11], d9: [0, 2, 4, 5, 7, 9, 10],
    m7b5: [0, 2, 3, 5, 6, 8, 10], alt: [0, 1, 3, 4, 6, 8, 10], m6: [0, 2, 3, 5, 7, 9, 10],
    d7: [0, 2, 4, 5, 7, 9, 10], M6: [0, 2, 4, 5, 7, 9, 11],
  };

  type Tune = { n: string; bpm: number; sw: number; ch: number; prog: Array<[number, string, number]> };
  const TUNES: Tune[] = [
    { n: '夜の扉', bpm: 62, sw: 0, ch: 2, prog: [
      [36, 'm9', 2], [41, 'm9', 2], [34, 'd9', 2], [39, 'M9', 2],
      [32, 'M9', 2], [38, 'm7b5', 1], [31, 'alt', 1], [36, 'm9', 2]] },
    { n: '棚のあいだで', bpm: 108, sw: 0.62, ch: 2, prog: [
      [39, 'M6', 2], [44, 'm9', 1], [49, 'd9', 1], [42, 'M9', 2], [37, 'd9', 2],
      [42, 'm9', 1], [47, 'alt', 1], [40, 'M9', 2], [45, 'm7b5', 1], [38, 'alt', 1], [39, 'M6', 2]] },
    { n: '蝋燭のブルウス', bpm: 74, sw: 0.64, ch: 3, prog: [
      [33, 'd7', 4], [38, 'd7', 2], [33, 'd7', 2],
      [40, 'd9', 1], [38, 'd7', 1], [33, 'd7', 2]] },
    { n: '古酒に寄せて', bpm: 58, sw: 0, ch: 2, prog: [
      [38, 'm9', 2], [43, 'm9', 2], [36, 'd9', 2], [41, 'M9', 2],
      [34, 'M9', 2], [40, 'm7b5', 1], [33, 'alt', 1], [38, 'm9', 2]] },
    { n: '樽の陰で', bpm: 120, sw: 0.6, ch: 2, prog: [
      [34, 'M6', 2], [39, 'm9', 1], [44, 'd9', 1], [37, 'M9', 2], [32, 'd9', 2],
      [37, 'm9', 1], [42, 'alt', 1], [35, 'M9', 2], [40, 'm7b5', 1], [33, 'alt', 1], [34, 'M6', 2]] },
    { n: '雨の宇部', bpm: 66, sw: 0, ch: 2, prog: [
      [41, 'm9', 2], [46, 'm7b5', 1], [39, 'alt', 1], [44, 'm9', 2], [37, 'd9', 2],
      [42, 'M9', 2], [35, 'M9', 2], [40, 'm7b5', 1], [33, 'alt', 1], [41, 'm9', 2]] },
    { n: '仕舞いの一杯', bpm: 88, sw: 0.6, ch: 2, prog: [
      [37, 'm6', 2], [42, 'm7b5', 1], [35, 'alt', 1], [40, 'm9', 2], [33, 'd9', 2],
      [38, 'M9', 2], [43, 'm9', 1], [36, 'alt', 1], [37, 'm6', 2]] },
    { n: '朝までの唄', bpm: 96, sw: 0.62, ch: 2, prog: [
      [32, 'M6', 2], [37, 'm9', 1], [42, 'd9', 1], [35, 'M9', 2], [40, 'm7b5', 1], [33, 'alt', 1],
      [32, 'M6', 2], [37, 'd9', 2], [30, 'M9', 2], [37, 'm9', 1], [42, 'alt', 1]] },
  ];
  /* 小節ごとに開いた形へ */
  const bars = (t: Tune) => {
    const out: Array<[number, string]> = [];
    t.prog.forEach(([r, c, n]) => { for (let i = 0; i < n; i++) out.push([r, c]); });
    return out;
  };
  const FORM = TUNES.map(bars);

  let ti = 0, bi = 0, round = 0;
  let melo = 0;                   // 旋律のいまの高さ
  let voxEnd = 0;

  const start = () => {
    if (ctx || typeof window === 'undefined') return;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    bus = ctx.createGain(); bus.gain.value = on ? 0.9 : 0; bus.connect(ctx.destination);
    mus = ctx.createGain(); mus.gain.value = on ? 0.26 : 0; mus.connect(ctx.destination);

    const len = Math.floor(ctx.sampleRate * 2.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (i < 900 ? i / 900 : 1);
      }
    }
    conv = ctx.createConvolver(); conv.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.32;
    conv.connect(wet); wet.connect(mus);

    const n = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = n;

    const src = ctx.createBufferSource();
    src.buffer = n; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 190;
    const g = ctx.createGain(); g.gain.value = 0.04;
    src.connect(lp); lp.connect(g); g.connect(bus); src.start();

    next = ctx.currentTime + 0.5;
    timer = setInterval(tick, 180);
  };

  const burst = (freq: number, q: number, vol: number, len: number) => {
    if (!ctx || !noise) return;
    const s = ctx.createBufferSource();
    s.buffer = noise; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t); s.stop(t + len + 0.02);
  };

  const tone = (f0: number, f1: number, vol: number, len: number, type = 'triangle') => {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type as any;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + len);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + len + 0.02);
  };

  const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

  /* ピアノの一音 */
  const key = (m: number, at: number, len: number, vol: number) => {
    if (!ctx) return;
    const f = hz(m);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500 + f * 2.4; lp.Q.value = 0.4;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.016);
    g.gain.exponentialRampToValueAtTime(vol * 0.32, at + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    [[1, 1], [2, 0.26], [3, 0.10], [4.01, 0.045], [5.98, 0.02]].forEach(([mul, amp]) => {
      const o = ctx.createOscillator();
      o.type = mul === 1 ? 'triangle' : 'sine';
      o.frequency.value = f * (mul as number) * (1 + (Math.random() - 0.5) * 0.0012);
      const og = ctx.createGain(); og.gain.value = amp as number;
      o.connect(og); og.connect(g);
      o.start(at); o.stop(at + len + 0.08);
    });
    g.connect(lp); lp.connect(mus);
    if (conv) lp.connect(conv);
  };

  /* 言葉のない歌声。母音の共鳴を三つ重ね、揺れを添えます */
  const voice = (m: number, at: number, dur: number, vol: number, from?: number) => {
    if (!ctx) return;
    const f = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.09);
    g.gain.setValueAtTime(vol, at + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(hz(from == null ? m - 0.35 : from), at);
    o.frequency.linearRampToValueAtTime(f, at + 0.075);
    const vib = ctx.createOscillator(); vib.type = 'sine'; vib.frequency.value = 5.1 + Math.random() * 0.5;
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(0, at);
    vg.gain.linearRampToValueAtTime(f * 0.012, at + Math.min(0.4, dur * 0.5));
    vib.connect(vg); vg.connect(o.frequency);

    const sum = ctx.createGain(); sum.gain.value = 1;
    const vow = Math.random() > 0.5 ? [[500, 8, 1], [1150, 10, 0.46], [2600, 11, 0.16]]
                                    : [[400, 9, 1], [900, 11, 0.40], [2500, 12, 0.13]];
    vow.forEach(([fr, q, a]) => {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = fr as number; bp.Q.value = q as number;
      const ag = ctx.createGain(); ag.gain.value = a as number;
      o.connect(bp); bp.connect(ag); ag.connect(sum);
    });
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3300;
    sum.connect(lp); lp.connect(g); g.connect(mus);
    if (conv) g.connect(conv);
    o.start(at); o.stop(at + dur + 0.12);
    vib.start(at); vib.stop(at + dur + 0.12);
    if (at + dur > voxEnd) voxEnd = at + dur;
  };

  /* 旋律の言い回し：［拍, 長さ］ */
  const CELLS: Array<Array<[number, number]>> = [
    [[0, 2], [2.5, 1.4]], [[0, 1], [1.5, 1], [3, 1.2]], [[1, 2.6]], [],
    [[0, 1.4], [2, 2]], [[0.5, 1], [1.5, 0.6], [2.5, 1.4]], [[0, 3.4]],
    [[2, 1], [3, 1]], [[0, 0.9], [1, 0.9], [2, 0.9], [3, 1.1]],
  ];

  const play = (at: number) => {
    const t = TUNES[ti], form = FORM[ti];
    const beat = 60 / t.bpm;
    const [root, ctype] = form[bi];
    const iv = CH[ctype], sc = SC[ctype];
    const hum = () => (Math.random() - 0.5) * 0.018;

    /* 左手 */
    if (t.sw) {
      /* 跳ねる左手：一と三で根音、二と四で和音 */
      for (let q = 0; q < 4; q++) {
        const tt = at + q * beat;
        if (q % 2 === 0) key(root - (q === 2 ? 0 : 0) + (q === 2 ? 7 : 0), tt + hum(), beat * 0.9, 0.15);
        else iv.slice(1, 4).forEach((v) => key(root + 24 + (v % 12), tt + hum(), beat * 0.5, 0.05));
      }
    } else {
      key(root, at + hum(), beat * 3.6, 0.15);
      if (bi % 4 === 2) key(root + 7, at + beat * 2 + hum(), beat * 1.8, 0.08);
    }

    /* 和音を、そっと */
    const cAt = at + (t.sw ? beat * 1.5 : (bi % 2 === 0 ? beat * 0.5 : beat * 1.5));
    iv.slice(1).forEach((v, k) => {
      const m = root + 24 + (v % 12);
      key(m, cAt + k * 0.011 + hum(), beat * (t.sw ? 1.2 : 2.4), 0.05 - k * 0.004);
    });

    /* 旋律。声がなぞり、ピアノがそっと添えます */
    const cell = CELLS[(bi * 5 + round * 3 + ti) % CELLS.length];
    let prev = melo;
    cell.forEach(([q, dur], k) => {
      if (Math.random() < 0.10) return;
      const pool = (k === 0 || Math.random() < 0.55)
        ? iv.map((v) => root + 36 + v)
        : sc.map((v) => root + 36 + v);
      /* 前の音に近いところを選びます */
      let best = pool[0], bd = 99;
      const want = melo + (Math.random() * 7 - 3.5);
      pool.forEach((m) => { const d = Math.abs(m - want); if (d < bd) { bd = d; best = m; } });
      while (best > 79) best -= 12;
      while (best < 62) best += 12;
      const sh = t.sw && q % 1 !== 0 ? 0 : 0;
      const tt = at + (q + sh) * beat + hum();
      const ln = dur * beat * 0.95;
      voice(best, tt, ln, 0.075 + Math.random() * 0.02, k === 0 ? undefined : prev);
      key(best, tt, ln * 0.9, 0.038);
      prev = best; melo = best;
    });

    bi++;
    if (bi >= form.length) {
      bi = 0; round++;
      if (round >= TUNES[ti].ch) { round = 0; ti = (ti + 1) % TUNES.length; melo = 70; }
    }
    return beat * 4;
  };

  const tick = () => {
    if (!ctx || !on) return;
    while (next < ctx.currentTime + 1.4) next += play(next);
  };

  return {
    start,
    set(v: boolean) {
      on = v;
      if (bus) bus.gain.value = v ? 0.9 : 0;
      if (mus) mus.gain.value = v ? 0.26 : 0;
      if (v) { start(); if (ctx) next = Math.max(next, ctx.currentTime + 0.3); }
    },
    dist(d: number) {
      if (!mus || !on) return;
      mus.gain.value = 0.32 * Math.max(0.30, Math.min(1, 3.8 / Math.max(1.3, d)));
    },
    /* いま歌っているか（口の動きに使います） */
    vox() { return ctx && ctx.currentTime < voxEnd ? 1 : 0; },
    phase() { return ctx ? (ctx.currentTime / (60 / TUNES[ti].bpm)) % 4 : 0; },
    tune() { return TUNES[ti].n; },
    step(run: boolean, soft = false) {
      foot ^= 1;
      const k = soft ? 0.45 : 1;
      burst(foot ? 560 : 420, 1.2, (run ? 0.26 : 0.17) * k, run ? 0.11 : 0.15);
      burst(foot ? 138 : 116, 2.4, (run ? 0.20 : 0.13) * k, 0.10);
    },
    creak() { tone(180, 96, 0.05, 0.55, 'sawtooth'); burst(900, 0.8, 0.05, 0.5); },
    clink() { tone(2400, 1900, 0.035, 0.09); },
    close() { try { clearInterval(timer); ctx?.close(); } catch { /* しずかに */ } ctx = null; },
  };
}

/* ── 肌合い ───────────────────────────────────────── */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}
function noiseOver(g: CanvasRenderingContext2D, s: number, n: number, a: number) {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = Math.random() * a;
    g.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    g.fillRect((Math.random() * s) | 0, (Math.random() * s) | 0, 1 + ((Math.random() * 2) | 0), 1);
  }
  g.globalAlpha = 1;
}

function rock(base: string, mortar: string, rows = 5, cols = 5): HTMLCanvasElement {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = mortar; g.fillRect(0, 0, S, S);
  noiseOver(g, S, 5200, 0.30);
  const h = S / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (S / (cols * 2));
    for (let i = -1; i <= cols; i++) {
      const w = S / cols;
      const x = off + i * w, y = r * h;
      const pad = 3 + Math.random() * 2;
      const v = 0.68 + Math.random() * 0.56;
      g.beginPath();
      g.moveTo(x + pad + Math.random() * 5, y + pad + Math.random() * 4);
      g.lineTo(x + w - pad - Math.random() * 5, y + pad + Math.random() * 5);
      g.lineTo(x + w - pad - Math.random() * 4, y + h - pad - Math.random() * 5);
      g.lineTo(x + pad + Math.random() * 5, y + h - pad - Math.random() * 4);
      g.closePath();
      g.fillStyle = shade(base, v); g.fill();
      for (let k = 0; k < 26; k++) {
        g.globalAlpha = 0.05 + Math.random() * 0.13;
        g.fillStyle = Math.random() > 0.5 ? '#000' : shade(base, v + 0.3);
        const bw = 2 + Math.random() * 12, bh = 1 + Math.random() * 5;
        g.fillRect(x + pad + Math.random() * (w - bw - pad * 2), y + pad + Math.random() * (h - bh - pad * 2), bw, bh);
      }
      g.globalAlpha = 1;
      g.fillStyle = 'rgba(0,0,0,.34)'; g.fillRect(x + pad, y + h - pad - 2.5, w - pad * 2, 2.5);
      g.fillStyle = 'rgba(255,240,220,.10)'; g.fillRect(x + pad, y + pad, w - pad * 2, 1.5);
    }
  }
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.05 + Math.random() * 0.10;
    g.fillStyle = Math.random() > 0.4 ? '#1b2418' : '#0b0a08';
    g.beginPath();
    g.ellipse(Math.random() * S, Math.random() * S, 3 + Math.random() * 20, 2 + Math.random() * 11, Math.random() * 3, 0, 7);
    g.fill();
  }
  g.globalAlpha = 1;
  noiseOver(g, S, 4200, 0.16);
  return c;
}

function wood(base: string, dark: string): HTMLCanvasElement {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 120; i++) {
    g.globalAlpha = 0.05 + Math.random() * 0.17;
    g.strokeStyle = Math.random() > 0.5 ? dark : shade(base, 1.22);
    g.lineWidth = 0.6 + Math.random() * 1.8;
    const y = Math.random() * S;
    g.beginPath(); g.moveTo(0, y);
    g.bezierCurveTo(S * 0.3, y + (Math.random() * 9 - 4.5), S * 0.7, y + (Math.random() * 9 - 4.5), S, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    g.globalAlpha = 0.22; g.strokeStyle = dark; g.lineWidth = 1.4;
    for (let k = 1; k < 5; k++) { g.beginPath(); g.ellipse(x, y, k * 3.4, k * 2.1, 0.5, 0, 7); g.stroke(); }
  }
  g.globalAlpha = 1;
  noiseOver(g, S, 3000, 0.14);
  return c;
}

function keysTex(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#efeadc'; g.fillRect(0, 0, 512, 64);
  g.strokeStyle = '#9a9182'; g.lineWidth = 1.4;
  for (let i = 0; i < 36; i++) { g.beginPath(); g.moveTo(i * 14.2, 0); g.lineTo(i * 14.2, 64); g.stroke(); }
  g.fillStyle = '#141110';
  const pat = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  for (let i = 0; i < 36; i++) if (pat[i % 12]) g.fillRect(i * 14.2 + 9.2, 0, 9.2, 38);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 60, 512, 4);
  return c;
}

function labelTex(name: string, prod: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 192; c.height = 120;
  const g = c.getContext('2d')!;
  g.fillStyle = '#eae3d3'; g.fillRect(0, 0, 192, 120);
  noiseOver(g, 120, 900, 0.10);
  g.strokeStyle = 'rgba(110,80,52,.62)'; g.lineWidth = 2.4;
  g.strokeRect(8, 8, 176, 104);
  g.fillStyle = '#3a2a1c'; g.textAlign = 'center';
  g.font = '600 15px "Shippori Mincho","Hiragino Mincho ProN",serif';
  g.fillText(String(prod || '').slice(0, 16), 96, 38);
  g.font = '12px "Shippori Mincho","Hiragino Mincho ProN",serif';
  const t = String(name || '').replace(/\s*\/.*$/, '').slice(0, 34);
  const lines: string[] = [];
  for (let i = 0; i < t.length; i += 13) lines.push(t.slice(i, i + 13));
  lines.slice(0, 3).forEach((l, i) => g.fillText(l, 96, 64 + i * 17));
  return c;
}

export async function createShop(o: ShopOpts): Promise<ShopHandle> {
  const THREE: any = await (new Function('u', 'return import(u)'))(THREE_URL);
  const au = makeAudio();

  const W = 13, D = 9, WH = 2.05, RISE = 1.62;
  const SKY = 0x0d0a08;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.FogExp2(SKY, 0.058);

  const camera = new THREE.PerspectiveCamera(66, 1, 0.05, 60);
  camera.position.set(0, 1.62, D / 2 - 2.9);

  /* 映画の質感で描きます：実解像度・柔らかい影・フィルムの階調 */
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.84;
  o.mount.appendChild(renderer.domElement);
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 1;

  /* まわりの映り込み。蝋燭色の天と、暗い床。艶ものが生きます */
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x241a12, side: THREE.BackSide }),
    ));
    const warm = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
    warm.position.set(0, 4.6, 0); warm.rotation.x = Math.PI / 2; env.add(warm);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ color: 0xfff1d8 }));
    win.position.set(0, 1.7, 6); win.rotation.y = Math.PI; env.add(win);
    scene.environment = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
  }

  const tex = (c: HTMLCanvasElement, rx: number, ry: number) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = Math.min(8, maxAniso);
    return t;
  };
  const lam = (p: any) => new THREE.MeshLambertMaterial(p);
  const boxes: Array<{ x: number; z: number; w: number; d: number }> = [];
  const place = (g: any, x: number, y: number, z: number, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); return g; };

  /* 岩の床・腰壁・穹窿 */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: tex(rock('#6d6559', '#231e19', 4, 4), 7, 5) }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  const wallMat = lam({ map: tex(rock('#7a6f60', '#201b16', 5, 5), 5, 1.2), side: THREE.DoubleSide });
  const endMat = lam({ map: tex(rock('#746a5c', '#1e1915', 6, 4), 3, 2), side: THREE.DoubleSide });
  const wall = (w: number, h: number, x: number, y: number, z: number, ry: number, m: any) => {
    const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    q.position.set(x, y, z); q.rotation.y = ry; scene.add(q); return q;
  };
  wall(W, WH, 0, WH / 2, -D / 2, 0, wallMat);
  wall(W, WH, 0, WH / 2, D / 2, Math.PI, wallMat);
  wall(D + 1.2, WH + RISE + 2.2, -W / 2, (WH + RISE) / 2, 0, Math.PI / 2, endMat);
  wall(D + 1.2, WH + RISE + 2.2, W / 2, (WH + RISE) / 2, 0, -Math.PI / 2, endMat);

  const vault = new THREE.Mesh(
    new THREE.CylinderGeometry(D / 2 + 0.03, D / 2 + 0.03, W + 0.08, 26, 1, true, 0, Math.PI),
    lam({ map: tex(rock('#6f6557', '#1c1813', 6, 8), 8, 3), side: THREE.BackSide }));
  vault.rotation.z = Math.PI / 2;
  vault.scale.set(RISE / (D / 2), 1, 1);
  vault.position.y = WH;
  scene.add(vault);

  const ribMat = lam({ map: tex(rock('#5f564a', '#171310', 3, 3), 5, 1), side: THREE.DoubleSide });
  [-4.3, 0, 4.3].forEach((x) => {
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(D / 2 + 0.20, D / 2 + 0.20, 0.36, 26, 1, true, 0, Math.PI), ribMat);
    rib.rotation.z = Math.PI / 2;
    rib.scale.set((RISE + 0.18) / (D / 2 + 0.20), 1, 1);
    rib.position.set(x, WH, 0); scene.add(rib);
    [-1, 1].forEach((s) => {
      if (x === 0 && s === 1) return;                 // 扉の来るところは、柱を立てません
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.38, WH, 0.38), ribMat);
      col.position.set(x, WH / 2, s * (D / 2 - 0.16)); scene.add(col);
    });
  });

  const nicheMat = lam({ map: tex(rock('#4c453b', '#12100d', 4, 4), 2, 1), side: THREE.DoubleSide });
  [-4.3, 0, 4.3].forEach((x) => {
    const n = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.6, 0.34), nicheMat);
    n.position.set(x, 1.16, -D / 2 + 0.19); scene.add(n);
  });

  /* 扉（入口） */
  const oakMat = lam({ map: tex(wood('#4a3320', '#1d1108'), 2, 1) });
  const darkWood = lam({ map: tex(wood('#33241a', '#140c05'), 2, 1) });
  const doorGroup = new THREE.Group();
  const DH = 1.98;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.12, DH, 0.07), darkWood);
  door.position.set(0.56, DH / 2, 0); doorGroup.add(door);
  [0.36, 0.82, 1.28, 1.74].forEach((y) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.07, 0.05, 0.09), lam({ color: 0x241a14 }));
    band.position.set(0.56, y, 0); doorGroup.add(band);
  });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), lam({ color: 0xd8bd8e }));
  knob.position.set(1.0, 1.0, 0.06); doorGroup.add(knob);
  doorGroup.position.set(-0.56, 0, D / 2 - 0.06);
  scene.add(doorGroup);

  /* 灯り */
  scene.add(new THREE.AmbientLight(0xffdcb4, 0.34));
  scene.add(new THREE.HemisphereLight(0xffcc98, 0x241d18, 0.22));
  const flames: any[] = [];
  const flameGeo = new THREE.ConeGeometry(0.026, 0.095, 6);
  const mkFlame = () => new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: 0xffd68a }));
  const sconce = (x: number, z: number, ry: number, inten: number) => {
    const g = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.26), lam({ color: 0x1a1512 }));
    arm.position.z = 0.13; g.add(arm);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.05, 8), lam({ color: 0x1a1512 }));
    cup.position.set(0, 0.04, 0.26); g.add(cup);
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.19, 8), lam({ color: 0xe8ddc4 }));
    wax.position.set(0, 0.155, 0.26); g.add(wax);
    const fl = mkFlame(); fl.position.set(0, 0.30, 0.26); g.add(fl);
    const p = new THREE.PointLight(0xffab5e, inten, 6.6, 1.7);
    p.position.set(0, 0.32, 0.26); g.add(p);
    flames.push({ p, fl, base: inten, seed: Math.random() * 90, v: 1 });
    place(g, x, 1.55, z, ry);
  };
  sconce(-W / 2 + 0.12, -2.6, Math.PI / 2, 3.6); sconce(-W / 2 + 0.12, 2.2, Math.PI / 2, 3.6);
  sconce(W / 2 - 0.12, -2.6, -Math.PI / 2, 3.6); sconce(W / 2 - 0.12, 2.2, -Math.PI / 2, 3.6);
  sconce(-3.4, -D / 2 + 0.12, 0, 3.2); sconce(3.4, -D / 2 + 0.12, 0, 3.2);

  const chand = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.028, 5, 16), lam({ color: 0x191411 }));
  ring.rotation.x = Math.PI / 2; chand.add(ring);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.21, 6), lam({ color: 0xe8ddc4 }));
    wax.position.set(Math.cos(a) * 0.44, 0.13, Math.sin(a) * 0.44); chand.add(wax);
    const fl = mkFlame();
    fl.position.set(Math.cos(a) * 0.44, 0.28, Math.sin(a) * 0.44); chand.add(fl);
    flames.push({ p: null, fl, base: 0, seed: Math.random() * 90, v: 1 });
  }
  const cp = new THREE.PointLight(0xffbc78, 3.4, 10, 1.5); cp.position.y = 0.27;
  cp.castShadow = true; cp.shadow.mapSize.set(1024, 1024); cp.shadow.bias = -0.005;
  cp.shadow.camera.near = 0.12; cp.shadow.camera.far = 11; chand.add(cp);
  flames.push({ p: cp, fl: null, base: 6.4, seed: 3.1, v: 1 });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 5), lam({ color: 0x191411 }));
  rope.position.y = 0.42; chand.add(rope);
  place(chand, 1.6, 2.5, -0.6);

  /* 棚 */
  const shelfMat = lam({ map: tex(wood('#3d2c1e', '#180f07'), 3, 1) });
  const shelves: any[] = [];
  function rack(x: number, z: number, w: number, rotY: number) {
    const g = new THREE.Group();
    const depth = 0.42, hh = 2.05;
    const side = (sx: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, hh, depth), shelfMat);
      m.position.set(sx, hh / 2, 0); g.add(m);
    };
    side(-w / 2); side(w / 2);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.04), shelfMat);
    back.position.set(0, hh / 2, -depth / 2); g.add(back);
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, depth), shelfMat);
      b.position.set(0, 0.30 + i * 0.42, 0); g.add(b);
    }
    place(g, x, 0, z, rotY); shelves.push(g);
    const sw = Math.abs(Math.cos(rotY)) * w + Math.abs(Math.sin(rotY)) * depth;
    const sd = Math.abs(Math.sin(rotY)) * w + Math.abs(Math.cos(rotY)) * depth;
    boxes.push({ x, z, w: sw, d: sd });
    return g;
  }
  const racks = [
    rack(-W / 2 + 0.3, -2.2, 3.8, Math.PI / 2),
    rack(W / 2 - 0.3, -1.9, 4.6, -Math.PI / 2),
    rack(-2.6, -D / 2 + 0.3, 4.4, 0),
    rack(2.6, -D / 2 + 0.3, 4.4, 0),
    rack(W / 2 - 0.3, 2.2, 2.4, -Math.PI / 2),
  ];
  const RW = [3.8, 4.6, 4.4, 4.4, 2.4];

  /* 瓶 */
  const bottleGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.000, 0.00), new THREE.Vector2(0.038, 0.00),
      new THREE.Vector2(0.039, 0.135), new THREE.Vector2(0.019, 0.185),
      new THREE.Vector2(0.0135, 0.21), new THREE.Vector2(0.0135, 0.30),
    ], 9
  );
  /* 瓶はガラスの艶で。映り込みが命です */
  const glassA = new THREE.MeshStandardMaterial({ color: 0x1d3319, roughness: 0.14, metalness: 0.0, envMapIntensity: 1.25 });
  const glassB = new THREE.MeshStandardMaterial({ color: 0x431619, roughness: 0.14, metalness: 0.0, envMapIntensity: 1.25 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x7a1226, roughness: 0.4, metalness: 0.45 });
  const pick: any[] = [];
  const labelGeo = new THREE.PlaneGeometry(0.062, 0.04);

  function putBottle(parent: any, x: number, y: number, z: number, b?: Bottle) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bottleGeo, Math.random() > 0.45 ? glassA : glassB));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 8), capMat);
    cap.position.y = 0.295; g.add(cap);
    if (b) {
      const t = new THREE.CanvasTexture(labelTex(b.name, b.prod));
      t.anisotropy = Math.min(8, maxAniso);
      const lab = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ map: t }));
      lab.position.set(0, 0.088, 0.0395); g.add(lab);
      g.userData.bottle = b; pick.push(g);
    }
    g.position.set(x, y, z);
    g.rotation.y = Math.random() * 0.5 - 0.25;
    parent.add(g);
  }

  const list = o.bottles.slice();
  let bnum = 0;
  racks.forEach((g, ri) => {
    const w = RW[ri];
    for (let s = 0; s < 5; s++) {
      const y = 0.325 + s * 0.42;
      const n = Math.floor(w / 0.115);
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + 0.09 + i * 0.115;
        const named = (s === 1 || s === 2) && i % 3 === 0 && bnum < list.length;
        putBottle(g, x, y, 0.02, named ? list[bnum++] : undefined);
      }
    }
  });

  [-4.3, 0, 4.3].forEach((x) => {
    for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(bottleGeo, r % 2 ? glassA : glassB);
      b.rotation.x = Math.PI / 2;
      b.position.set(x - 1.1 + i * 0.245, 0.62 + r * 0.24, -D / 2 + 0.44);
      scene.add(b);
    }
  });

  /* 樽 */
  const hoopMat = lam({ color: 0x2b2320 });
  const staveGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.00, -0.44), new THREE.Vector2(0.245, -0.44),
      new THREE.Vector2(0.288, -0.30), new THREE.Vector2(0.318, -0.15),
      new THREE.Vector2(0.328, 0.00), new THREE.Vector2(0.318, 0.15),
      new THREE.Vector2(0.288, 0.30), new THREE.Vector2(0.245, 0.44),
      new THREE.Vector2(0.00, 0.44),
    ], 14
  );
  const barrelMat = lam({ map: tex(wood('#5a3d24', '#22140a'), 3, 1) });
  function barrel(x: number, z: number, lying: boolean, ry = 0) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(staveGeo, barrelMat));
    [[-0.40, 0.252], [-0.20, 0.302], [0.20, 0.302], [0.40, 0.252]].forEach(([y, r]) => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(r + 0.008, 0.019, 5, 16), hoopMat);
      h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h);
    });
    if (lying) { g.rotation.z = Math.PI / 2; g.position.set(x, 0.33, z); g.rotation.y = ry; }
    else g.position.set(x, 0.44, z);
    scene.add(g);
    boxes.push({ x, z, w: 0.76, d: 0.76 });
    return g;
  }
  barrel(-5.7, 3.4, false); barrel(-4.8, 3.6, false);
  barrel(5.4, 3.3, false);
  barrel(-5.9, -3.6, true, Math.PI / 2); barrel(-5.9, -2.7, true, Math.PI / 2);

  const crate = (x: number, y: number, z: number, ry: number) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.44), oakMat);
    c.position.set(x, y, z); c.rotation.y = ry; scene.add(c);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.06, 0.45), darkWood);
    s.position.set(x, y + 0.1, z); s.rotation.y = ry; scene.add(s);
  };
  crate(4.9, 0.21, 3.3, 0.2); crate(4.9, 0.63, 3.3, -0.1); crate(5.6, 0.21, 2.7, 0.5);
  boxes.push({ x: 5.2, z: 3.1, w: 1.6, d: 1.2 });

  /* 立ち呑みの卓、硝子、パニエ */
  const tbl = new THREE.Group();
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.07, 18), oakMat);
  tableTop.position.y = 1.05; tbl.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 1.02, 10), darkWood);
  tableLeg.position.y = 0.52; tbl.add(tableLeg);
  place(tbl, 2.5, 0, 2.3);
  boxes.push({ x: 2.5, z: 2.3, w: 1.0, d: 1.0 });

  const glassMat = lam({ color: 0xd6ded8, transparent: true, opacity: 0.40 });
  const wineMat = lam({ color: 0x4a0f18 });
  function wineGlass(s = 1) {
    const g = new THREE.Group();
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.028, 0.095, 12, 1, true), glassMat);
    bowl.position.y = 0.12; g.add(bowl);
    const wine = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.029, 0.036, 12), wineMat);
    wine.position.y = 0.098; g.add(wine);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.078, 6), glassMat);
    stem.position.y = 0.042; g.add(stem);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 12), glassMat);
    foot.position.y = 0.004; g.add(foot);
    g.scale.setScalar(s);
    return g;
  }
  place(wineGlass(), 2.26, 1.09, 2.16);
  place(wineGlass(), 2.72, 1.09, 2.44);

  /* パニエ：籠の底に瓶がぴたりと収まるように */
  const panier = new THREE.Group();
  const wicker = lam({ map: tex(wood('#9a7847', '#523a1c'), 3, 1), side: THREE.DoubleSide });
  const R = 0.062;
  const cradle = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 0.34, 16, 1, true, Math.PI * 1.06, Math.PI * 0.88), wicker);
  cradle.rotation.z = Math.PI / 2;
  panier.add(cradle);
  [-0.17, 0.17].forEach((x) => {
    const e = new THREE.Mesh(new THREE.RingGeometry(R - 0.012, R + 0.014, 16, 1, Math.PI * 1.06, Math.PI * 0.88), wicker);
    e.position.set(x, 0, 0); e.rotation.y = Math.PI / 2;
    panier.add(e);
  });
  const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 5, 14, Math.PI * 0.9), wicker);
  hnd.rotation.y = Math.PI / 2; hnd.rotation.z = Math.PI * 0.05; hnd.position.y = 0.005;
  panier.add(hnd);
  const laid = new THREE.Mesh(bottleGeo, glassB);
  laid.rotation.z = Math.PI / 2; laid.position.set(0.15, 0, 0);
  panier.add(laid);
  const laidCap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 8), capMat);
  laidCap.rotation.z = Math.PI / 2; laidCap.position.set(-0.145, 0, 0);
  panier.add(laidCap);
  place(panier, 2.52, 1.145, 2.30, -0.55);

  /* 帳場 */
  const CZ = -2.6, CW = 3.0;
  const counter = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(CW, 0.09, 0.72), oakMat);
  top.position.y = 1.02; counter.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(CW, 1.0, 0.6), darkWood);
  front.position.y = 0.5; counter.add(front);
  place(counter, 0, 0, CZ);
  boxes.push({ x: 0, z: CZ, w: CW, d: 0.72 });

  /* 紳士のこしらえ */
  const skin = lam({ color: 0xdcb493 });
  const black = lam({ color: 0x14100f });
  const white = lam({ color: 0xf0ece2 });
  const hairM = lam({ color: 0x1a120c });
  const silver = lam({ color: 0xc9c3b4 });
  const mouthM = lam({ color: 0x3a1f1a });

  function gentleman(jacket: any, sommelier: boolean, seated: boolean) {
    const g = new THREE.Group();
    const p: any = {};
    const U = seated ? -0.25 : 0;                     // 腰かけた分だけ、上体を下げます
    const bx = (w: number, h: number, d: number, m: any, x: number, y: number, z: number, ry = 0) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b;
    };
    if (seated) {
      [-0.11, 0.11].forEach((sx) => {
        bx(0.165, 0.175, 0.44, black, sx, 0.63, 0.22);        // 腿
        bx(0.15, 0.50, 0.165, black, sx, 0.38, 0.40);          // 脛
        bx(0.145, 0.065, 0.27, black, sx, 0.135, 0.47);        // 靴
      });
    } else {
      p.shoeL = bx(0.15, 0.07, 0.28, black, -0.10, 0.035, 0.03);
      p.shoeR = bx(0.15, 0.07, 0.28, black, 0.10, 0.035, 0.03);
      p.legL = bx(0.16, 0.80, 0.19, black, -0.10, 0.47, 0);
      p.legR = bx(0.16, 0.80, 0.19, black, 0.10, 0.47, 0);
    }
    p.torso = bx(0.46, 0.62, 0.27, jacket, 0, 1.16 + U, 0);
    bx(0.17, 0.44, 0.02, white, 0, 1.22 + U, 0.136);
    bx(0.055, 0.055, 0.03, black, 0, 1.16 + U, 0.148);
    bx(0.115, 0.05, 0.035, black, 0, 1.425 + U, 0.142);
    bx(0.10, 0.34, 0.02, jacket, -0.11, 1.30 + U, 0.142, 0.16);
    bx(0.10, 0.34, 0.02, jacket, 0.11, 1.30 + U, 0.142, -0.16);
    bx(0.06, 0.025, 0.02, white, -0.155, 1.34 + U, 0.139);
    p.armL = bx(0.115, 0.56, 0.16, jacket, -0.285, 1.17 + U, seated ? 0.13 : 0.01);
    p.armR = bx(0.115, 0.56, 0.16, jacket, 0.285, 1.17 + U, seated ? 0.13 : 0.01);
    if (seated) { p.armL.rotation.x = -0.62; p.armR.rotation.x = -0.62; }
    p.handL = bx(0.10, 0.10, 0.13, skin, -0.20, 0.845 + U + (seated ? 0.10 : 0), seated ? 0.66 : 0.01);
    p.handR = bx(0.10, 0.10, 0.13, skin, 0.20, 0.845 + U + (seated ? 0.10 : 0), seated ? 0.66 : 0.01);
    if (!seated) { p.handL.position.x = -0.285; p.handR.position.x = 0.285; }
    bx(0.11, 0.09, 0.11, skin, 0, 1.50 + U, 0);
    p.head = bx(0.215, 0.255, 0.205, skin, 0, 1.665 + U, 0);
    bx(0.032, 0.022, 0.02, black, -0.055, 1.705 + U, 0.105);
    bx(0.032, 0.022, 0.02, black, 0.055, 1.705 + U, 0.105);
    bx(0.075, 0.018, 0.02, hairM, 0, 1.756 + U, 0.104);
    p.mouth = bx(0.052, 0.014, 0.02, mouthM, 0, 1.605 + U, 0.104);
    bx(0.148, 0.075, 0.215, hairM, 0.036, 1.812 + U, -0.004);
    bx(0.058, 0.062, 0.212, hairM, -0.078, 1.806 + U, -0.004);
    bx(0.215, 0.055, 0.075, hairM, 0, 1.775 + U, -0.077);
    bx(0.14, 0.045, 0.03, hairM, 0.038, 1.775 + U, 0.093);
    bx(0.055, 0.032, 0.03, hairM, -0.078, 1.772 + U, 0.093);
    if (sommelier) {
      bx(0.47, 0.72, 0.03, black, 0, 0.62, 0.152);
      bx(0.50, 0.05, 0.04, black, 0, 0.97, 0.152);
      const cordL = bx(0.012, 0.30, 0.012, black, -0.055, 1.36 + U, 0.128); cordL.rotation.z = 0.16;
      const cordR = bx(0.012, 0.30, 0.012, black, 0.055, 1.36 + U, 0.128); cordR.rotation.z = -0.16;
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.044, 0.018, 14), silver);
      cup.position.set(0, 1.205 + U, 0.152); g.add(cup);
      const dim = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), silver);
      dim.position.set(0.022, 1.214 + U, 0.152); g.add(dim);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.010, 0.022), silver);
      grip.position.set(-0.058, 1.207 + U, 0.152); g.add(grip);
    }
    p.U = U;
    return { g, p };
  }

  const cl = gentleman(black, true, false);
  const clerk = cl.g;
  clerk.userData.clerk = true;
  const HOME = { x: 0, z: -3.35 };
  place(clerk, HOME.x, 0, HOME.z);
  pick.push(clerk);
  const halo = new THREE.PointLight(0xffcf9a, 2.6, 3.8, 1.6);
  scene.add(halo);

  /* 竪型ピアノと弾き手。部屋の左半分で、扉のほうを向いて */
  const PX = -2.55, PZ = -0.95;   /* 入店した目の先、左手前へ */
  const piano = new THREE.Group();
  /* 黒漆のアップライト。灯りを鏡のように返します */
  const pm = new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: 0.16, metalness: 0.42, envMapIntensity: 1.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.18, 0.58), pm);
  body.position.set(0, 0.72, -0.12); piano.add(body);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.06, 0.64), pm);
  lid.position.set(0, 1.33, -0.10); piano.add(lid);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.07, 0.28), pm);
  shelf.position.set(0, 0.70, 0.21); piano.add(shelf);
  const kt = new THREE.CanvasTexture(keysTex()); kt.anisotropy = Math.min(8, maxAniso);
  const keysM = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.24), new THREE.MeshBasicMaterial({ map: kt }));
  keysM.rotation.x = -Math.PI / 2; keysM.position.set(0, 0.742, 0.225); piano.add(keysM);
  [-0.66, 0.66].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.7, 0.14), pm);
    leg.position.set(x, 0.35, 0.14); piano.add(leg);
  });
  const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), lam({ color: 0xa8925f }));
  pedal.position.set(0, 0.10, 0.08); piano.add(pedal);
  const PA = 0.85;                                        // 鍵盤と弾き手が、扉から見えるように
  const rz = (x: number, z: number) =>
    [PX + x * Math.cos(PA) + z * Math.sin(PA), PZ - x * Math.sin(PA) + z * Math.cos(PA)];
  place(piano, PX, 0, PZ, Math.PI + PA);
  boxes.push({ x: PX, z: PZ, w: 1.7, d: 1.5 });

  const gp = rz(0.42, 0.10);
  const pianoGlass = place(wineGlass(1.15), gp[0], 1.36, gp[1]);
  const glassHome = pianoGlass.position.clone();

  const cream = lam({ color: 0xe9e3d4 });
  const pl = gentleman(cream, false, true);
  const P = pl.p;
  const pp = rz(0, -0.87);
  place(pl.g, pp[0], 0, pp[1], PA);
  const handHome = { L: P.handL.position.clone(), R: P.handR.position.clone() };

  const bp = rz(0, -1.03);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.075, 0.32), oakMat);
  bench.position.set(bp[0], 0.58, bp[1]); bench.rotation.y = PA; scene.add(bench);
  [-0.25, 0.25].forEach((d) => {
    const q = rz(d, -1.03);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), oakMat);
    l.position.set(q[0], 0.275, q[1]); scene.add(l);
  });
  boxes.push({ x: bp[0], z: bp[1], w: 0.9, d: 0.9 });
  const pglow = new THREE.PointLight(0xffb877, 2.4, 4.2, 1.6);
  pglow.position.set(PX + 0.4, 1.9, PZ + 0.5); scene.add(pglow);

  /* 見回しと歩き */
  let yaw = -0.34, pitch = -0.02;   /* 入店の一目は、ピアノのほうへ */
  const keys: Record<string, boolean> = {};
  let locked = false, paused = false;
  let padX = 0, padY = 0, lookX = 0, lookY = 0;
  const el = renderer.domElement;

  const fire = () => { if (look.kind) { au.clink(); o.onUse(look.kind, look.id); } };

  /* 店員の道すじ。帳場の裏からは、脇を回って出てきます */
  let path: Array<{ x: number; z: number }> = [];
  let clerkStep = 0, clerkPhase = 0, called = false, backAt = 0;
  const behind = (z: number) => z < CZ + 0.36;
  const route = (tx: number, tz: number) => {
    const out: Array<{ x: number; z: number }> = [];
    const inside = behind(clerk.position.z), goInside = behind(tz);
    if (inside !== goInside) {
      const sx = (inside ? (tx >= 0 ? 1 : -1) : (clerk.position.x >= 0 ? 1 : -1)) * (CW / 2 + 0.55);
      out.push({ x: sx, z: CZ - 0.62 });
      out.push({ x: sx, z: CZ + 0.62 });
      if (inside) out.reverse();
    }
    out.push({ x: tx, z: tz });
    return out;
  };
  const callClerk = () => {
    au.start();
    const d = Math.hypot(camera.position.x - clerk.position.x, camera.position.z - clerk.position.z);
    if (d < 1.9) { o.onArrive(); return; }
    const a = Math.atan2(clerk.position.x - camera.position.x, clerk.position.z - camera.position.z);
    path = route(camera.position.x + Math.sin(a) * 1.15, camera.position.z + Math.cos(a) * 1.15);
    called = true;
  };

  const onKey = (e: KeyboardEvent, v: boolean) => {
    const k = e.key.toLowerCase();
    if (v) au.start();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys[k] = v;
      if (v && !paused) e.preventDefault();
    }
    if (v && !paused) {
      if (k === 'c') callClerk();
      else if (k === 'e' || k === ' ') fire();
    }
  };
  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  addEventListener('keydown', kd); addEventListener('keyup', ku);

  const onMove = (e: MouseEvent) => {
    if (!locked || paused) return;
    yaw -= e.movementX * 0.0022;
    pitch = Math.max(-1.15, Math.min(1.05, pitch - e.movementY * 0.0022));
  };
  addEventListener('mousemove', onMove);
  const onLockChange = () => { locked = document.pointerLockElement === el; };
  document.addEventListener('pointerlockchange', onLockChange);

  const clickCanvas = () => {
    au.start();
    if (paused) return;
    if (!locked && !matchMedia('(hover: none)').matches) { el.requestPointerLock?.(); return; }
    fire();
  };
  el.addEventListener('click', clickCanvas);

  /* 携帯：左半分をなぞって歩き、右半分をなぞって見回します */
  const touch: Record<number, { x: number; y: number; move: boolean }> = {};
  const ts = (e: TouchEvent) => {
    au.start();
    for (const t of Array.from(e.changedTouches)) {
      touch[t.identifier] = { x: t.clientX, y: t.clientY, move: t.clientX < innerWidth / 2 };
    }
  };
  const tm = (e: TouchEvent) => {
    if (paused) return;
    for (const t of Array.from(e.changedTouches)) {
      const s = touch[t.identifier]; if (!s) continue;
      const dx = t.clientX - s.x, dy = t.clientY - s.y;
      if (s.move) { padX = Math.max(-1, Math.min(1, dx / 60)); padY = Math.max(-1, Math.min(1, dy / 60)); }
      else {
        yaw -= dx * 0.006;
        pitch = Math.max(-1.15, Math.min(1.05, pitch - dy * 0.006));
        s.x = t.clientX; s.y = t.clientY;
      }
    }
    e.preventDefault();
  };
  const te = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      const s = touch[t.identifier];
      if (s?.move) { padX = 0; padY = 0; }
      delete touch[t.identifier];
    }
  };
  el.addEventListener('touchstart', ts, { passive: true });
  el.addEventListener('touchmove', tm, { passive: false });
  el.addEventListener('touchend', te);
  el.addEventListener('touchcancel', te);

  function slide(nx: number, nz: number, x: number, z: number, r = 0.34) {
    const hit = (px: number, pz: number) =>
      boxes.some((b) => Math.abs(px - b.x) < b.w / 2 + r && Math.abs(pz - b.z) < b.d / 2 + r);
    let ox = nx, oz = nz;
    if (hit(ox, oz)) { if (!hit(nx, z)) oz = z; else if (!hit(x, nz)) ox = x; else { ox = x; oz = z; } }
    ox = Math.max(-W / 2 + 0.45, Math.min(W / 2 - 0.45, ox));
    oz = Math.max(-D / 2 + 0.45, Math.min(D / 2 - 0.45, oz));
    return [ox, oz];
  }

  const ray = new THREE.Raycaster();
  const mid = new THREE.Vector2(0, 0);
  const look: { kind: 'clerk' | 'bottle' | null; id?: string } = { kind: null };
  let lookT = 0, nearT = 0, wasNear = false;

  let doorOpen = 0, doorFired = false, alive = true;
  let armed = false, walked = 0, bob = 0;
  let drink = 0, drinkAt = 16;
  /* 燭台のあかりで、すべてのものが影を落とします（炎など透けるものは除きます） */
  scene.traverse((obj: any) => {
    if (obj.isMesh) {
      const tr = obj.material && (obj.material.transparent || obj.material.blending === THREE.AdditiveBlending);
      obj.castShadow = !tr;
      obj.receiveShadow = true;
    }
  });

  const clock = new THREE.Clock();

  function resize() {
    const w = o.mount.clientWidth || innerWidth, h = o.mount.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let first = true, T = 0, stuck = 0;
  function frame() {
    if (!alive) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    T += dt;
    const now = performance.now();

    flames.forEach((f) => {
      const s = f.seed;
      const slow = Math.sin(T * 1.7 + s) * 0.10 + Math.sin(T * 4.3 + s * 1.7) * 0.06;
      f.v += ((1 + slow + (Math.random() - 0.5) * 0.10) - f.v) * Math.min(1, dt * 9);
      if (Math.random() < dt * 0.5) f.v *= 0.72;
      if (f.p) f.p.intensity = f.base * f.v;
      if (f.fl) { f.fl.scale.set(0.9 + f.v * 0.18, f.v * 1.06, 0.9 + f.v * 0.18); f.fl.rotation.z = Math.sin(T * 6 + s) * 0.06; }
    });

    /* 弾き手。歌いながら、ときどき一口 */
    const ph = au.phase();
    drinkAt -= dt;
    if (drinkAt <= 0 && drink === 0) drink = 0.0001;
    if (drink > 0) { drink += dt / 5.4; if (drink >= 1) { drink = 0; drinkAt = 24 + Math.random() * 24; } }
    const k = drink > 0 ? Math.sin(Math.min(1, drink) * Math.PI) : 0;
    if (drink > 0) {
      P.handR.position.set(
        handHome.R.x + (0.10 - handHome.R.x) * k,
        handHome.R.y + (1.30 + P.U - handHome.R.y) * k,
        handHome.R.z + (0.20 - handHome.R.z) * k);
      P.armR.rotation.x = -0.62 + k * 0.55;
      P.head.rotation.x = -k * 0.2;
      const wp = P.handR.getWorldPosition(new THREE.Vector3());
      pianoGlass.position.set(wp.x, wp.y - 0.02, wp.z + 0.05);
      pianoGlass.rotation.z = k * 0.5;
    } else {
      P.handR.position.copy(handHome.R);
      P.armR.rotation.x = -0.62;
      P.head.rotation.x = 0;
      pianoGlass.position.copy(glassHome);
      pianoGlass.rotation.z = 0;
      P.handR.position.y = handHome.R.y + Math.abs(Math.cos(ph * Math.PI * 1.5)) * 0.03;
    }
    P.handL.position.y = handHome.L.y + Math.abs(Math.sin(ph * Math.PI)) * 0.026;
    P.head.rotation.z = Math.sin(ph * Math.PI * 0.5) * 0.09;
    P.torso.rotation.z = Math.sin(ph * Math.PI * 0.5 + 0.4) * 0.04;
    const vx = au.vox();
    P.mouth.scale.y = 1 + vx * (2.6 + Math.sin(now * 0.019) * 1.1);

    if (!paused) {
      yaw -= lookX * dt * 2.6;
      pitch = Math.max(-1.15, Math.min(1.05, pitch - lookY * dt * 2.0));
      camera.rotation.set(pitch, yaw, 0, 'YXZ');

      let fwd = 0, side = 0;
      if (keys['w'] || keys['arrowup']) fwd += 1;
      if (keys['s'] || keys['arrowdown']) fwd -= 1;
      if (keys['a'] || keys['arrowleft']) side -= 1;
      if (keys['d'] || keys['arrowright']) side += 1;
      fwd -= padY; side += padX;
      const run = !!keys['shift'];
      const sp = (run ? 3.0 : 1.85) * dt;
      if (fwd || side) {
        const len = Math.max(1, Math.hypot(fwd, side));
        const dx = (Math.sin(yaw) * -fwd + Math.cos(yaw) * side) / len * sp;
        const dz = (Math.cos(yaw) * -fwd - Math.sin(yaw) * side) / len * sp;
        const px = camera.position.x, pz = camera.position.z;
        const [nx, nz] = slide(px + dx, pz + dz, px, pz);
        camera.position.x = nx; camera.position.z = nz;
        const gone = Math.hypot(nx - px, nz - pz);
        walked += gone; bob += gone * 4.6;
        camera.position.y = 1.62 + Math.sin(bob) * 0.022;
        if (walked > (run ? 0.78 : 0.62)) { walked = 0; au.step(run); }
      } else if (walked) {
        walked = 0;
        camera.position.y += (1.62 - camera.position.y) * Math.min(1, dt * 8);
      }

      au.dist(Math.hypot(camera.position.x - PX, camera.position.z - PZ));

      if (camera.position.z < D / 2 - 2.25) armed = true;
      const nearDoor = armed && camera.position.z > D / 2 - 1.55 && Math.abs(camera.position.x) < 1.15;
      const was = doorOpen;
      doorOpen += ((nearDoor ? 1 : 0) - doorOpen) * Math.min(1, dt * 3.4);
      doorGroup.rotation.y = -doorOpen * 1.15;
      if (was < 0.06 && doorOpen >= 0.06) au.creak();
      if (nearDoor && doorOpen > 0.75 && !doorFired) { doorFired = true; o.onDoor(); }
      if (!nearDoor) doorFired = false;

      nearT += dt;
      if (nearT > 0.2) {
        nearT = 0;
        const nr = Math.hypot(camera.position.x - clerk.position.x, camera.position.z - clerk.position.z) < 2.4;
        if (nr !== wasNear) { wasNear = nr; o.onNear(nr); }
      }

      lookT += dt;
      if (lookT > 0.09) {
        lookT = 0;
        ray.setFromCamera(mid, camera);
        const hits = ray.intersectObjects(pick, true);
        let kind: 'clerk' | 'bottle' | null = null, id: string | undefined;
        if (hits.length && hits[0].distance < 2.6) {
          let g: any = hits[0].object;
          while (g && !g.userData?.clerk && !g.userData?.bottle) g = g.parent;
          if (g?.userData?.clerk) kind = 'clerk';
          else if (g?.userData?.bottle) { kind = 'bottle'; id = g.userData.bottle.id; }
        }
        if (kind !== look.kind || id !== look.id) { look.kind = kind; look.id = id; o.onLook(kind, id); }
      }
    }

    /* 店員の歩み */
    let moving = false;
    if (path.length) {
      const g0 = path[0];
      const dx = g0.x - clerk.position.x, dz = g0.z - clerk.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.26) {
        path.shift();
        if (!path.length && called) { called = false; o.onArrive(); backAt = T + 30; }
      } else {
        const v = Math.min(1.30 * dt, d);
        const px = clerk.position.x, pz = clerk.position.z;
        const [nx, nz] = slide(px + dx / d * v, pz + dz / d * v, px, pz, 0.28);
        clerk.position.x = nx; clerk.position.z = nz;
        const gone = Math.hypot(nx - px, nz - pz);
        stuck = gone < v * 0.25 ? stuck + dt : 0;
        if (stuck > 0.8) { stuck = 0; path.shift(); }        // つかえたら、次の目印へ
        clerk.rotation.y = Math.atan2(dx, dz);
        moving = true;
        clerkStep += gone; clerkPhase += gone * 7.4;
        if (clerkStep > 0.58) { clerkStep = 0; au.step(false, true); }
      }
    } else if (backAt && T > backAt && Math.hypot(clerk.position.x - HOME.x, clerk.position.z - HOME.z) > 0.3) {
      backAt = 0; path = route(HOME.x, HOME.z);
    }
    const sw = moving ? Math.sin(clerkPhase) * 0.42 : 0;
    cl.p.legL.rotation.x = sw; cl.p.legR.rotation.x = -sw;
    cl.p.armL.rotation.x = -sw * 0.6; cl.p.armR.rotation.x = sw * 0.6;
    cl.p.shoeL.position.z = 0.03 + sw * 0.18; cl.p.shoeR.position.z = 0.03 - sw * 0.18;
    cl.p.torso.position.y = 1.16 + (moving ? Math.abs(Math.sin(clerkPhase)) * 0.014 : 0);
    if (!moving) {
      const a = Math.atan2(camera.position.x - clerk.position.x, camera.position.z - clerk.position.z);
      let d2 = a - clerk.rotation.y;
      while (d2 > Math.PI) d2 -= Math.PI * 2;
      while (d2 < -Math.PI) d2 += Math.PI * 2;
      clerk.rotation.y += d2 * Math.min(1, dt * 2.4);
      cl.p.head.position.y = 1.665 + Math.sin(now * 0.0016) * 0.006;
    }
    halo.position.set(clerk.position.x, 1.8, clerk.position.z + 0.45);

    renderer.render(scene, camera);
    if (first) { first = false; o.onReady(); }
  }
  frame();

  return {
    dispose() {
      alive = false;
      au.close();
      removeEventListener('keydown', kd); removeEventListener('keyup', ku);
      removeEventListener('mousemove', onMove); removeEventListener('resize', resize);
      document.removeEventListener('pointerlockchange', onLockChange);
      el.removeEventListener('click', clickCanvas);
      el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm);
      el.removeEventListener('touchend', te); el.removeEventListener('touchcancel', te);
      try { document.exitPointerLock?.(); } catch { /* しずかに */ }
      renderer.dispose();
      el.remove();
    },
    pause(v: boolean) {
      paused = v;
      if (v) { try { document.exitPointerLock?.(); } catch { /* しずかに */ } }
      for (const k in keys) keys[k] = false;
      padX = padY = lookX = lookY = 0;
    },
    lock() { au.start(); if (!matchMedia('(hover: none)').matches) el.requestPointerLock?.(); },
    sound(v: boolean) { au.set(v); },
    moveVec(x: number, y: number) { au.start(); padX = x; padY = y; },
    lookVel(x: number, y: number) { lookX = x; lookY = y; },
    use() { au.start(); fire(); },
    callClerk,
  };
}
