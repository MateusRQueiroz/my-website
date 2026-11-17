/*
 * Illustrated textures, painted once with Canvas 2D and reused every frame.
 * The look comes from layered brush passes (halo → body → ridge), inked dust
 * lanes, soft banding in the midtones, and a fine grain — not from per-pixel
 * shader work at runtime.
 */
export type RGB = [number, number, number];

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gauss = (r: () => number) => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

export function canvas(w: number, h = w) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return c;
}
const ctx2d = (c: HTMLCanvasElement) => c.getContext('2d')!;
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Soft round brush in one color; drawImage-scaled for fast painting. */
const brushCache = new Map<string, HTMLCanvasElement>();
function brush(color: RGB, soft = 0.55) {
  const key = `${color.join(',')}|${soft}`;
  let b = brushCache.get(key);
  if (b) return b;
  b = canvas(96);
  const g = ctx2d(b), grd = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  grd.addColorStop(0, rgba(color, 1));
  grd.addColorStop(Math.max(0.05, 0.5 - soft * 0.45), rgba(color, 0.7));
  grd.addColorStop(0.62, rgba(color, 0.18));
  grd.addColorStop(1, rgba(color, 0));
  g.fillStyle = grd; g.fillRect(0, 0, 96, 96);
  brushCache.set(key, b);
  return b;
}
function dab(g: CanvasRenderingContext2D, b: HTMLCanvasElement, x: number, y: number, r: number, a: number) {
  g.globalAlpha = a; g.drawImage(b, x - r, y - r, r * 2, r * 2);
}

/** Fine grain applied only where paint already exists. */
function grain(g: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number) {
  const tile = canvas(128), t = ctx2d(tile), img = t.createImageData(128, 128), r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  t.putImageData(img, 0, 0);
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = amount;
  g.fillStyle = g.createPattern(tile, 'repeat')!; g.fillRect(0, 0, w, h); g.restore();
}

/** Gentle banding: pulls midtones toward a few luminance steps for an illustrated, painted read. */
function band(g: CanvasRenderingContext2D, w: number, h: number, levels: number, strength: number) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    const L = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
    if (L < 0.02) continue;
    const q = Math.round(L * levels) / levels;
    const k = ((L + (q - L) * strength) / L);
    d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
  }
  g.putImageData(img, 0, 0);
}

const PALETTE = {
  core: [255, 242, 220] as RGB, gold: [247, 199, 128] as RGB, peach: [240, 165, 132] as RGB, rose: [222, 128, 162] as RGB,
  lilac: [172, 150, 232] as RGB, blue: [124, 152, 242] as RGB, ice: [214, 226, 255] as RGB, ink: [26, 18, 44] as RGB, pink: [255, 132, 178] as RGB,
};

/** Color of the arm paint by fraction of the radius: warm inside, cool outside. */
function armColor(f: number): RGB {
  if (f < 0.22) return mixRGB(PALETTE.gold, PALETTE.peach, f / 0.22);
  if (f < 0.45) return mixRGB(PALETTE.peach, PALETTE.lilac, (f - 0.22) / 0.23);
  return mixRGB(PALETTE.lilac, PALETTE.blue, Math.min(1, (f - 0.45) / 0.4));
}

