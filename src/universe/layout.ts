/*
 * Scene geometry, camera shots, and journey timing for the universe.
 * Pure math (no Three.js) so HTML labels and the still fallback can use it
 * before, or without, the WebGL chunk.
 */
export type Vec3 = [number, number, number];
export type DestinationId = 'about' | 'projects' | 'experience' | 'contact';
export type ShotId = 'universe' | 'galaxy' | DestinationId;
export interface Shot { pos: Vec3; target: Vec3; fov: number }

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => scale(a, 1 / (Math.hypot(...a) || 1));
const UP: Vec3 = [0, 1, 0];
const rad = (d: number) => (d * Math.PI) / 180;

/** The galaxy is a disc of this radius in the XZ plane, centered at the origin. */
export const GALAXY_RADIUS = 10;

/** Vertical FOV that keeps at least `minH` degrees across in portrait. */
function vfov(aspect: number, base: number, minH: number) {
  const h = (2 * Math.atan(Math.tan(rad(base) / 2) * aspect) * 180) / Math.PI;
  return h >= minH ? base : Math.min(70, (2 * Math.atan(Math.tan(rad(minH) / 2) / aspect) * 180) / Math.PI);
}

/** A camera at `dist` from `target`, raised `elev` degrees and turned `az` degrees around Y. */
export function orbit(target: Vec3, dist: number, elev: number, az: number): Vec3 {
  return [target[0] + dist * Math.cos(rad(elev)) * Math.sin(rad(az)), target[1] + dist * Math.sin(rad(elev)), target[2] + dist * Math.cos(rad(elev)) * Math.cos(rad(az))];
}

/** Camera basis that matches THREE.PerspectiveCamera.lookAt with up = +Y. */
function basis(shot: Shot) {
  const f = norm(sub(shot.target, shot.pos));
  const r = norm(cross(f, UP));
  return { f, r, u: cross(r, f) };
}

export function project(shot: Shot, p: Vec3, width: number, height: number) {
  const { f, r, u } = basis(shot);
  const rel = sub(p, shot.pos);
  const z = dot(rel, f);
  const ty = Math.tan(rad(shot.fov) / 2), aspect = width / height;
  return { x: ((dot(rel, r) / (z * ty * aspect)) + 1) / 2 * width, y: (1 - dot(rel, u) / (z * ty)) / 2 * height, visible: z > 0.05 };
}

/** Where the ray through NDC (nx, ny) meets the horizontal plane y = h. */
function unproject(shot: Shot, nx: number, ny: number, aspect: number, h: number): Vec3 {
  const { f, r, u } = basis(shot);
  const ty = Math.tan(rad(shot.fov) / 2);
  const d = norm(add(add(f, scale(r, nx * ty * aspect)), scale(u, ny * ty)));
  const t = (h - shot.pos[1]) / d[1];
  return add(shot.pos, scale(d, t));
}

/** Universe: our galaxy small and central, framed with room for the astronaut. */
function universeShot(aspect: number): Shot {
  const portrait = aspect < 0.9;
  const fov = vfov(aspect, 30, 44);
  // Phones: closer, and aimed below the galaxy so it sits in the upper third above the astronaut.
  return { pos: orbit([0, 0, 0], portrait ? 42 : 74, 31, -10), target: portrait ? [0, -6.5, 0] : [-3.6, 1.4, 0], fov };
}

/** Galaxy overview: close enough to fill the frame, tilted so the disc reads as a place. */
function galaxyShot(aspect: number): Shot {
  const portrait = aspect < 0.9;
  const fov = vfov(aspect, 42, 54);
  const target: Vec3 = [0.4, 0, portrait ? 0.4 : 1.1];
  return { pos: orbit(target, portrait ? 27 : 21, 54, 20), target, fov };
}

/** Where each destination sits on screen in the overview, in NDC. Leaves the core and the lower-left panel clear. */
const DEST_NDC: Record<'wide' | 'tall', Record<DestinationId, [number, number]>> = {
  wide: { about: [-0.5, 0.3], projects: [-0.2, -0.34], experience: [0.42, 0.4], contact: [0.55, -0.22] },
  tall: { about: [-0.42, 0.5], projects: [0.42, 0.3], experience: [-0.42, 0.02], contact: [0.42, -0.18] },
};
export const DESTINATION_ORDER: DestinationId[] = ['about', 'projects', 'experience', 'contact'];

