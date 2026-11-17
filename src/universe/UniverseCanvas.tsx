import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DESTINATION_ORDER, GALAXY_RADIUS, arcPose, destinationPoints, distantGalaxies, durationFor, glideEase, glidePose, journeyEase,
  shotFor, skyConstellations, type Shot, type ShotId, type Vec3,
} from './layout';
import { rng } from './paint';
import { bus, type Move } from './bus';
import type { Painted, Quality } from './assets';

export interface UniverseCanvasProps {
  move: Move;
  ambient: boolean;      // gentle idle motion (universe / overview, motion allowed)
  quality: Quality;
  art: Painted;
  onReady: () => void;
  onArrive: (id: number) => void;
}

const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);
const PLANE = (GALAXY_RADIUS / 0.47) * 2; // the painted disc spans 47% of its canvas
const GOLD = new THREE.Color(0.86, 0.71, 0.45);

function useTexture(source: HTMLCanvasElement, anisotropy = 1) {
  const gl = useThree(s => s.gl);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(source);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(anisotropy, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [source, anisotropy, gl]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/* ------------------------------------------------------------- backdrop */
function Sky({ art }: { art: Painted }) {
  const map = useTexture(art.sky);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return <mesh ref={ref} renderOrder={-10} frustumCulled={false}>
    <sphereGeometry args={[600, 48, 24]}/>
    <meshBasicMaterial map={map} side={THREE.BackSide} depthWrite={false} depthTest={false}/>
  </mesh>;
}

function DistantGalaxies({ art }: { art: Painted }) {
  const items = useMemo(() => distantGalaxies().map((g, i) => {
    const tex = new THREE.CanvasTexture(art.minis[i]); tex.colorSpace = THREE.SRGBColorSpace;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v3(g.tilt).normalize());
    return { g, tex, q };
  }), [art]);
  useEffect(() => () => items.forEach(i => i.tex.dispose()), [items]);
  return <>{items.map(({ g, tex, q }, i) => <mesh key={i} position={g.pos} quaternion={q} renderOrder={-9}>
    <planeGeometry args={[g.size * 2, g.size * 2]}/>
    <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.9} side={THREE.DoubleSide}/>
  </mesh>)}</>;
}

/** Atmospheric haze: a few big soft layers around the galaxy, and some along the approach. */
function Haze({ art, aspect }: { art: Painted; aspect: number }) {
  const textures = useMemo(() => art.haze.map(c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }), [art]);
  const layers = useMemo(() => {
    const r = rng(41), out: { pos: Vec3; scale: number; color: THREE.Color; opacity: number; tex: number; spin: number }[] = [];
    const tints = [new THREE.Color('#6d5bd0'), new THREE.Color('#2f7f9a'), new THREE.Color('#b0588e'), new THREE.Color('#4a63c4')];
    for (let i = 0; i < 7; i++) { // halo around the disc
      const a = r() * Math.PI * 2, d = GALAXY_RADIUS * (0.6 + r() * 0.9);
      out.push({ pos: [Math.cos(a) * d, -1.5 - r() * 3, Math.sin(a) * d], scale: 14 + r() * 16, color: tints[i % 4], opacity: 0.1 + r() * 0.06, tex: i % 3, spin: r() * 6 });
    }
    const from = shotFor('universe', aspect), to = shotFor('galaxy', aspect);
    for (let i = 0; i < 8; i++) { // passing layers on the way in
      const s = 0.25 + (i / 8) * 0.5, p = arcPose(from, to, s);
      const f = v3(p.target).sub(v3(p.pos)).normalize(), right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
      const dist = v3(p.pos).distanceTo(v3(p.target));
      const at = v3(p.pos).addScaledVector(f, dist * (0.18 + r() * 0.1)).addScaledVector(right, (i % 2 ? 1 : -1) * dist * (0.12 + r() * 0.1)).add(new THREE.Vector3(0, (r() - 0.5) * dist * 0.1, 0));
      out.push({ pos: [at.x, at.y, at.z], scale: dist * (0.22 + r() * 0.12), color: tints[(i + 1) % 4], opacity: 0.16, tex: i % 3, spin: r() * 6 });
    }
    return out;
  }, [aspect]);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ camera, clock }) => {
    refs.current.forEach((s, i) => {
      if (!s) return;
      const d = camera.position.distanceTo(s.position), L = layers[i];
      (s.material as THREE.SpriteMaterial).opacity = L.opacity * THREE.MathUtils.smoothstep(d, L.scale * 0.35, L.scale * 0.9);
      (s.material as THREE.SpriteMaterial).rotation = L.spin + clock.elapsedTime * 0.004;
    });
  });
  useEffect(() => () => textures.forEach(t => t.dispose()), [textures]);
  return <>{layers.map((L, i) => <sprite key={i} ref={el => { refs.current[i] = el; }} position={L.pos} scale={[L.scale, L.scale * 0.7, 1]} renderOrder={-6}>
    <spriteMaterial map={textures[L.tex]} color={L.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={L.opacity}/>
  </sprite>)}</>;
}

