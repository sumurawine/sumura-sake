'use client';

/**
 * バーチャル店舗の三次元の間取り。
 * 二〇〇〇年代初頭の家庭用ゲーム機ふうの、粗い画づくりでこしらえてあります。
 * three.js は網の上から借りてきて使いますので、荷物は増えません。
 */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export type Bottle = { id: string; name: string; price: string; prod: string; cat: string };

export type ShopHandle = {
  dispose: () => void;
  pause: (v: boolean) => void;
  lock: () => void;
  sound: (v: boolean) => void;
};

export type ShopOpts = {
  mount: HTMLElement;
  bottles: Bottle[];
  onLook: (kind: 'clerk' | 'bottle' | null, id?: string) => void;
  onUse: (kind: 'clerk' | 'bottle', id?: string) => void;
  onDoor: () => void;
  onReady: () => void;
};

/* ── 音 ─────────────────────────────────────────────
   足音も扉の軋みも、その場でこしらえます。音の荷物は持ちません。 */
function makeAudio() {
  let ctx: any = null;
  let bus: any = null;
  let noise: any = null;
  let room: any = null;
  let on = true;
  let foot = 0;

  const start = () => {
    if (ctx || typeof window === 'undefined') return;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    bus = ctx.createGain();
    bus.gain.value = on ? 0.9 : 0;
    bus.connect(ctx.destination);

    const n = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = n;

    /* 店内のしずかな空気 */
    const src = ctx.createBufferSource();
    src.buffer = n; src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 240;
    const g = ctx.createGain(); g.gain.value = 0.05;
    src.connect(lp); lp.connect(g); g.connect(bus); src.start();
    room = g;
  };

  const burst = (freq: number, q: number, vol: number, len: number, type = 'bandpass') => {
    if (!ctx || !noise) return;
    const s = ctx.createBufferSource();
    s.buffer = noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = type as any; f.frequency.value = freq; f.Q.value = q;
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
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = type as any;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + len);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + len + 0.02);
  };

  return {
    start,
    set(v: boolean) { on = v; if (bus) bus.gain.value = v ? 0.9 : 0; if (v) start(); },
    /* 板張りの床を踏む音。左右で音色を変えます */
    step(run: boolean) {
      foot ^= 1;
      burst(foot ? 640 : 480, 1.1, run ? 0.30 : 0.20, run ? 0.10 : 0.13);
      burst(foot ? 150 : 128, 2.2, run ? 0.22 : 0.15, 0.09);
    },
    creak() { tone(180, 96, 0.05, 0.55, 'sawtooth'); burst(900, 0.8, 0.05, 0.5); },
    chime() { tone(1180, 1180, 0.06, 0.16); setTimeout(() => tone(1580, 1580, 0.05, 0.30), 110); },
    clink() { tone(2400, 1900, 0.035, 0.09); },
    close() { try { ctx?.close(); } catch { /* しずかに */ } ctx = null; room = null; },
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

/** 瓶の肩に貼る、紙のラベル */
function labelTex(name: string, prod: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 80;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9e2d2'; g.fillRect(0, 0, 128, 80);
  g.strokeStyle = 'rgba(110,80,52,.6)'; g.lineWidth = 2;
  g.strokeRect(5, 5, 118, 70);
  g.fillStyle = '#3a2a1c';
  g.textAlign = 'center';
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

  const W = 13, D = 9, H = 3.2;          // 店内の幅・奥行・高さ
  const SKY = 0x120c0a;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.FogExp2(SKY, 0.052);

  const camera = new THREE.PerspectiveCamera(66, 1, 0.05, 60);
  camera.position.set(0, 1.62, D / 2 - 2.9);   // 扉からは、すこし離れた辺りから

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(0.62);                 // わざと粗く。あの頃の画の粒
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

  /* 床・壁・天井 ------------------------------------------------ */
  const floorMat = lam({ map: tex(grain('#4a3524', '#2a1b0e', 60), 10, 7) });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = lam({ map: tex(grain('#4b3a2f', '#31241c', 30), 6, 2) });
  const ceilMat = lam({ color: 0x241a14 });

  const wall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
  };
  wall(W, H, 0, H / 2, -D / 2, 0);
  wall(W, H, 0, H / 2, D / 2, Math.PI);
  wall(D, H, -W / 2, H / 2, 0, Math.PI / 2);
  wall(D, H, W / 2, H / 2, 0, -Math.PI / 2);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);

  /* 扉（入口） -------------------------------------------------- */
  const doorGroup = new THREE.Group();
  const doorMat = lam({ color: 0x3a2417 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.25, 0.07), doorMat);
  door.position.set(0.575, 1.125, 0);
  doorGroup.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), lam({ color: 0xd8bd8e }));
  knob.position.set(1.04, 1.1, 0.06); doorGroup.add(knob);
  doorGroup.position.set(-0.575, 0, D / 2 - 0.06);
  scene.add(doorGroup);

  /* 灯り（影は落としません。あの頃の作法で） -------------------- */
  scene.add(new THREE.AmbientLight(0xffe0be, 1.05));
  scene.add(new THREE.HemisphereLight(0xffd6a4, 0x2b1f18, 0.7));
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe6bc });
  const lamp = (x: number, z: number, inten: number, dist: number) => {
    const p = new THREE.PointLight(0xffd2a0, inten, dist, 1.6);
    p.position.set(x, H - 0.34, z); scene.add(p);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), lampMat);
    bulb.position.copy(p.position); scene.add(bulb);
  };
  lamp(-4.2, -2.4, 5.2, 8); lamp(0, -2.4, 5.2, 8); lamp(4.2, -2.4, 5.2, 8);
  lamp(-4.2, 1.6, 4.4, 7); lamp(4.2, 1.6, 4.4, 7);
  lamp(0, 2.6, 3.6, 7);

  /* 棚 ---------------------------------------------------------- */
  const woodMat = lam({ map: tex(grain('#3b2a1c', '#1f1409', 34), 3, 1) });
  const shelves: any[] = [];
  const boxes: Array<{ x: number; z: number; w: number; d: number }> = [];

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
    g.position.set(x, 0, z); g.rotation.y = rotY;
    scene.add(g); shelves.push(g);
    const sw = Math.abs(Math.cos(rotY)) * w + Math.abs(Math.sin(rotY)) * depth;
    const sd = Math.abs(Math.sin(rotY)) * w + Math.abs(Math.cos(rotY)) * depth;
    boxes.push({ x, z, w: sw, d: sd });
    return g;
  }

  const racks = [
    rack(-W / 2 + 0.3, -1.6, 5.4, Math.PI / 2),
    rack(W / 2 - 0.3, -1.6, 5.4, -Math.PI / 2),
    rack(-2.6, -D / 2 + 0.3, 4.4, 0),
    rack(2.6, -D / 2 + 0.3, 4.4, 0),
    rack(-3.9, 1.6, 3.0, Math.PI / 2),
    rack(3.9, 1.6, 3.0, -Math.PI / 2),
  ];

  /* 瓶（面の数はうんと控えめに） -------------------------------- */
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

  const pick: any[] = [];      // 触れる瓶
  const labelGeo = new THREE.PlaneGeometry(0.062, 0.04);

  function putBottle(parent: any, x: number, y: number, z: number, b?: Bottle) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bottleGeo, Math.random() > 0.45 ? glassA : glassB);
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 7), capMat);
    cap.position.y = 0.295; g.add(cap);
    if (b) {
      const t = new THREE.CanvasTexture(labelTex(b.name, b.prod));
      t.magFilter = THREE.NearestFilter;
      const lab = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ map: t }));
      lab.position.set(0, 0.088, 0.0395);
      g.add(lab);
      g.userData.bottle = b;
      pick.push(g);
    }
    g.position.set(x, y, z);
    g.rotation.y = Math.random() * 0.5 - 0.25;
    parent.add(g);
  }

  const list = o.bottles.slice();
  let bi = 0;
  racks.forEach((g, ri) => {
    const w = [5.4, 5.4, 4.4, 4.4, 3.0, 3.0][ri];
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

  /* 帳場と店員 -------------------------------------------------- */
  const counter = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.09, 0.72), woodMat);
  top.position.y = 1.02; counter.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.6), lam({ color: 0x2b1e15 }));
  front.position.y = 0.5; counter.add(front);
  counter.position.set(0, 0, -2.6);
  scene.add(counter);
  boxes.push({ x: 0, z: -2.6, w: 3.0, d: 0.72 });

  /* 燕尾の黒服に、七三分けの店員 */
  const clerk = new THREE.Group();
  const skin = lam({ color: 0xdcb493 });
  const black = lam({ color: 0x14100f });
  const white = lam({ color: 0xf0ece2 });
  const hairM = lam({ color: 0x1a120c });
  const box = (w: number, h: number, d: number, m: any, x: number, y: number, z: number, ry = 0) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z); b.rotation.y = ry; clerk.add(b); return b;
  };
  /* 靴と黒の細身の脚 */
  box(0.15, 0.07, 0.28, black, -0.10, 0.035, 0.03);
  box(0.15, 0.07, 0.28, black, 0.10, 0.035, 0.03);
  box(0.16, 0.80, 0.19, black, -0.10, 0.47, 0);
  box(0.16, 0.80, 0.19, black, 0.10, 0.47, 0);
  /* 上衣 */
  const jacket = box(0.46, 0.62, 0.27, black, 0, 1.16, 0);
  /* 白いシャツの胸元と、蝶ネクタイ */
  box(0.17, 0.44, 0.02, white, 0, 1.22, 0.136);
  box(0.055, 0.055, 0.03, black, 0, 1.16, 0.148);   // 前ボタン
  box(0.115, 0.05, 0.035, black, 0, 1.425, 0.142);  // 蝶ネクタイ
  /* 襟（拝絹の折り返し） */
  box(0.10, 0.34, 0.02, black, -0.11, 1.30, 0.142, 0.16);
  box(0.10, 0.34, 0.02, black, 0.11, 1.30, 0.142, -0.16);
  /* 胸の白い飾り布 */
  box(0.06, 0.025, 0.02, white, -0.155, 1.34, 0.139);
  /* 腕と手 */
  box(0.115, 0.56, 0.16, black, -0.285, 1.17, 0.01);
  box(0.115, 0.56, 0.16, black, 0.285, 1.17, 0.01);
  box(0.10, 0.10, 0.13, skin, -0.285, 0.845, 0.01);
  box(0.10, 0.10, 0.13, skin, 0.285, 0.845, 0.01);
  /* 首と、角ばった顔 */
  box(0.11, 0.09, 0.11, skin, 0, 1.50, 0);
  const head = box(0.215, 0.255, 0.205, skin, 0, 1.665, 0);
  box(0.032, 0.022, 0.02, black, -0.055, 1.705, 0.105);  // 眼
  box(0.032, 0.022, 0.02, black, 0.055, 1.705, 0.105);
  box(0.075, 0.018, 0.02, hairM, 0, 1.756, 0.104);       // 眉
  /* 七三分け。左三分、右七分、その間に分け目 */
  box(0.148, 0.075, 0.215, hairM, 0.036, 1.812, -0.004); // 七の側（すこし高く）
  box(0.058, 0.062, 0.212, hairM, -0.078, 1.806, -0.004); // 三の側
  box(0.215, 0.055, 0.075, hairM, 0, 1.775, -0.077);     // 後ろ髪
  box(0.14, 0.045, 0.03, hairM, 0.038, 1.775, 0.093);    // 前髪の流れ
  box(0.055, 0.032, 0.03, hairM, -0.078, 1.772, 0.093);
  clerk.position.set(0, 0, -3.45);
  clerk.userData.clerk = true;
  scene.add(clerk);
  pick.push(clerk);
  boxes.push({ x: 0, z: -3.45, w: 0.6, d: 0.6 });

  const halo = new THREE.PointLight(0xffcf9a, 3.4, 3.6, 1.6);
  halo.position.set(0, 1.75, -3.0); scene.add(halo);

  /* 見回しと歩き ------------------------------------------------ */
  let yaw = 0, pitch = -0.02;
  const keys: Record<string, boolean> = {};
  let locked = false, paused = false;
  const el = renderer.domElement;

  const onKey = (e: KeyboardEvent, v: boolean) => {
    const k = e.key.toLowerCase();
    if (v) au.start();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys[k] = v;
      if (v && !paused) e.preventDefault();
    }
    if (v && (k === 'e' || k === ' ') && look.kind && !paused) { au.clink(); o.onUse(look.kind, look.id); }
  };
  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  addEventListener('keydown', kd); addEventListener('keyup', ku);

  const onMove = (e: MouseEvent) => {
    if (!locked || paused) return;
    yaw -= e.movementX * 0.0022;
    pitch -= e.movementY * 0.0022;
    pitch = Math.max(-1.15, Math.min(1.05, pitch));
  };
  addEventListener('mousemove', onMove);
  const onLockChange = () => { locked = document.pointerLockElement === el; };
  document.addEventListener('pointerlockchange', onLockChange);

  const clickCanvas = () => {
    au.start();
    if (paused) return;
    if (!locked) { el.requestPointerLock?.(); return; }
    if (look.kind) { au.clink(); o.onUse(look.kind, look.id); }
  };
  el.addEventListener('click', clickCanvas);

  /* 携帯：左は歩く、右は見回す */
  const touch: Record<number, { x: number; y: number; move: boolean }> = {};
  let mv = { x: 0, y: 0 };
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
      if (s.move) { mv.x = Math.max(-1, Math.min(1, dx / 60)); mv.y = Math.max(-1, Math.min(1, dy / 60)); }
      else { yaw -= dx * 0.006; pitch = Math.max(-1.15, Math.min(1.05, pitch - dy * 0.006)); s.x = t.clientX; s.y = t.clientY; }
    }
    e.preventDefault();
  };
  const te = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      const s = touch[t.identifier];
      if (s?.move) mv = { x: 0, y: 0 };
      delete touch[t.identifier];
    }
  };
  el.addEventListener('touchstart', ts, { passive: true });
  el.addEventListener('touchmove', tm, { passive: false });
  el.addEventListener('touchend', te);
  el.addEventListener('touchcancel', te);

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

  /* 見ているもの */
  const ray = new THREE.Raycaster();
  const mid = new THREE.Vector2(0, 0);
  const look: { kind: 'clerk' | 'bottle' | null; id?: string } = { kind: null };
  let lookT = 0;

  let doorOpen = 0, doorFired = false, alive = true;
  let armed = false;           // 一度おくへ進むまで、扉は退店になりません
  let walked = 0;              // 足音の歩幅かせぎ
  let bob = 0;
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
    if (!paused) {
      camera.rotation.set(pitch, yaw, 0, 'YXZ');

      let fwd = 0, side = 0;
      if (keys['w'] || keys['arrowup']) fwd += 1;
      if (keys['s'] || keys['arrowdown']) fwd -= 1;
      if (keys['a'] || keys['arrowleft']) side -= 1;
      if (keys['d'] || keys['arrowright']) side += 1;
      fwd -= mv.y; side += mv.x;
      const run = !!keys['shift'];
      const sp = (run ? 3.0 : 1.85) * dt;
      if (fwd || side) {
        const len = Math.hypot(fwd, side) || 1;
        const dx = (Math.sin(yaw) * -fwd + Math.cos(yaw) * side) / len * sp;
        const dz = (Math.cos(yaw) * -fwd - Math.sin(yaw) * side) / len * sp;
        const px = camera.position.x, pz = camera.position.z;
        const [nx, nz] = slide(px + dx, pz + dz, px, pz);
        camera.position.x = nx; camera.position.z = nz;
        const gone = Math.hypot(nx - px, nz - pz);
        walked += gone;
        bob += gone * 4.6;
        camera.position.y = 1.62 + Math.sin(bob) * 0.022;
        if (walked > (run ? 0.78 : 0.62)) { walked = 0; au.step(run); }
      } else if (walked) {
        walked = 0;
        camera.position.y += (1.62 - camera.position.y) * Math.min(1, dt * 8);
      }

      /* 扉のそば */
      if (camera.position.z < D / 2 - 2.25) armed = true;
      const nearDoor = armed && camera.position.z > D / 2 - 1.55 && Math.abs(camera.position.x) < 1.15;
      const was = doorOpen;
      doorOpen += ((nearDoor ? 1 : 0) - doorOpen) * Math.min(1, dt * 3.4);
      doorGroup.rotation.y = -doorOpen * 1.15;
      if (was < 0.06 && doorOpen >= 0.06) au.creak();
      if (nearDoor && doorOpen > 0.75 && !doorFired) { doorFired = true; o.onDoor(); }
      if (!nearDoor) doorFired = false;

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

      /* 店員はこちらを向きます */
      const dx2 = camera.position.x - clerk.position.x, dz2 = camera.position.z - clerk.position.z;
      clerk.rotation.y += (Math.atan2(dx2, dz2) - clerk.rotation.y) * Math.min(1, dt * 2.2);
      head.position.y = 1.665 + Math.sin(performance.now() * 0.0016) * 0.006;
      jacket.scale.y = 1 + Math.sin(performance.now() * 0.0021) * 0.006;
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
      mv = { x: 0, y: 0 };
    },
    lock() { au.start(); el.requestPointerLock?.(); },
    sound(v: boolean) { au.set(v); },
  };
}
