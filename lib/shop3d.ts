'use client';

/**
 * バーチャル店舗の三次元の間取り。
 * 石を積んだ穴倉（カーヴ）のなかに、そのまま店をこしらえてあります。
 * 画づくりは、二〇〇〇年代初頭の家庭用ゲーム機ふうの粗さで。
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
};

export type ShopOpts = {
  mount: HTMLElement;
  bottles: Bottle[];
  onLook: (kind: 'clerk' | 'bottle' | null, id?: string) => void;
  onUse: (kind: 'clerk' | 'bottle', id?: string) => void;
  onNear: (v: boolean) => void;
  onDoor: () => void;
  onReady: () => void;
};

/* ── 音 ─────────────────────────────────────────────
   足音も扉の軋みも、そして店内の演奏も、その場でこしらえます。
   曲は当店のためだけに書き起こした、あの時代の左手の跳ねる弾き方にならったものです。 */
function makeAudio() {
  let ctx: any = null;
  let bus: any = null;        // 効果音
  let mus: any = null;        // 演奏
  let noise: any = null;
  let on = true;
  let foot = 0;
  let timer: any = null;
  let bar = 0, next = 0;

  const start = () => {
    if (ctx || typeof window === 'undefined') return;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    bus = ctx.createGain(); bus.gain.value = on ? 0.9 : 0; bus.connect(ctx.destination);
    mus = ctx.createGain(); mus.gain.value = on ? 0.34 : 0; mus.connect(ctx.destination);

    const n = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = n;

    /* 穴倉のしずかな空気 */
    const src = ctx.createBufferSource();
    src.buffer = n; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200;
    const g = ctx.createGain(); g.gain.value = 0.045;
    src.connect(lp); lp.connect(g); g.connect(bus); src.start();

    next = ctx.currentTime + 0.2;
    timer = setInterval(tick, 120);
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

  /* ピアノらしい一音 */
  const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const key = (m: number, at: number, len: number, vol: number) => {
    if (!ctx) return;
    const f = hz(m);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1900 + f * 3;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.008);
    g.gain.exponentialRampToValueAtTime(vol * 0.28, at + 0.09);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    [[1, 1], [2, 0.34], [3, 0.16], [4.02, 0.07]].forEach(([mul, amp]) => {
      const o = ctx.createOscillator();
      o.type = mul === 1 ? 'triangle' : 'sine';
      o.frequency.value = f * (mul as number) * (1 + (Math.random() - 0.5) * 0.0016);
      const og = ctx.createGain(); og.gain.value = amp as number;
      o.connect(og); og.connect(g);
      o.start(at); o.stop(at + len + 0.05);
    });
    g.connect(lp); lp.connect(mus);
  };

  /* 八小節のめぐり。左手は跳ね、右手は五音の音階でうたいます */
  const BPM = 108, SW = 0.62;
  const beat = 60 / BPM;
  const ROOT = [46, 46, 51, 51, 44, 49, 46, 51];          // 変ロ長調のあたり
  const CH = [[58, 62, 65], [58, 62, 65], [56, 60, 63], [56, 60, 63],
              [56, 60, 63], [58, 61, 65], [58, 62, 65], [56, 60, 63]];
  const MEL = [70, 73, 75, 77, 75, 73, 70, 68, 70, 75, 77, 80, 77, 75, 73, 70];

  const play = (at: number, b: number) => {
    const r = ROOT[b % 8], ch = CH[b % 8];
    for (let q = 0; q < 4; q++) {
      const t = at + q * beat;
      if (q % 2 === 0) key(r - (q === 2 ? 5 : 0), t, beat * 1.5, 0.20);       // 低音
      else ch.forEach((m) => key(m, t, beat * 0.55, 0.075));                   // 和音の合いの手
      if (Math.random() < 0.82) {
        const i = (b * 4 + q) % MEL.length;
        key(MEL[i], t, beat * 0.62, 0.085);
        if (Math.random() < 0.5) key(MEL[(i + 1) % MEL.length], t + beat * SW, beat * 0.4, 0.062);
      }
    }
  };

  const tick = () => {
    if (!ctx || !on) return;
    while (next < ctx.currentTime + 0.6) { play(next, bar++); next += beat * 4; }
  };

  return {
    start,
    set(v: boolean) {
      on = v;
      if (bus) bus.gain.value = v ? 0.9 : 0;
      if (mus) mus.gain.value = v ? 0.34 : 0;
      if (v) { start(); if (ctx) next = Math.max(next, ctx.currentTime + 0.2); }
    },
    /* ピアノからの隔たりで、演奏の大きさを変えます */
    dist(d: number) {
      if (!mus || !on) return;
      const v = 0.42 * Math.max(0.22, Math.min(1, 3.6 / Math.max(1.2, d)));
      mus.gain.value = v;
    },
    phase() { return ctx ? (ctx.currentTime / beat) % 4 : 0; },
    step(run: boolean) {
      foot ^= 1;
      burst(foot ? 560 : 420, 1.2, run ? 0.26 : 0.17, run ? 0.11 : 0.15);
      burst(foot ? 138 : 116, 2.4, run ? 0.20 : 0.13, 0.10);
    },
    creak() { tone(180, 96, 0.05, 0.55, 'sawtooth'); burst(900, 0.8, 0.05, 0.5); },
    clink() { tone(2400, 1900, 0.035, 0.09); },
    close() { try { clearInterval(timer); ctx?.close(); } catch { /* しずかに */ } ctx = null; },
  };
}