/* --------------------------------------------------------------- galaxy */
const starVertex = /* glsl */ `
  attribute float aSize; attribute vec3 aColor; attribute float aSpark; uniform float uPx; uniform float uTime; uniform float uTwinkle;
  varying vec3 vC; varying float vA; varying float vSpark;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = max(0.01, -mv.z), s = aSize * uPx / d;
    float tw = 1.0 + uTwinkle * 0.3 * sin(uTime * 1.1 + position.x * 13.0 + position.z * 7.0);
    vA = clamp(s / 1.6, 0.15, 1.0) * tw * smoothstep(0.5, 2.5, d);
    vC = aColor; vSpark = aSpark;
    gl_PointSize = aSpark > 0.5 ? 26.0 : clamp(s, 1.4, 3.2) * 2.4;
    gl_Position = projectionMatrix * mv;
  }`;
const starFragment = /* glsl */ `
  varying vec3 vC; varying float vA; varying float vSpark;
  void main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float r = dot(p, p); if (r > 1.0) discard;
    float core = vSpark > 0.5 ? exp(-r * 60.0) * 1.4 + exp(-r * 12.0) * 0.25 : exp(-r * 9.0) + exp(-r * 2.5) * 0.16;
    // a few illustrated four-point sparkles
    float spikes = vSpark * (exp(-abs(p.x) * 34.0) + exp(-abs(p.y) * 34.0)) * (1.0 - r) * 0.7;
    gl_FragColor = vec4(vC * (core + spikes) * vA, 1.0); }`;

function Stars({ quality, ambient }: { quality: Quality; ambient: boolean }) {
  const { gl, size } = useThree();
  const geo = useMemo(() => {
    const r = rng(5), n = quality === 'high' ? 1300 : 700, far = quality === 'high' ? 2400 : 1300;
    const pos = new Float32Array((n + far) * 3), col = new Float32Array((n + far) * 3), sz = new Float32Array(n + far), spark = new Float32Array(n + far);
    const palette = [[0.9, 0.93, 1], [0.75, 0.82, 1], [1, 0.88, 0.7], [1, 0.75, 0.82]];
    for (let i = 0; i < n; i++) { // in the disc, loosely following the arms
      const arm = (i % 2) * Math.PI, rr = 0.8 + Math.pow(r(), 0.8) * GALAXY_RADIUS * 1.05;
      const th = arm + Math.log(rr / 0.5) / 0.3 + (r() - 0.5) * 0.9;
      pos.set([rr * Math.cos(th), (r() - 0.5) * (0.5 + 1.2 * Math.exp(-rr / 3)), rr * Math.sin(th)], i * 3);
      col.set(palette[Math.floor(r() * 4)], i * 3); sz[i] = 0.012 + r() * 0.026;
    }
    for (let i = n; i < n + far; i++) { // the starfield: a deep shell, so near and far stars separate while travelling
      const u = r() * 2 - 1, a = r() * Math.PI * 2, d = 45 + Math.pow(r(), 0.6) * 260, s = Math.sqrt(1 - u * u);
      pos.set([d * s * Math.cos(a), d * u, d * s * Math.sin(a)], i * 3);
      col.set(palette[Math.floor(r() * 3)], i * 3); sz[i] = (0.08 + Math.pow(r(), 3) * 0.5) * (d / 120);
      spark[i] = r() < 0.012 ? 1 : 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aSpark', new THREE.BufferAttribute(spark, 1));
    return g;
  }, [quality]);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: starVertex, fragmentShader: starFragment,
    uniforms: { uPx: { value: 1 }, uTime: { value: 0 }, uTwinkle: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  useFrame(({ camera, clock }) => {
    mat.uniforms.uPx.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360));
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uTwinkle.value = ambient ? 1 : 0;
  });
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <points geometry={geo} material={mat} renderOrder={2} frustumCulled={false}/>;
}