/** Our galaxy, face on, for a disc in the XZ plane. */
export function paintGalaxy(size: number) {
  const c = canvas(size), g = ctx2d(c), r = rng(7), C = size / 2, R = size * 0.47;
  const pitch = 0.3, r0 = R * 0.05;
  const arms = [{ o: 0, w: 1, end: 1 }, { o: Math.PI, w: 1, end: 1 }, { o: Math.PI / 2 + 0.25, w: 0.5, end: 0.82 }, { o: (3 * Math.PI) / 2 + 0.25, w: 0.5, end: 0.82 }];
  const armPt = (o: number, rr: number, lateral = 0) => { const th = o + Math.log(rr / r0) / pitch + lateral / rr; return [C + rr * Math.cos(th), C + rr * Math.sin(th)] as const; };

  // 1. Disc light: a warm core fading through rose and violet to deep indigo.
  const base = g.createRadialGradient(C, C, 0, C, C, R);
  [[0, [255, 236, 206], 0.95], [0.05, [250, 214, 160], 0.8], [0.14, [236, 168, 140], 0.42], [0.3, [178, 120, 168], 0.2], [0.55, [96, 86, 170], 0.1], [0.82, [50, 46, 120], 0.05], [1, [30, 28, 80], 0]]
    .forEach(([s, col, a]) => base.addColorStop(s as number, rgba(col as RGB, a as number)));
  g.fillStyle = base; g.beginPath(); g.arc(C, C, R, 0, Math.PI * 2); g.fill();

  // 2–4. Arms in three passes: wide halo, body, and a bright ridge on the leading edge.
  for (const arm of arms) {
    for (const pass of [0, 1, 2]) {
      for (let rr = r0 * 1.6; rr < R * arm.end; ) {
        const f = rr / R;
        const width = R * (pass === 0 ? 0.05 + 0.11 * f : pass === 1 ? 0.022 + 0.05 * f : 0.008 + 0.017 * f);
        const col = pass === 2 ? mixRGB(armColor(f), PALETTE.ice, 0.65) : pass === 1 ? mixRGB(armColor(f), PALETTE.ice, 0.25) : armColor(f);
        const a = (pass === 0 ? 0.07 : pass === 1 ? 0.13 : 0.2) * arm.w * (1 - Math.pow(f / arm.end, 3) * 0.85);
        const lateral = (pass === 2 ? 0.35 : 0) * width * 2 + gauss(r) * width * (pass === 0 ? 0.25 : 0.45);
        const [x, y] = armPt(arm.o, rr, lateral);
        dab(g, brush(col, pass === 2 ? 0.2 : 0.6), x, y, width * (0.8 + r() * 0.45), a * (0.75 + r() * 0.5));
        rr += width * (pass === 2 ? 0.28 : 0.4);
      }
    }
  }

  // 5. Inked dust lanes on the trailing edge of the main arms, broken into strokes.
  g.lineCap = 'round';
  for (const arm of arms.filter(a => a.w === 1)) {
    let rr = r0 * 3;
    while (rr < R * 0.92) {
      const f = rr / R, len = R * (0.04 + r() * 0.09), off = -R * (0.028 + 0.05 * f);
      g.beginPath();
      for (let s = 0; s <= 12; s++) {
        const q = rr + (len * s) / 12;
        const [x, y] = armPt(arm.o, q, off + gauss(r) * R * 0.002);
        if (s === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.globalAlpha = 0.42 + r() * 0.3;
      g.strokeStyle = rgba(PALETTE.ink, 1);
      g.lineWidth = R * (0.004 + 0.011 * f) * (0.6 + r() * 0.8);
      g.stroke();
      // a soft dark shoulder under the crisp line
      for (let s = 0; s < 4; s++) {
        const [x, y] = armPt(arm.o, rr + (len * s) / 4, off * 1.15);
        dab(g, brush(PALETTE.ink), x, y, R * (0.018 + 0.02 * f), 0.16);
      }
      rr += len * (1.15 + r() * 0.9);
    }
  }

  // 6. Bulge and core, stacked from soft gold to a small bright heart.
  dab(g, brush(PALETTE.gold), C, C, R * 0.24, 0.55);
  dab(g, brush(PALETTE.peach), C, C, R * 0.16, 0.45);
  dab(g, brush(PALETTE.core), C, C, R * 0.08, 0.85);
  dab(g, brush([255, 252, 240]), C, C, R * 0.026, 0.95);

  // 7. Midtone banding for the illustrated read.
  g.globalAlpha = 1;
  band(g, size, size, 7, 0.32);

  // 8. Star-forming knots and young clusters along the leading edges.
  for (let i = 0; i < 150; i++) {
    const arm = arms[i % 4], rr = R * (0.16 + r() * (arm.end - 0.2));
    const f = rr / R, [x, y] = armPt(arm.o, rr, R * (0.012 + 0.03 * f) * (0.3 + r()));
    if (r() < 0.45) { dab(g, brush(PALETTE.pink), x, y, R * (0.006 + r() * 0.01), 0.5); dab(g, brush([255, 220, 236]), x, y, R * 0.0025, 0.8); }
    else { dab(g, brush(PALETTE.ice), x, y, R * (0.004 + r() * 0.006), 0.55); g.globalAlpha = 0.95; g.fillStyle = '#fff'; g.fillRect(x - 0.7, y - 0.7, 1.4, 1.4); }
  }
  // 9. Fine star speckle that follows the arms.
  for (let i = 0; i < size * 1.1; i++) {
    const arm = arms[i % 4], rr = R * Math.min(0.98, 0.05 + Math.abs(gauss(r)) * 0.42);
    const f = rr / R, [x, y] = armPt(arm.o, rr, gauss(r) * R * (0.03 + 0.05 * f));
    g.globalAlpha = 0.18 + r() * 0.4;
    g.fillStyle = r() < 0.7 ? '#eef2ff' : '#ffe9c4';
    const s = r() < 0.06 ? 1.6 : 1;
    g.fillRect(x, y, s, s);
  }

  // 10. Soft outer edge.
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'destination-in';
  const edge = g.createRadialGradient(C, C, R * 0.55, C, C, R * 1.02);
  edge.addColorStop(0, 'rgba(0,0,0,1)'); edge.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = edge; g.fillRect(0, 0, size, size);
  g.globalCompositeOperation = 'source-over';
  grain(g, size, size, 0.07, 11);
  return c;
}

/** A wide, soft copy of the galaxy used as its atmosphere. */
export function blurCopy(src: HTMLCanvasElement, size: number) {
  const tiny = canvas(Math.max(16, size / 16)), t = ctx2d(tiny);
  t.drawImage(src, 0, 0, tiny.width, tiny.height);
  const c = canvas(size), g = ctx2d(c);
  g.imageSmoothingQuality = 'high';
  g.drawImage(tiny, 0, 0, size, size);
  return c;
}

/**
 * Deep space, equirectangular. Only soft, low-frequency paint lives here: the
 * sky is magnified several times on screen, so stars are drawn as points instead.
 */
export function paintSky(w: number) {
  const h = w / 2, c = canvas(w, h), g = ctx2d(c), r = rng(3);
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, '#03040a'); v.addColorStop(0.38, '#070818'); v.addColorStop(0.55, '#0c0d26'); v.addColorStop(0.72, '#080a1c'); v.addColorStop(1, '#03040a');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  const wrap = (fn: (dx: number) => void) => { fn(0); fn(-w); fn(w); };
  // A few large, separate washes rather than an even haze, so the dark reads as depth.
  const washes: [RGB, number, number][] = [[[88, 64, 170], 0.1, 6], [[34, 92, 132], 0.07, 4], [[146, 64, 118], 0.06, 3], [[62, 80, 168], 0.08, 5]];
  for (const [col, a, n] of washes) for (let i = 0; i < n; i++) {
    const x = r() * w, y = h * (0.34 + gauss(r) * 0.13), rad = w * (0.06 + r() * 0.1);
    for (let k = 0; k < 5; k++) { // each wash is a cluster of dabs, for an uneven, painted edge
      const ox = x + gauss(r) * rad * 0.5, oy = y + gauss(r) * rad * 0.25, rr = rad * (0.4 + r() * 0.6);
      wrap(dx => dab(g, brush(col, 0.85), ox + dx, oy, rr, a * (0.5 + r() * 0.7)));
    }
  }
  for (let i = 0; i < 8; i++) { const x = r() * w, y = h * (0.36 + gauss(r) * 0.1); wrap(dx => dab(g, brush([2, 3, 8], 0.8), x + dx, y, w * (0.03 + r() * 0.05), 0.45)); }
  g.globalAlpha = 1;
  return c;
}

/** A small background galaxy: a spiral or a soft elliptical. */
export function paintMiniGalaxy(seed: number, kind: 'spiral' | 'elliptical', size = 256) {
  const c = canvas(size), g = ctx2d(c), r = rng(seed * 101), C = size / 2, R = size * 0.46;
  const warm = r() < 0.5, core: RGB = warm ? [255, 226, 186] : [232, 236, 255], arm: RGB = warm ? [214, 150, 170] : [130, 156, 236];
  if (kind === 'elliptical') {
    dab(g, brush(core, 0.8), C, C, R, 0.45); dab(g, brush(core), C, C, R * 0.4, 0.8); dab(g, brush([255, 255, 250]), C, C, R * 0.1, 1);
  } else {
    dab(g, brush(arm, 0.8), C, C, R * 0.9, 0.25);
    for (const o of [0, Math.PI]) for (let rr = R * 0.08; rr < R; rr += R * 0.02) {
      const th = o + Math.log(rr / (R * 0.05)) / 0.34 + seed;
      dab(g, brush(mixRGB(core, arm, rr / R)), C + rr * Math.cos(th), C + rr * Math.sin(th), R * (0.05 + 0.1 * rr / R), 0.22);
    }
    dab(g, brush(core), C, C, R * 0.22, 0.8); dab(g, brush([255, 255, 250]), C, C, R * 0.06, 1);
  }
  g.globalCompositeOperation = 'destination-in';
  const e = g.createRadialGradient(C, C, R * 0.4, C, C, R); e.addColorStop(0, '#000'); e.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = e; g.fillRect(0, 0, size, size);
  return c;
}

/** Painterly haze: overlapping soft dabs, lighter at the top edge like lit cloud. */
export function paintHaze(seed: number, size = 256) {
  const c = canvas(size), g = ctx2d(c), r = rng(seed * 31), C = size / 2;
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * size * 0.3;
    dab(g, brush([255, 255, 255], 0.85), C + Math.cos(a) * d, C + Math.sin(a) * d * 0.62, size * (0.08 + r() * 0.16), 0.12 + r() * 0.12);
  }
  g.globalCompositeOperation = 'destination-in';
  const e = g.createRadialGradient(C, C, size * 0.15, C, C, size * 0.5); e.addColorStop(0, '#000'); e.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = e; g.fillRect(0, 0, size, size);
  return c;
}