/** 粗い肌合いを、その場で描いて作ります */
function grain(base: string, line: string, n = 40): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  g.fillStyle = line;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = 0.10 + Math.random() * 0.22;
    g.fillRect((Math.random() * 64) | 0, (Math.random() * 64) | 0, 1 + ((Math.random() * 3) | 0), 1);
  }
  g.globalAlpha = 1;
  return c;
}

/** 積んだ石。目地をつけて、一つずつ濃さを違えます */
function stone(base: string, dark: string, rows = 4): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = dark; g.fillRect(0, 0, 128, 128);
  const h = 128 / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (128 / 6);
    for (let i = -1; i < 7; i++) {
      const x = off + i * (128 / 6), y = r * h;
      const v = 0.72 + Math.random() * 0.5;
      g.fillStyle = shade(base, v);
      g.fillRect(x + 1.5, y + 1.5, 128 / 6 - 3, h - 3);
      g.fillStyle = 'rgba(0,0,0,.22)';
      g.fillRect(x + 1.5, y + h - 4, 128 / 6 - 3, 2);
    }
  }
  /* 湿りの染み */
  for (let i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(20,26,18,.14)';
    g.fillRect((Math.random() * 128) | 0, (Math.random() * 128) | 0, 3 + Math.random() * 10, 2 + Math.random() * 7);
  }
  return c;
}
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}

/** 鍵盤の絵 */
function keysTex(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = '#efeadc'; g.fillRect(0, 0, 256, 32);
  g.strokeStyle = '#9a9182'; g.lineWidth = 1;
  for (let i = 0; i < 36; i++) { g.beginPath(); g.moveTo(i * 7.1, 0); g.lineTo(i * 7.1, 32); g.stroke(); }
  g.fillStyle = '#141110';
  const pat = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  for (let i = 0; i < 36; i++) if (pat[i % 12]) g.fillRect(i * 7.1 + 4.6, 0, 4.6, 19);
  return c;
}

/** 瓶の肩に貼る、紙のラベル */
function labelTex(name: string, prod: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 80;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9e2d2'; g.fillRect(0, 0, 128, 80);
  g.strokeStyle = 'rgba(110,80,52,.6)'; g.lineWidth = 2;
  g.strokeRect(5, 5, 118, 70);
  g.fillStyle = '#3a2a1c'; g.textAlign = 'center';
  g.font = '600 11px "Shippori Mincho","Hiragino Mincho ProN",serif';
  g.fillText(String(prod || '').slice(0, 16), 64, 26);
  g.font = '9px "Shippori Mincho","Hiragino Mincho ProN",serif';
  const t = String(name || '').replace(/\s*\/.*$/, '').slice(0, 34);
  const lines: string[] = [];
  for (let i = 0; i < t.length; i += 13) lines.push(t.slice(i, i + 13));
  lines.slice(0, 3).forEach((l, i) => g.fillText(l, 64, 44 + i * 12));
  return c;
}