function Galaxy({ art, ambient }: { art: Painted; ambient: boolean }) {
  const disc = useTexture(art.galaxy, 8);
  const air = useTexture(art.atmosphere);
  const rays = useTexture(art.rays);
  const glow = useTexture(art.glow);
  const raysRef = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => { if (raysRef.current && ambient) (raysRef.current.material as THREE.SpriteMaterial).rotation = clock.elapsedTime * 0.01; });
  return <group>
    {/* atmosphere below and above the disc gives it thickness */}
    <mesh rotation-x={-Math.PI / 2} position-y={-0.25} scale={1.28} renderOrder={0}>
      <planeGeometry args={[PLANE, PLANE]}/>
      <meshBasicMaterial map={air} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.34}/>
    </mesh>
    <mesh rotation-x={-Math.PI / 2} renderOrder={1}>
      <planeGeometry args={[PLANE, PLANE]}/>
      <meshBasicMaterial map={disc} transparent depthWrite={false}/>
    </mesh>
    <mesh rotation-x={-Math.PI / 2} position-y={0.3} scale={1.06} renderOrder={3}>
      <planeGeometry args={[PLANE, PLANE]}/>
      <meshBasicMaterial map={air} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.14}/>
    </mesh>
    {/* the bulge, standing up out of the disc, and its soft rays */}
    <sprite scale={[3.4, 2.4, 1]} renderOrder={4}><spriteMaterial map={glow} color="#ffc98e" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5}/></sprite>
    <sprite ref={raysRef} scale={[16, 16, 1]} renderOrder={4}><spriteMaterial map={rays} color="#ffe3bd" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.26}/></sprite>
  </group>;
}

/* ------------------------------------------------- engraved celestial rings */
function circle(radius: number, segments = 160, y = 0): number[] {
  const out: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2, b = ((i + 1) / segments) * Math.PI * 2;
    out.push(Math.cos(a) * radius, y, Math.sin(a) * radius, Math.cos(b) * radius, y, Math.sin(b) * radius);
  }
  return out;
}
function lines(points: number[], color: THREE.Color, opacity: number) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return { g, m: new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }) };
}

/** An astrolabe engraved around the galaxy: two rings with graduated ticks. */
function Astrolabe() {
  const { g, m } = useMemo(() => {
    const pts = [...circle(GALAXY_RADIUS * 1.12), ...circle(GALAXY_RADIUS * 1.2)];
    for (let d = 0; d < 360; d += 5) {
      const a = (d * Math.PI) / 180, inner = GALAXY_RADIUS * (d % 30 === 0 ? 1.08 : 1.12), outer = GALAXY_RADIUS * (d % 30 === 0 ? 1.25 : 1.16);
      pts.push(Math.cos(a) * inner, 0, Math.sin(a) * inner, Math.cos(a) * outer, 0, Math.sin(a) * outer);
    }
    return lines(pts, GOLD, 0.3);
  }, []);
  useEffect(() => () => { g.dispose(); m.dispose(); }, [g, m]);
  useFrame(({ camera }) => {
    const far = THREE.MathUtils.smoothstep(camera.position.length(), 28, 55);
    m.opacity = (bus.galaxyHover ? 0.7 : 0.3) * far + 0.12 * (1 - far);
  });
  return <lineSegments geometry={g} material={m} renderOrder={5}/>;
}