/** Soft rays from a point: thin wedges of varying length, softened by a downscale. */
export function paintRays(size = 512) {
  const sharp = canvas(size), g = ctx2d(sharp), r = rng(17), C = size / 2;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, w = 0.006 + r() * 0.02, len = size * (0.22 + r() * 0.28);
    const grd = g.createLinearGradient(C, C, C + Math.cos(a) * len, C + Math.sin(a) * len);
    grd.addColorStop(0, `rgba(255,236,206,${0.08 + r() * 0.1})`); grd.addColorStop(1, 'rgba(255,236,206,0)');
    g.fillStyle = grd; g.beginPath(); g.moveTo(C, C);
    g.lineTo(C + Math.cos(a - w) * len, C + Math.sin(a - w) * len); g.lineTo(C + Math.cos(a + w) * len, C + Math.sin(a + w) * len); g.fill();
  }
  const c = canvas(size), o = ctx2d(c), tiny = canvas(size / 2);
  ctx2d(tiny).drawImage(sharp, 0, 0, size / 2, size / 2);
  o.drawImage(tiny, 0, 0, size, size);
  return c;
}

/** A soft round glow with a thin ring, for destination markers and the core. */
export function paintGlow(size = 128, ring = false) {
  const c = canvas(size), g = ctx2d(c), C = size / 2;
  dab(g, brush([255, 255, 255], 0.9), C, C, C, 1);
  if (ring) { g.globalAlpha = 0.9; g.strokeStyle = '#fff'; g.lineWidth = size * 0.02; g.beginPath(); g.arc(C, C, C * 0.62, 0, Math.PI * 2); g.stroke(); }
  return c;
}