export function destinationPoints(aspect: number): Record<DestinationId, Vec3> {
  const shot = galaxyShot(aspect);
  const set = DEST_NDC[aspect < 0.9 ? 'tall' : 'wide'];
  return Object.fromEntries(DESTINATION_ORDER.map(id => [id, unproject(shot, set[id][0], set[id][1], aspect, 0.35)])) as Record<DestinationId, Vec3>;
}

/** Destination close-ups: the marker sits in the upper part of the frame, above the page content. */
function destinationShot(id: DestinationId, aspect: number): Shot {
  const portrait = aspect < 0.9;
  const m = destinationPoints(aspect)[id];
  const g = galaxyShot(aspect);
  const back = norm([g.pos[0] - m[0], 0, g.pos[2] - m[2]]);
  const pos = add(add(m, scale(back, 6.5)), [0, 4.2, 0]);
  const fov = vfov(aspect, 40, 52);
  const shot: Shot = { pos, target: m, fov };
  // Shift the aim so the marker lands upper-right (desktop) or upper-center (phones).
  const { r, u } = basis(shot);
  const dist = Math.hypot(...sub(m, pos)), ty = Math.tan(rad(fov) / 2) * dist;
  const sx = portrait ? 0 : 0.42, sy = portrait ? 0.5 : 0.42;
  return { pos, target: sub(sub(m, scale(r, sx * ty * aspect)), scale(u, sy * ty)), fov };
}

export function shotFor(id: ShotId, aspect: number): Shot {
  if (id === 'universe') return universeShot(aspect);
  if (id === 'galaxy') return galaxyShot(aspect);
  return destinationShot(id, aspect);
}

/** Screen ellipse that covers the central galaxy in the universe shot (for the hit target). */
export function galaxyFootprint(width: number, height: number) {
  const s = universeShot(width / height);
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    return project(s, [Math.cos(a) * GALAXY_RADIUS * 0.95, 0, Math.sin(a) * GALAXY_RADIUS * 0.95], width, height);
  });
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const c = project(s, [0, 0, 0], width, height);
  return { cx: c.x, cy: c.y, left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

/* -------------------------------------------------------------- motion */

/** CSS-style cubic-bezier easing, solved numerically. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t, Y = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; }
    t = Math.min(1, Math.max(0, t));
    return Y(t);
  };
}
/** The entrance: a slow, deliberate start, a steady approach, and a long, soft landing. */
export const journeyEase = bezier(0.5, 0, 0.1, 1);
/** Destination glides: an unhurried departure and a long, gentle settle. */
export const glideEase = bezier(0.42, 0, 0.08, 1);

/** Timeline of the first entrance, in milliseconds from the moment the galaxy is selected. */
export const INTRO = {
  travel: 12000,
  beats: [
    { in: 1300, out: 4700 },
    { in: 5500, out: 9100 },
  ],
  title: { in: 9700, out: 12900 },
  done: 13500,
};
export const SHORT_TRAVEL = 3400;

/** Destination sequences: how long the selection holds before the camera moves, and travel times. */
export const COURSE = { aimFromGalaxy: 750, aimFromSection: 500, aimFromUniverse: 350, travel: 2400 };

export function durationFor(from: ShotId, to: ShotId) {
  if (from === 'universe' || to === 'universe') return 3000;
  if (from === 'galaxy' || to === 'galaxy') return 2400;
  return 2300;
}

/**
 * Faint engraved constellation figures in the sky around the opening view
 * (star chart, not astronomy): each is a list of star offsets in screen units
 * at its depth, joined in order.
 */
export function skyConstellations(): Vec3[][] {
  const s = universeShot(16 / 9);
  const { f, r, u } = basis(s);
  const at = (depth: number, x: number, y: number) => add(add(add(s.pos, scale(f, depth)), scale(r, x * depth)), scale(u, y * depth));
  const figure = (depth: number, ox: number, oy: number, pts: [number, number][]) => pts.map(([x, y]) => at(depth, ox + x * 0.03, oy + y * 0.03));
  return [
    figure(300, 0.34, 0.24, [[0, 0], [1.2, 0.6], [2.4, 0.3], [3.1, 1.4], [2.2, 2.3]]),      // a lyre
    figure(300, -0.46, 0.3, [[0, 0], [0.9, -0.8], [2, -0.6], [2.6, 0.4], [1.6, 1.1], [0.9, -0.8]]),
    figure(300, 0.44, -0.2, [[0, 0], [0.8, 1], [1.9, 1.2], [2.6, 0.2], [3.6, 0.5]]),
    figure(300, -0.12, 0.36, [[0, 0], [1, 0.4], [2.1, 0], [3.2, 0.5]]),
  ];
}

/* ------------------------------------------------------------- poses */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function spherical(s: Shot) {
  const d = sub(s.pos, s.target), dist = Math.hypot(...d);
  return { dist, elev: (Math.asin(d[1] / dist) * 180) / Math.PI, az: (Math.atan2(d[0], d[2]) * 180) / Math.PI };
}

/**
 * Long moves (to or from the universe) travel on a spherical arc around the
 * aim point: distance shrinks logarithmically so the approach feels even, and
 * a gentle sideways swoop keeps it from feeling like a zoom.
 */
export function arcPose(a: Shot, b: Shot, s: number, swoop = 10): Shot {
  const A = spherical(a), B = spherical(b);
  let daz = B.az - A.az; if (daz > 180) daz -= 360; if (daz < -180) daz += 360;
  const target = lerp3(a.target, b.target, s);
  const dist = Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), s));
  const elev = lerp(A.elev, B.elev, s * s * (3 - 2 * s));
  const az = A.az + daz * s + Math.sin(Math.PI * s) * swoop;
  return { pos: orbit(target, dist, elev, az), target, fov: lerp(a.fov, b.fov, s) };
}