/**
 * The celestial sphere: an engraved equator and ecliptic with degree ticks that
 * wrap the whole universe, plus faint constellation figures in the sky.
 */
function CelestialSphere() {
  const { sphere, stars, figures } = useMemo(() => {
    const R = 78, pts: number[] = [];
    const ring = (tilt: number, spin: number) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, spin, 0));
      const v = new THREE.Vector3(), w = new THREE.Vector3();
      for (let d = 0; d < 360; d += 1.5) {
        v.set(Math.cos(rad(d)) * R, 0, Math.sin(rad(d)) * R).applyQuaternion(q);
        w.set(Math.cos(rad(d + 1.5)) * R, 0, Math.sin(rad(d + 1.5)) * R).applyQuaternion(q);
        pts.push(v.x, v.y, v.z, w.x, w.y, w.z);
      }
      for (let d = 0; d < 360; d += 10) { // graduation ticks
        const len = d % 30 === 0 ? 3 : 1.4;
        v.set(Math.cos(rad(d)) * R, -len, Math.sin(rad(d)) * R).applyQuaternion(q);
        w.set(Math.cos(rad(d)) * R, len, Math.sin(rad(d)) * R).applyQuaternion(q);
        pts.push(v.x, v.y, v.z, w.x, w.y, w.z);
      }
    };
    ring(0.12, 0); ring(0.12 + 0.41, 0.6); // equator, and the ecliptic at ~23.4° to it
    const figs = skyConstellations(), fp: number[] = [], sp: number[] = [];
    figs.forEach(f => { f.forEach((p, i) => { sp.push(...p); if (i) fp.push(...f[i - 1], ...p); }); });
    return { sphere: lines(pts, GOLD, 0.13), figures: lines(fp, GOLD, 0.22), stars: new Float32Array(sp) };
  }, []);
  const starGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(stars, 3)); return g; }, [stars]);
  useEffect(() => () => { sphere.g.dispose(); sphere.m.dispose(); figures.g.dispose(); figures.m.dispose(); starGeo.dispose(); }, [sphere, figures, starGeo]);
  return <>
    <lineSegments geometry={sphere.g} material={sphere.m} renderOrder={-7}/>
    <lineSegments geometry={figures.g} material={figures.m} renderOrder={-7}/>
    <points geometry={starGeo} renderOrder={-7}><pointsMaterial color="#f2d39a" size={3} sizeAttenuation={false} transparent opacity={0.8} depthWrite={false}/></points>
  </>;
}
const rad = (d: number) => (d * Math.PI) / 180;

