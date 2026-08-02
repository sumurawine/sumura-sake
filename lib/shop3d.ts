'use client';

/**
 * バーチャル店舗の三次元の間取り。
 * three.js は網の上から借りてきて使いますので、荷物は増えません。
 */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export type Bottle = { id: string; name: string; price: string; prod: string; cat: string };

export type ShopHandle = {
  dispose: () => void;
  pause: (v: boolean) => void;
  lock: () => void;
};

export type ShopOpts = {
  mount: HTMLElement;
  bottles: Bottle[];
  onLook: (kind: 'clerk' | 'bottle' | null, id?: string) => void;
  onUse: (kind: 'clerk' | 'bottle', id?: string) => void;
  onDoor: () => void;
  onReady: () => void;
};

/** 木や漆喰の肌合いを、その場で描いて作ります */
function grain(base: string, line: string, n = 90): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = line; g.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = 0.04 + Math.random() * 0.10;
    g.beginPath();
    const y = Math.random() * 256;
    g.moveTo(0, y);
    g.bezierCurveTo(80, y + (Math.random() * 8 - 4), 170, y + (Math.random() * 8 - 4), 256, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}

/** 瓶の肩に貼る、紙のラベル */
function labelTex(name: string, prod: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const g = c.getContext('2d')!;
  g.fillStyle = '#efe9dc'; g.fillRect(0, 0, 256, 160);
  g.strokeStyle = 'rgba(120,90,60,.55)'; g.lineWidth = 2;
  g.strokeRect(9, 9, 238, 142);
  g.fillStyle = '#3a2a1c';
  g.textAlign = 'center';
  g.font = '600 15px "Shippori Mincho","Hiragino Mincho ProN",serif';
  const words = String(prod || '').slice(0, 22);
  g.fillText(words, 128, 44);
  g.font = '13px "Shippori Mincho","Hiragino Mincho ProN",serif';
  const t = String(name || '').replace(/\s*\/.*$/, '').slice(0, 46);
  const lines: string[] = [];
  for (let i = 0; i < t.length; i += 15) lines.push(t.slice(i, i + 15));
  lines.slice(0, 4).forEach((l, i) => g.fillText(l, 128, 78 + i * 19));
  return c;
}