/** Short moves across the galaxy: a lifted curve between two poses. */
export function glidePose(a: Shot, b: Shot, s: number): Shot {
  const lift = Math.hypot(...sub(a.pos, b.pos)) * 0.18;
  const mid: Vec3 = add(lerp3(a.pos, b.pos, 0.5), [0, lift, 0]);
  const p = add(add(scale(a.pos, (1 - s) ** 2), scale(mid, 2 * (1 - s) * s)), scale(b.pos, s * s));
  return { pos: p, target: lerp3(a.target, b.target, s), fov: lerp(a.fov, b.fov, s) };
}

/* --------------------------------------------------------- background */
export interface DistantGalaxy { pos: Vec3; size: number; tilt: Vec3; kind: 'spiral' | 'elliptical'; seed: number }

/**
 * A few small galaxies far behind ours, placed in the universe camera's view
 * (offsets are in screen-right / screen-up units at their depth).
 */
export function distantGalaxies(): DistantGalaxy[] {
  const s = universeShot(16 / 9);
  const { f, r, u } = basis(s);
  const at = (depth: number, x: number, y: number) => add(add(add(s.pos, scale(f, depth)), scale(r, x * depth)), scale(u, y * depth));
  return [
    { pos: at(260, -0.36, 0.16), size: 9, tilt: [0.4, 0.8, 0.3], kind: 'spiral', seed: 1 },
    { pos: at(320, 0.31, 0.2), size: 7.5, tilt: [0.15, 0.9, 0.55], kind: 'spiral', seed: 2 },
    { pos: at(300, -0.22, -0.2), size: 5.5, tilt: [0.8, 0.4, 0.4], kind: 'elliptical', seed: 3 },
    { pos: at(380, 0.42, -0.12), size: 8, tilt: [0.3, 0.6, 0.8], kind: 'spiral', seed: 4 },
    { pos: at(420, 0.05, 0.26), size: 5, tilt: [0.6, 0.6, 0.2], kind: 'elliptical', seed: 5 },
    { pos: at(360, -0.5, -0.02), size: 4.5, tilt: [0.2, 0.3, 0.9], kind: 'spiral', seed: 6 },
  ];
}
