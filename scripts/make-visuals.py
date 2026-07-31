#!/usr/bin/env python3
"""2020年代版の背景ビジュアルを生成します（ビルド時に実行）。"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'modern')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def fbm(h, w, octaves=6, base=4, gain=0.5, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w)); amp = 1.0; tot = 0.0
    for o in range(octaves):
        gh = max(2, base << o)
        gw = max(2, int(base * (w / h)) << o)
        g = r.random((gh, gw))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(im, dtype=float) / 255.0)
        tot += amp; amp *= gain
    return out / tot


def shade(height, light, strength):
    gy, gx = np.gradient(height)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(height)
    n = np.sqrt(nx * nx + ny * ny + nz * nz)
    lx, ly, lz = light
    ln = (lx * lx + ly * ly + lz * lz) ** 0.5
    return np.clip((nx * lx + ny * ly + nz * lz) / (n * ln), 0, 1)


def falloff(h, w, cx, cy, rx, ry, p=2.0):
    yy, xx = np.mgrid[0:h, 0:w]
    d = (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) ** 0.5
    return np.clip(1 - d, 0, 1) ** p


def save(a, name, q=86):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
    im.save(os.path.join(OUT, name), quality=q, optimize=True)
    print('  ', name, im.size)


def build(H, W, seed, octaves, base, gain, light, strength, layers, vig, noise=2.8):
    tex = fbm(H, W, octaves=octaves, base=base, gain=gain, seed=seed)
    fine = fbm(H, W, octaves=4, base=36, gain=0.5, seed=seed + 100)
    lam = shade(tex * 0.86 + fine * 0.14, light, strength)
    img = np.zeros((H, W, 3), dtype=float)
    for kind, args in layers:
        if kind == 'amb':
            img += np.array(args, dtype=float)[None, None, :] * np.ones((H, W, 1))
        elif kind == 'lit':
            cx, cy, rx, ry, p, color, k = args
            img += (lam * falloff(H, W, W * cx, H * cy, W * rx, H * ry, p))[..., None] * np.array(color, dtype=float) * k
        elif kind == 'glow':
            cx, cy, rx, ry, p, color, k = args
            img += (falloff(H, W, W * cx, H * cy, W * rx, H * ry, p) ** 3)[..., None] * np.array(color, dtype=float) * k
    img += rng.normal(0, noise, (H, W, 1))
    v = falloff(H, W, W * 0.5, H * 0.5, W * vig[0], H * vig[1], vig[2])
    img *= (vig[3] + (1 - vig[3]) * v)[..., None]
    return img


print('背景ビジュアルを生成します')

save(build(1250, 2000, 3, 7, 3, 0.55, (-0.6, -0.75, 0.42), 3.2, [
    ('amb', (13, 11, 11)),
    ('lit', (0.30, 0.28, 0.85, 1.05, 2.1, (214, 168, 104), 0.95)),
    ('lit', (0.86, 0.90, 0.55, 0.60, 2.8, (104, 20, 34), 0.55)),
    ('glow', (0.30, 0.28, 0.85, 1.05, 2.1, (214, 168, 104), 0.28)),
], (0.78, 0.86, 1.1, 0.30), 3.2), 'hero.jpg', 88)

save(build(1100, 1800, 21, 6, 3, 0.62, (-0.2, -0.9, 0.35), 5.5, [
    ('amb', (10, 6, 8)),
    ('lit', (0.62, 0.34, 0.30, 1.20, 1.6, (150, 26, 46), 1.05)),
    ('glow', (0.62, 0.34, 0.30, 1.20, 1.6, (228, 176, 128), 0.30)),
], (0.80, 0.88, 1.2, 0.26)), 'veil-wine.jpg')

save(build(1100, 1800, 33, 7, 4, 0.50, (0.0, -0.9, 0.5), 2.6, [
    ('amb', (8, 8, 9)),
    ('lit', (0.52, 0.40, 0.34, 0.42, 2.6, (196, 148, 88), 0.90)),
    ('lit', (0.50, 0.50, 1.20, 1.20, 1.0, (36, 40, 48), 0.10)),
    ('glow', (0.52, 0.40, 0.34, 0.42, 2.6, (240, 198, 130), 0.35)),
], (0.72, 0.80, 1.15, 0.18)), 'veil-cellar.jpg')

save(build(1100, 1800, 51, 6, 3, 0.55, (-0.7, -0.5, 0.6), 2.0, [
    ('amb', (13, 13, 14)),
    ('lit', (0.78, 0.10, 1.00, 1.20, 1.7, (96, 92, 92), 0.80)),
    ('lit', (0.50, 0.50, 1.20, 1.20, 1.0, (70, 34, 30), 0.12)),
], (0.85, 0.90, 1.1, 0.28)), 'veil-ash.jpg')

print('完了')