export async function createShop(o: ShopOpts): Promise<ShopHandle> {
  const THREE: any = await (new Function('u', 'return import(u)'))(THREE_URL);

  const W = 13, D = 9, H = 3.2;          // 店内の幅・奥行・高さ
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0a09);
  scene.fog = new THREE.FogExp2(0x0d0a09, 0.030);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 60);
  camera.position.set(0, 1.62, D / 2 - 1.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  o.mount.appendChild(renderer.domElement);

  const tex = (c: HTMLCanvasElement, rx: number, ry: number) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  /* 床・壁・天井 ------------------------------------------------ */
  const floorMat = new THREE.MeshStandardMaterial({
    map: tex(grain('#3a2a1d', '#241709', 130), 8, 6), roughness: 0.62, metalness: 0.04,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    map: tex(grain('#3a2b23', '#241a15', 60), 4, 2), roughness: 0.95, metalness: 0,
  });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x1b1310, roughness: 1 });

  const wall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m); return m;
  };
  wall(W, H, 0, H / 2, -D / 2, 0);
  wall(W, H, 0, H / 2, D / 2, Math.PI);
  wall(D, H, -W / 2, H / 2, 0, Math.PI / 2);
  wall(D, H, W / 2, H / 2, 0, -Math.PI / 2);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);

  /* 扉（入口） -------------------------------------------------- */
  const doorGroup = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.5, metalness: 0.12 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.25, 0.07), doorMat);
  door.position.set(0.575, 1.125, 0);
  doorGroup.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xc9ad82, roughness: 0.25, metalness: 0.9 }));
  knob.position.set(1.04, 1.1, 0.06); doorGroup.add(knob);
  doorGroup.position.set(-0.575, 0, D / 2 - 0.06);
  scene.add(doorGroup);

  /* 灯り -------------------------------------------------------- */
  scene.add(new THREE.AmbientLight(0xffe6c8, 0.62));
  scene.add(new THREE.HemisphereLight(0xffd9a8, 0x241a15, 0.55));
  const spots: any[] = [];
  const spot = (x: number, z: number, inten: number, cast: boolean) => {
    const s = new THREE.SpotLight(0xffd9a2, inten, 11, Math.PI / 5.2, 0.55, 1.4);
    s.position.set(x, H - 0.12, z);
    s.target.position.set(x, 0, z);
    if (cast) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0012; }
    scene.add(s); scene.add(s.target); spots.push(s);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe3b8 }));
    bulb.position.copy(s.position); scene.add(bulb);
  };
  spot(-4.2, -2.4, 24, true); spot(0, -2.4, 24, true); spot(4.2, -2.4, 24, true);
  spot(-4.2, 1.6, 20, false); spot(4.2, 1.6, 20, false);
  spot(0, 2.6, 16, false);
  const warm = new THREE.PointLight(0xffb066, 14, 8, 1.5);
  warm.position.set(0, 1.9, -2.0); scene.add(warm);

  /* 棚 ---------------------------------------------------------- */
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex(grain('#2c1f16', '#171009', 80), 2, 1), roughness: 0.68, metalness: 0.05,
  });
  const shelves: any[] = [];
  const boxes: Array<{ x: number; z: number; w: number; d: number }> = [];

  function rack(x: number, z: number, w: number, rotY: number) {
    const g = new THREE.Group();
    const depth = 0.42, hh = 2.05;
    const side = (sx: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, hh, depth), woodMat);
      m.position.set(sx, hh / 2, 0); m.castShadow = true; g.add(m);
    };
    side(-w / 2); side(w / 2);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.04), woodMat);
    back.position.set(0, hh / 2, -depth / 2); g.add(back);
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, depth), woodMat);
      b.position.set(0, 0.30 + i * 0.42, 0); b.castShadow = true; b.receiveShadow = true; g.add(b);
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
    rack(-2.2, 1.2, 4.0, Math.PI),
    rack(2.2, 1.2, 4.0, Math.PI),
  ];

  /* 瓶 ---------------------------------------------------------- */
  const bottleGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.000, 0.00), new THREE.Vector2(0.038, 0.00), new THREE.Vector2(0.039, 0.02),
      new THREE.Vector2(0.039, 0.135), new THREE.Vector2(0.036, 0.155), new THREE.Vector2(0.019, 0.185),
      new THREE.Vector2(0.0135, 0.21), new THREE.Vector2(0.0135, 0.275), new THREE.Vector2(0.017, 0.285),
      new THREE.Vector2(0.017, 0.30),
    ], 18
  );
  const glassA = new THREE.MeshPhysicalMaterial({
    color: 0x1a2a16, roughness: 0.18, metalness: 0.0, transmission: 0.35,
    thickness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.2,
  });
  const glassB = new THREE.MeshPhysicalMaterial({
    color: 0x3a1418, roughness: 0.2, metalness: 0.0, transmission: 0.30,
    thickness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.22,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x7a1226, roughness: 0.45, metalness: 0.35 });

  const pick: any[] = [];      // 触れる瓶
  const labelGeo = new THREE.PlaneGeometry(0.062, 0.04);

  function putBottle(parent: any, x: number, y: number, z: number, b?: Bottle) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bottleGeo, Math.random() > 0.45 ? glassA : glassB);
    body.castShadow = true;
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 12), capMat);
    cap.position.y = 0.295; g.add(cap);
    if (b) {
      const m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(labelTex(b.name, b.prod)), toneMapped: false });
      const lab = new THREE.Mesh(labelGeo, m);
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
    const w = [5.4, 5.4, 4.4, 4.4, 4.0, 4.0][ri];
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
  top.position.y = 1.02; top.castShadow = true; top.receiveShadow = true; counter.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1e150f, roughness: 0.8 }));
  front.position.y = 0.5; counter.add(front);
  counter.position.set(0, 0, -2.6);
  scene.add(counter);
  boxes.push({ x: 0, z: -2.6, w: 3.0, d: 0.72 });

  const clerk = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xe6c6a8, roughness: 0.8 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x241a15, roughness: 0.9 });
  const apron = new THREE.MeshStandardMaterial({ color: 0x6f4a34, roughness: 0.85 });
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.86, 14), cloth);
  legs.position.y = 0.43; legs.castShadow = true; clerk.add(legs);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.20, 0.66, 16), cloth);
  torso.position.y = 1.18; torso.castShadow = true; clerk.add(torso);
  const ap = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.86, 0.05), apron);
  ap.position.set(0, 1.02, 0.20); clerk.add(ap);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.10, 10), skin);
  neck.position.y = 1.55; clerk.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 16), skin);
  head.position.y = 1.70; head.castShadow = true; clerk.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.142, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.95 }));
  hair.position.y = 1.715; clerk.add(hair);
  clerk.position.set(0, 0, -3.45);
  clerk.userData.clerk = true;
  scene.add(clerk);
  pick.push(clerk);
  boxes.push({ x: 0, z: -3.45, w: 0.6, d: 0.6 });

  const halo = new THREE.PointLight(0xffcf9a, 5.2, 3.6, 2);
  halo.position.set(0, 1.75, -3.0); scene.add(halo);

  /* 見回しと歩き ------------------------------------------------ */
  let yaw = 0, pitch = -0.02;
  const keys: Record<string, boolean> = {};
  let locked = false, paused = false;
  const el = renderer.domElement;

  const onKey = (e: KeyboardEvent, v: boolean) => {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys[k] = v;
      if (v && !paused) e.preventDefault();
    }
    if (v && (k === 'e' || k === ' ') && look.kind && !paused) o.onUse(look.kind, look.id);
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
    if (paused) return;
    if (!locked) { el.requestPointerLock?.(); return; }
    if (look.kind) o.onUse(look.kind, look.id);
  };
  el.addEventListener('click', clickCanvas);

  /* 携帯：左は歩く、右は見回す */
  const touch: Record<number, { x: number; y: number; move: boolean }> = {};
  let mv = { x: 0, y: 0 };
  const ts = (e: TouchEvent) => {
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
      const sp = (keys['shift'] ? 3.0 : 1.85) * dt;
      if (fwd || side) {
        const len = Math.hypot(fwd, side) || 1;
        const dx = (Math.sin(yaw) * -fwd + Math.cos(yaw) * side) / len * sp;
        const dz = (Math.cos(yaw) * -fwd - Math.sin(yaw) * side) / len * sp;
        const [nx, nz] = slide(camera.position.x + dx, camera.position.z + dz, camera.position.x, camera.position.z);
        camera.position.x = nx; camera.position.z = nz;
        camera.position.y = 1.62 + Math.sin(performance.now() * 0.008) * 0.012;
      }

      /* 扉のそば */
      const nearDoor = camera.position.z > D / 2 - 1.9 && Math.abs(camera.position.x) < 1.2;
      doorOpen += ((nearDoor ? 1 : 0) - doorOpen) * Math.min(1, dt * 3.4);
      doorGroup.rotation.y = -doorOpen * 1.15;
      if (nearDoor && doorOpen > 0.75 && !doorFired && !first) { doorFired = true; o.onDoor(); }
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
      head.position.y = 1.70 + Math.sin(performance.now() * 0.0016) * 0.006;
    }
    renderer.render(scene, camera);
    if (first) { first = false; o.onReady(); }
  }
  frame();

  return {
    dispose() {
      alive = false;
      removeEventListener('keydown', kd); removeEventListener('keyup', ku);
      removeEventListener('mousemove', onMove); removeEventListener('resize', resize);
      document.removeEventListener('pointerlockchange', onLockChange);
      el.removeEventListener('click', clickCanvas);
      el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm);
      el.removeEventListener('touchend', te); el.removeEventListener('touchcancel', te);
      try { document.exitPointerLock?.(); } catch {}
      renderer.dispose();
      el.remove();
    },
    pause(v: boolean) {
      paused = v;
      if (v) { try { document.exitPointerLock?.(); } catch {} }
      for (const k in keys) keys[k] = false;
      mv = { x: 0, y: 0 };
    },
    lock() { el.requestPointerLock?.(); },
  };
}