/** Destination orbits and markers, revealed after arrival. */
function Destinations({ aspect, art, ambient }: { aspect: number; art: Painted; ambient: boolean }) {
  const points = useMemo(() => destinationPoints(aspect), [aspect]);
  const marker = useTexture(art.marker);
  const orbits = useMemo(() => DESTINATION_ORDER.map(id => {
    const p = points[id], radius = Math.hypot(p[0], p[2]);
    return lines(circle(radius, 200, 0.05), GOLD, 0);
  }), [points]);
  useEffect(() => () => orbits.forEach(o => { o.g.dispose(); o.m.dispose(); }), [orbits]);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const shown = useRef(0);
  const invalidate = useThree(s => s.invalidate);
  useFrame(({ camera }, delta) => {
    const near = 1 - THREE.MathUtils.smoothstep(camera.position.length(), 30, 50);
    const goal = bus.reveal ? 1 : 0;
    shown.current = ambient ? THREE.MathUtils.damp(shown.current, goal, 5, Math.min(delta, 0.1)) : goal;
    if (Math.abs(shown.current - goal) > 0.01) invalidate();
    const k = shown.current * near;
    const sel = bus.selected, t = performance.now() / 1000;
    if (sel) invalidate(); // keep the pulse alive while a course is set
    DESTINATION_ORDER.forEach((id, i) => {
      const chosen = sel === id, hot = chosen || (!sel && bus.hover === id), dim = !!sel && !chosen;
      orbits[i].m.opacity = k * (chosen ? 0.85 : hot ? 0.55 : dim ? 0.06 : 0.16);
      const s = sprites.current[i];
      if (s) {
        const m = s.material as THREE.SpriteMaterial;
        m.opacity = k * (chosen ? 1 : hot ? 1 : dim ? 0.3 : 0.75);
        const sc = chosen ? 0.085 + Math.sin(t * 4) * 0.01 : hot ? 0.075 : 0.058;
        s.scale.set(sc, sc, 1);
      }
    });
  });
  return <>{DESTINATION_ORDER.map((id, i) => <group key={id}>
    <lineSegments geometry={orbits[i].g} material={orbits[i].m} renderOrder={5}/>
    <sprite ref={el => { sprites.current[i] = el; }} position={points[id]} renderOrder={6}>
      <spriteMaterial map={marker} color="#ffe2b0" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} sizeAttenuation={false}/>
    </sprite>
  </group>)}</>;
}

/* ----------------------------------------------------------- camera rig */
interface Anim { id: number; kind: Move['kind']; from: Shot; to: Shot; toId: ShotId; fromId: ShotId; start: number; dur: number }