export async function createShop(o: ShopOpts): Promise<ShopHandle> {
  const THREE: any = await (new Function('u', 'return import(u)'))(THREE_URL);
  const au = makeAudio();

  const W = 13, D = 9, WH = 2.05, RISE = 1.55;   // 幅・奥行・腰壁の高さ・穹窿の起き上がり
  const SKY = 0x0e0b09;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.FogExp2(SKY, 0.058);

  const camera = new THREE.PerspectiveCamera(66, 1, 0.05, 60);
  camera.position.set(0, 1.62, D / 2 - 2.9);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(0.62);
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.NoToneMapping;
  o.mount.appendChild(renderer.domElement);
  renderer.domElement.style.imageRendering = 'pixelated';

  const tex = (c: HTMLCanvasElement, rx: number, ry: number) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapNearestFilter;
    return t;
  };
  const lam = (p: any) => new THREE.MeshLambertMaterial(p);
  const boxes: Array<{ x: number; z: number; w: number; d: number }> = [];
  const put = (g: any, x: number, y: number, z: number, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); return g; };

  /* 石の床・腰壁・穹窿（かまぼこ天井） ------------------------- */
  const stoneTex = stone('#6a6055', '#221d18', 4);
  const floorMat = lam({ map: tex(stone('#5b5349', '#1d1916', 3), 6, 4) });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  const wallMat = lam({ map: tex(stoneTex, 5, 1.1) });
  const wallEnd = lam({ map: tex(stone('#645b50', '#201b17', 4), 3, 1.6) });
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(W, WH), wallMat); w1.position.set(0, WH / 2, -D / 2); scene.add(w1);
  const w2 = new THREE.Mesh(new THREE.PlaneGeometry(W, WH), wallMat); w2.position.set(0, WH / 2, D / 2); w2.rotation.y = Math.PI; scene.add(w2);
  const e1 = new THREE.Mesh(new THREE.PlaneGeometry(D, WH + RISE + 0.4), wallEnd); e1.position.set(-W / 2, (WH + RISE) / 2, 0); e1.rotation.y = Math.PI / 2; scene.add(e1);
  const e2 = new THREE.Mesh(new THREE.PlaneGeometry(D, WH + RISE + 0.4), wallEnd); e2.position.set(W / 2, (WH + RISE) / 2, 0); e2.rotation.y = -Math.PI / 2; scene.add(e2);

  const vaultMat = lam({ map: tex(stone('#5d554b', '#1c1814', 3), 7, 2), side: THREE.BackSide });
  const vault = new THREE.Mesh(
    new THREE.CylinderGeometry(D / 2, D / 2, W, 16, 1, true, 0, Math.PI), vaultMat);
  vault.rotation.z = Math.PI / 2;
  vault.scale.set(1, 1, RISE / (D / 2));
  vault.position.y = WH;
  scene.add(vault);

  /* 横断する石の肋（アーチ）と、その足元の柱 */
  const ribMat = lam({ map: tex(stone('#4e463d', '#161310', 2), 4, 1) });
  [-4.3, 0, 4.3].forEach((x) => {
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(D / 2 + 0.16, D / 2 + 0.16, 0.34, 16, 1, true, 0, Math.PI), ribMat);
    rib.rotation.z = Math.PI / 2; rib.scale.set(1, 1, (RISE + 0.16) / (D / 2 + 0.16));
    rib.position.set(x, WH, 0); scene.add(rib);
    [-1, 1].forEach((s) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.34, WH, 0.34), ribMat);
      col.position.set(x, WH / 2, s * (D / 2 - 0.14)); scene.add(col);
    });
  });

  /* 壁のくぼみ（アーチ窪） */
  const nicheMat = lam({ color: 0x17130f });
  [[-4.3, -1], [0, -1], [4.3, -1]].forEach(([x]) => {
    const n = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.3), nicheMat);
    n.position.set(x as number, 1.15, -D / 2 + 0.16); scene.add(n);
  });

  /* 扉（入口） -------------------------------------------------- */
  const doorGroup = new THREE.Group();
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.25, 0.07), lam({ color: 0x38241a }));
  door.position.set(0.575, 1.125, 0); doorGroup.add(door);
  [0.4, 0.9, 1.4, 1.9].forEach((y) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.09), lam({ color: 0x241a14 }));
    band.position.set(0.575, y, 0); doorGroup.add(band);
  });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), lam({ color: 0xd8bd8e }));
  knob.position.set(1.04, 1.1, 0.06); doorGroup.add(knob);
  doorGroup.position.set(-0.575, 0, D / 2 - 0.06);
  scene.add(doorGroup);

  /* 灯り。蝋燭と吊り灯 ------------------------------------------ */
  scene.add(new THREE.AmbientLight(0xffe0be, 0.78));
  scene.add(new THREE.HemisphereLight(0xffd0a0, 0x241d18, 0.5));
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd68a });
  const flames: any[] = [];
  const sconce = (x: number, z: number, ry: number, inten: number) => {
    const g = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.26), lam({ color: 0x1a1512 }));
    arm.position.z = 0.13; g.add(arm);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.05, 6), lam({ color: 0x1a1512 }));
    cup.position.set(0, 0.04, 0.26); g.add(cup);
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.18, 6), lam({ color: 0xe8ddc4 }));
    wax.position.set(0, 0.15, 0.26); g.add(wax);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 5), flameMat);
    fl.position.set(0, 0.28, 0.26); g.add(fl);
    const p = new THREE.PointLight(0xffb066, inten, 6.4, 1.7);
    p.position.set(0, 0.30, 0.26); g.add(p);
    flames.push({ p, fl, base: inten });
    put(g, x, 1.55, z, ry);
  };
  sconce(-W / 2 + 0.12, -2.6, Math.PI / 2, 3.4); sconce(-W / 2 + 0.12, 2.2, Math.PI / 2, 3.4);
  sconce(W / 2 - 0.12, -2.6, -Math.PI / 2, 3.4); sconce(W / 2 - 0.12, 2.2, -Math.PI / 2, 3.4);
  sconce(-3.4, -D / 2 + 0.12, 0, 3.0); sconce(3.4, -D / 2 + 0.12, 0, 3.0);

  const chand = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.028, 4, 12), lam({ color: 0x191411 }));
  ring.rotation.x = Math.PI / 2; chand.add(ring);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.2, 5), lam({ color: 0xe8ddc4 }));
    wax.position.set(Math.cos(a) * 0.44, 0.12, Math.sin(a) * 0.44); chand.add(wax);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.085, 5), flameMat);
    fl.position.set(Math.cos(a) * 0.44, 0.26, Math.sin(a) * 0.44); chand.add(fl);
    flames.push({ p: null, fl, base: 0 });
  }
  const cp = new THREE.PointLight(0xffc286, 7.0, 9.5, 1.5); cp.position.y = 0.25; chand.add(cp);
  flames.push({ p: cp, fl: null, base: 7.0 });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4), lam({ color: 0x191411 }));
  rope.position.y = 0.42; chand.add(rope);
  put(chand, 0, 2.5, -0.6);

  /* 棚（石のなかに、樫の棚を差し込みます） ---------------------- */
  const woodMat = lam({ map: tex(grain('#3b2a1c', '#1f1409', 34), 3, 1) });
  const oakMat = lam({ map: tex(grain('#4a3320', '#241608', 30), 2, 1) });
  const shelves: any[] = [];

  function rack(x: number, z: number, w: number, rotY: number) {
    const g = new THREE.Group();
    const depth = 0.42, hh = 2.05;
    const side = (sx: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, hh, depth), woodMat);
      m.position.set(sx, hh / 2, 0); g.add(m);
    };
    side(-w / 2); side(w / 2);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.04), woodMat);
    back.position.set(0, hh / 2, -depth / 2); g.add(back);
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, depth), woodMat);
      b.position.set(0, 0.30 + i * 0.42, 0); g.add(b);
    }
    put(g, x, 0, z, rotY); shelves.push(g);
    const sw = Math.abs(Math.cos(rotY)) * w + Math.abs(Math.sin(rotY)) * depth;
    const sd = Math.abs(Math.sin(rotY)) * w + Math.abs(Math.cos(rotY)) * depth;
    boxes.push({ x, z, w: sw, d: sd });
    return g;
  }

  const racks = [
    rack(-W / 2 + 0.3, -1.9, 4.6, Math.PI / 2),
    rack(W / 2 - 0.3, -1.9, 4.6, -Math.PI / 2),
    rack(-2.6, -D / 2 + 0.3, 4.4, 0),
    rack(2.6, -D / 2 + 0.3, 4.4, 0),
    rack(W / 2 - 0.3, 2.2, 2.4, -Math.PI / 2),
  ];
  const RW = [4.6, 4.6, 4.4, 4.4, 2.4];

  /* 瓶 ---------------------------------------------------------- */
  const bottleGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.000, 0.00), new THREE.Vector2(0.038, 0.00),
      new THREE.Vector2(0.039, 0.135), new THREE.Vector2(0.019, 0.185),
      new THREE.Vector2(0.0135, 0.21), new THREE.Vector2(0.0135, 0.30),
    ], 7
  );
  const glassA = lam({ color: 0x203a1c });
  const glassB = lam({ color: 0x4a181c });
  const capMat = lam({ color: 0x7a1226 });
  const pick: any[] = [];
  const labelGeo = new THREE.PlaneGeometry(0.062, 0.04);

  function putBottle(parent: any, x: number, y: number, z: number, b?: Bottle) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bottleGeo, Math.random() > 0.45 ? glassA : glassB));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 7), capMat);
    cap.position.y = 0.295; g.add(cap);
    if (b) {
      const t = new THREE.CanvasTexture(labelTex(b.name, b.prod));
      t.magFilter = THREE.NearestFilter;
      const lab = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ map: t }));
      lab.position.set(0, 0.088, 0.0395); g.add(lab);
      g.userData.bottle = b; pick.push(g);
    }
    g.position.set(x, y, z);
    g.rotation.y = Math.random() * 0.5 - 0.25;
    parent.add(g);
  }

  const list = o.bottles.slice();
  let bi = 0;
  racks.forEach((g, ri) => {
    const w = RW[ri];
    for (let s = 0; s < 5; s++) {
      const y = 0.325 + s * 0.42;
      const n = Math.floor(w / 0.115);
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + 0.09 + i * 0.115;
        const named = (s === 1 || s === 2) && i % 3 === 0 && bi < list.length;
        putBottle(g, x, y, 0.02, named ? list[bi++] : undefined);
      }
    }
  });

  /* 壁の窪みに、横に寝かせた瓶を積みます */
  const lyingGeo = bottleGeo;
  [[-4.3, -1], [0, -1], [4.3, -1]].forEach(([x]) => {
    for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(lyingGeo, r % 2 ? glassA : glassB);
      b.rotation.x = Math.PI / 2;
      b.position.set((x as number) - 1.1 + i * 0.245, 0.62 + r * 0.24, -D / 2 + 0.42);
      scene.add(b);
    }
  });

  /* 樽と木箱 ---------------------------------------------------- */
  const hoopMat = lam({ color: 0x2a2320 });
  function barrel(x: number, z: number, lying: boolean, ry = 0) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.88, 12), oakMat);
    g.add(b);
    [-0.3, -0.1, 0.1, 0.3].forEach((y) => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.022, 4, 12), hoopMat);
      h.rotation.x = Math.PI / 2; h.position.y = y * 1.4; g.add(h);
    });
    if (lying) { g.rotation.z = Math.PI / 2; g.position.set(x, 0.36, z); g.rotation.y = ry; }
    else g.position.set(x, 0.44, z);
    scene.add(g);
    boxes.push({ x, z, w: 0.8, d: 0.8 });
    return g;
  }
  barrel(-5.4, 3.2, false); barrel(-4.5, 3.4, false);
  barrel(5.4, 3.3, false);
  barrel(-5.9, -3.6, true, Math.PI / 2); barrel(-5.9, -2.7, true, Math.PI / 2);

  const crate = (x: number, y: number, z: number, ry: number) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.44), oakMat);
    c.position.set(x, y, z); c.rotation.y = ry; scene.add(c);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.45), lam({ color: 0x33231a }));
    s.position.set(x, y + 0.1, z); s.rotation.y = ry; scene.add(s);
  };
  crate(4.9, 0.21, 3.3, 0.2); crate(4.9, 0.63, 3.3, -0.1); crate(5.6, 0.21, 2.7, 0.5);
  boxes.push({ x: 5.2, z: 3.1, w: 1.6, d: 1.2 });

  /* 立ち呑みの卓と、硝子 ---------------------------------------- */
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.07, 12), oakMat);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.02, 8), lam({ color: 0x241a14 }));
  const tbl = new THREE.Group(); tableTop.position.y = 1.05; tableLeg.position.y = 0.52;
  tbl.add(tableTop); tbl.add(tableLeg); put(tbl, 2.5, 0, 2.3);
  boxes.push({ x: 2.5, z: 2.3, w: 1.0, d: 1.0 });

  const glassMat = lam({ color: 0xcfd8d2, transparent: true, opacity: 0.42 });
  const wineMat = lam({ color: 0x4a0f18 });
  function wineGlass(x: number, y: number, z: number, s = 1) {
    const g = new THREE.Group();
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.028, 0.09, 8, 1, true), glassMat);
    bowl.position.y = 0.115; g.add(bowl);
    const wine = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.028, 0.035, 8), wineMat);
    wine.position.y = 0.095; g.add(wine);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.075, 5), glassMat);
    stem.position.y = 0.04; g.add(stem);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 8), glassMat);
    foot.position.y = 0.004; g.add(foot);
    g.scale.setScalar(s);
    g.position.set(x, y, z); scene.add(g); return g;
  }
  wineGlass(2.32, 1.09, 2.22); wineGlass(2.66, 1.09, 2.38);

  /* 帳場と店員 -------------------------------------------------- */
  const counter = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.09, 0.72), oakMat);
  top.position.y = 1.02; counter.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.6), lam({ color: 0x2b1e15 }));
  front.position.y = 0.5; counter.add(front);
  put(counter, 0, 0, -2.6);
  boxes.push({ x: 0, z: -2.6, w: 3.0, d: 0.72 });

  /* 黒服の紳士をこしらえる型（店員も、ピアノ弾きも） */
  const skin = lam({ color: 0xdcb493 });
  const black = lam({ color: 0x14100f });
  const white = lam({ color: 0xf0ece2 });
  const hairM = lam({ color: 0x1a120c });
  function gentleman(hat: boolean) {
    const g = new THREE.Group();
    const parts: any = {};
    const bx = (w: number, h: number, d: number, m: any, x: number, y: number, z: number, ry = 0) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b;
    };
    bx(0.15, 0.07, 0.28, black, -0.10, 0.035, 0.03);
    bx(0.15, 0.07, 0.28, black, 0.10, 0.035, 0.03);
    parts.legL = bx(0.16, 0.80, 0.19, black, -0.10, 0.47, 0);
    parts.legR = bx(0.16, 0.80, 0.19, black, 0.10, 0.47, 0);
    parts.torso = bx(0.46, 0.62, 0.27, black, 0, 1.16, 0);
    bx(0.17, 0.44, 0.02, white, 0, 1.22, 0.136);
    bx(0.055, 0.055, 0.03, black, 0, 1.16, 0.148);
    bx(0.115, 0.05, 0.035, black, 0, 1.425, 0.142);
    bx(0.10, 0.34, 0.02, black, -0.11, 1.30, 0.142, 0.16);
    bx(0.10, 0.34, 0.02, black, 0.11, 1.30, 0.142, -0.16);
    bx(0.06, 0.025, 0.02, white, -0.155, 1.34, 0.139);
    parts.armL = bx(0.115, 0.56, 0.16, black, -0.285, 1.17, 0.01);
    parts.armR = bx(0.115, 0.56, 0.16, black, 0.285, 1.17, 0.01);
    parts.handL = bx(0.10, 0.10, 0.13, skin, -0.285, 0.845, 0.01);
    parts.handR = bx(0.10, 0.10, 0.13, skin, 0.285, 0.845, 0.01);
    bx(0.11, 0.09, 0.11, skin, 0, 1.50, 0);
    parts.head = bx(0.215, 0.255, 0.205, skin, 0, 1.665, 0);
    bx(0.032, 0.022, 0.02, black, -0.055, 1.705, 0.105);
    bx(0.032, 0.022, 0.02, black, 0.055, 1.705, 0.105);
    bx(0.075, 0.018, 0.02, hairM, 0, 1.756, 0.104);
    /* 七三分け */
    bx(0.148, 0.075, 0.215, hairM, 0.036, 1.812, -0.004);
    bx(0.058, 0.062, 0.212, hairM, -0.078, 1.806, -0.004);
    bx(0.215, 0.055, 0.075, hairM, 0, 1.775, -0.077);
    bx(0.14, 0.045, 0.03, hairM, 0.038, 1.775, 0.093);
    bx(0.055, 0.032, 0.03, hairM, -0.078, 1.772, 0.093);
    if (hat) {
      /* 山高帽と、細い口髭 */
      bx(0.30, 0.022, 0.30, black, 0, 1.845, -0.004);
      bx(0.205, 0.115, 0.20, black, 0, 1.915, -0.004);
      bx(0.062, 0.014, 0.02, hairM, 0, 1.617, 0.106);
    }
    return { g, parts };
  }

  const cl = gentleman(false);
  const clerk = cl.g;
  clerk.userData.clerk = true;
  put(clerk, 0, 0, -3.45);
  pick.push(clerk);
  boxes.push({ x: 0, z: -3.45, w: 0.6, d: 0.6 });
  const halo = new THREE.PointLight(0xffcf9a, 3.0, 3.6, 1.6);
  halo.position.set(0, 1.75, -3.0); scene.add(halo);

  /* 竪型のピアノと、その弾き手 ---------------------------------- */
  const piano = new THREE.Group();
  const pm = lam({ map: tex(grain('#2a1a12', '#120a05', 26), 1, 1) });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.18, 0.58), pm);
  body.position.set(0, 0.72, -0.12); piano.add(body);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.06, 0.64), pm);
  lid.position.set(0, 1.33, -0.10); piano.add(lid);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.07, 0.30), pm);
  shelf.position.set(0, 0.70, 0.20); piano.add(shelf);
  const kt = new THREE.CanvasTexture(keysTex()); kt.magFilter = THREE.NearestFilter;
  const keysM = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.26), new THREE.MeshBasicMaterial({ map: kt }));
  keysM.rotation.x = -Math.PI / 2; keysM.position.set(0, 0.742, 0.22); piano.add(keysM);
  [-0.66, 0.66].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.7, 0.14), pm);
    leg.position.set(x, 0.35, 0.16); piano.add(leg);
  });
  const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), lam({ color: 0xa8925f }));
  pedal.position.set(0, 0.10, 0.10); piano.add(pedal);
  put(piano, -W / 2 + 0.75, 0, 2.5, Math.PI / 2);
  boxes.push({ x: -W / 2 + 0.75, z: 2.5, w: 0.9, d: 1.7 });

  /* ピアノの上の一杯 */
  const pianoGlass = wineGlass(-W / 2 + 0.62, 1.36, 2.1, 1.15);

  const pl = gentleman(true);
  const pianist = pl.g;
  pianist.scale.setScalar(0.99);
  put(pianist, -W / 2 + 1.42, 0.30, 2.5, -Math.PI / 2);   // 腰かけている分、すこし高く
  /* 掛けている姿に */
  pl.parts.legL.rotation.x = -1.35; pl.parts.legL.position.set(-0.10, 0.62, 0.24);
  pl.parts.legR.rotation.x = -1.35; pl.parts.legR.position.set(0.10, 0.62, 0.24);
  pl.parts.armL.rotation.x = -0.95; pl.parts.armL.position.set(-0.285, 1.12, 0.20);
  pl.parts.armR.rotation.x = -0.95; pl.parts.armR.position.set(0.285, 1.12, 0.20);
  pl.parts.handL.position.set(-0.24, 0.94, 0.50);
  pl.parts.handR.position.set(0.24, 0.94, 0.50);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.30), oakMat);
  bench.position.set(-W / 2 + 1.42, 0.56, 2.5); bench.rotation.y = -Math.PI / 2; scene.add(bench);
  [-0.24, 0.24].forEach((d) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.56, 0.06), oakMat);
    l.position.set(-W / 2 + 1.42 + d, 0.28, 2.5); scene.add(l);
  });
  boxes.push({ x: -W / 2 + 1.42, z: 2.5, w: 0.8, d: 0.9 });
  const pglow = new THREE.PointLight(0xffb877, 2.6, 4.0, 1.6);
  pglow.position.set(-W / 2 + 1.1, 1.85, 2.5); scene.add(pglow);

  /* 見回しと歩き ------------------------------------------------ */
  let yaw = 0, pitch = -0.02;
  const keys: Record<string, boolean> = {};
  let locked = false, paused = false;
  let padX = 0, padY = 0, lookX = 0, lookY = 0;
  const el = renderer.domElement;

  const fire = () => { if (look.kind) { au.clink(); o.onUse(look.kind, look.id); } };

  const onKey = (e: KeyboardEvent, v: boolean) => {
    const k = e.key.toLowerCase();
    if (v) au.start();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys[k] = v;
      if (v && !paused) e.preventDefault();
    }
    if (v && !paused) {
      if (k === 'c') { au.clink(); o.onUse('clerk'); }
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

  /* ぶつからないように */
  function slide(nx: number, nz: number, x: number, z: number) {
    const r = 0.34;
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
  const clock = new THREE.Clock();

  function resize() {
    const w = o.mount.clientWidth || innerWidth, h = o.mount.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let first = true;
  function frame() {
    if (!alive) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const now = performance.now();

    /* 灯りのゆらぎ */
    flames.forEach((f, i) => {
      const k = 0.86 + Math.sin(now * 0.006 + i * 2.1) * 0.09 + Math.random() * 0.05;
      if (f.p) f.p.intensity = f.base * k;
      if (f.fl) f.fl.scale.set(1, k, 1);
    });

    /* 弾き手は拍に合わせて */
    const ph = au.phase();
    pl.parts.handL.position.y = 0.94 + Math.abs(Math.sin(ph * Math.PI)) * 0.035;
    pl.parts.handR.position.y = 0.94 + Math.abs(Math.cos(ph * Math.PI * 1.5)) * 0.045;
    pl.parts.head.rotation.z = Math.sin(ph * Math.PI * 0.5) * 0.10;
    pl.parts.torso.rotation.z = Math.sin(ph * Math.PI * 0.5 + 0.4) * 0.045;
    pianoGlass.rotation.y = now * 0.0004;

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

      /* 演奏は、ピアノに近いほどよく聞こえます */
      au.dist(Math.hypot(camera.position.x - (-W / 2 + 1.0), camera.position.z - 2.5));

      /* 扉のそば */
      if (camera.position.z < D / 2 - 2.25) armed = true;
      const nearDoor = armed && camera.position.z > D / 2 - 1.55 && Math.abs(camera.position.x) < 1.15;
      const was = doorOpen;
      doorOpen += ((nearDoor ? 1 : 0) - doorOpen) * Math.min(1, dt * 3.4);
      doorGroup.rotation.y = -doorOpen * 1.15;
      if (was < 0.06 && doorOpen >= 0.06) au.creak();
      if (nearDoor && doorOpen > 0.75 && !doorFired) { doorFired = true; o.onDoor(); }
      if (!nearDoor) doorFired = false;

      /* 帳場との隔たり */
      nearT += dt;
      if (nearT > 0.2) {
        nearT = 0;
        const nr = Math.hypot(camera.position.x, camera.position.z + 3.2) < 2.6;
        if (nr !== wasNear) { wasNear = nr; o.onNear(nr); }
      }

      /* 見ているもの */
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

      const dx2 = camera.position.x - clerk.position.x, dz2 = camera.position.z - clerk.position.z;
      clerk.rotation.y += (Math.atan2(dx2, dz2) - clerk.rotation.y) * Math.min(1, dt * 2.2);
      cl.parts.head.position.y = 1.665 + Math.sin(now * 0.0016) * 0.006;
    }
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
  };
}