function Rig({ move, ambient, onArrive }: { move: Move; ambient: boolean; onArrive: (id: number) => void }) {
  const { camera, size, invalidate } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const aspect = size.width / size.height;
  const current = useRef<Shot>(shotFor(move.shot, aspect));
  const at = useRef<ShotId>(move.shot);
  const anim = useRef<Anim | null>(null);
  const paused = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  useEffect(() => {
    if (!import.meta.env.DEV || !new URLSearchParams(window.location.search).has('debug')) return;
    const debugWindow = window as unknown as { __universe?: unknown };
    debugWindow.__universe = {
      seek: (t: number) => { paused.current = t; invalidate(); },
      resume: () => { paused.current = null; invalidate(); },
    };
    return () => { delete debugWindow.__universe; };
  }, [invalidate]);

  // New destination: start from wherever the camera is now, so nothing ever jumps.
  useEffect(() => {
    const to = shotFor(move.shot, aspect);
    const fromId = at.current;
    at.current = move.shot;
    if (move.kind === 'cut') { anim.current = null; current.current = to; invalidate(); onArrive(move.id); return; }
    const dur = move.duration ?? durationFor(fromId, move.shot);
    anim.current = { id: move.id, kind: move.kind, from: { ...current.current }, to, toId: move.shot, fromId, start: performance.now(), dur };
    invalidate();
  }, [move]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resizing re-frames the current shot.
  useEffect(() => {
    if (anim.current) { anim.current.to = shotFor(anim.current.toId, aspect); return; }
    current.current = shotFor(at.current, aspect); invalidate();
  }, [aspect, invalidate]);

  useEffect(() => {
    if (!ambient) return;
    const onMove = (e: PointerEvent) => { pointer.current.x = e.clientX / window.innerWidth - 0.5; pointer.current.y = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [ambient]);

  useFrame(({ clock }) => {
    const a = anim.current;
    if (a) {
      const t = paused.current ?? Math.min(1, (performance.now() - a.start) / a.dur);
      const longMove = a.fromId === 'universe' || a.toId === 'universe';
      const s = (a.kind === 'journey' ? journeyEase : glideEase)(t);
      current.current = longMove ? arcPose(a.from, a.to, s, a.kind === 'journey' ? 12 : 6) : glidePose(a.from, a.to, s);
      if (t >= 1 && paused.current === null) { anim.current = null; current.current = a.to; onArrive(a.id); }
    }
    let { pos, target } = current.current;
    // Idle breathing and a touch of pointer parallax, only in the universe view.
    if (!a && ambient && at.current === 'universe') {
      const p = pointer.current; p.sx += (p.x - p.sx) * 0.04; p.sy += (p.y - p.sy) * 0.04;
      const t = clock.elapsedTime;
      pos = [pos[0] + Math.sin(t * 0.07) * 0.8 + p.sx * 2.2, pos[1] + Math.sin(t * 0.05) * 0.4 - p.sy * 1.2, pos[2]];
    }
    cam.position.set(...pos);
    cam.lookAt(target[0], target[1], target[2]);
    if (cam.fov !== current.current.fov) { cam.fov = current.current.fov; cam.updateProjectionMatrix(); }
  });
  return null;
}

/**
 * Renders on demand: continuously only while the camera moves, ~30 fps for
 * idle motion, and not at all while a section page is open.
 */
function Driver({ ambient, onReady, busy }: { ambient: boolean; onReady: () => void; busy: () => boolean }) {
  const { invalidate, setDpr, gl } = useThree();
  const frames = useRef<number[]>([]), last = useRef(0), readyOnce = useRef(false);
  useEffect(() => bus.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    if (!ambient) return;
    const id = window.setInterval(() => invalidate(), 33);
    return () => window.clearInterval(id);
  }, [ambient, invalidate]);
  useFrame(() => {
    const now = performance.now();
    if (!readyOnce.current) { readyOnce.current = true; requestAnimationFrame(onReady); }
    if (busy()) {
      invalidate();
      // Adaptive resolution: if moving frames are slow, drop to 1x.
      if (last.current && frames.current.length < 45) {
        frames.current.push(now - last.current);
        if (frames.current.length === 45) {
          const sorted = [...frames.current].sort((x, y) => x - y);
          if (sorted[22] > 30 && gl.getPixelRatio() > 1) setDpr(1);
        }
      }
      last.current = now;
    } else last.current = 0;
  });
  return null;
}

function Scene(props: UniverseCanvasProps) {
  const { size } = useThree();
  const aspect = size.width / size.height;
  const moving = useRef<number | null>(null);
  // A cut cancels any motion; a new move keeps frames coming until it arrives.
  if (props.move.kind === 'cut') moving.current = null;
  else if (moving.current !== -props.move.id) moving.current = props.move.id;
  const onArrive = (id: number) => { if (moving.current === id) moving.current = -id; props.onArrive(id); };
  return <>
    <Sky art={props.art}/>
    <DistantGalaxies art={props.art}/>
    <Haze art={props.art} aspect={aspect}/>
    <Galaxy art={props.art} ambient={props.ambient}/>
    <Stars quality={props.quality} ambient={props.ambient}/>
    <Astrolabe/>
    <CelestialSphere/>
    <Destinations aspect={aspect} art={props.art} ambient={props.ambient}/>
    <Rig move={props.move} ambient={props.ambient} onArrive={onArrive}/>
    <Driver ambient={props.ambient} onReady={props.onReady} busy={() => (moving.current ?? 0) > 0}/>
  </>;
}

export default function UniverseCanvas(props: UniverseCanvasProps) {
  return <Canvas
    className="universe-canvas"
    frameloop="demand"
    flat
    dpr={props.quality === 'high' ? [1, 1.5] : [1, 1.25]}
    gl={{ antialias: props.quality === 'high', powerPreference: 'high-performance', alpha: false }}
    camera={{ fov: 30, near: 0.1, far: 2000, position: [0, 30, 60] }}
    onCreated={({ gl }) => { gl.setClearColor('#05060e'); }}
    aria-hidden="true"
  ><Scene {...props}/></Canvas>;
}
