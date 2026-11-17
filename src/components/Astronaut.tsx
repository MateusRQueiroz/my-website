/**
 * Over-the-shoulder astronaut, reaching toward the galaxy. Drawn as layered
 * SVG: a cool fill from the sky, warm rim light from the galaxy (upper right),
 * and indigo occlusion where forms meet. Static art, so it costs nothing per frame.
 */
import { useSyncExternalStore } from 'react';
import { bus } from '../universe/bus';

type P = [number, number];

/** A tapered capsule from a to b (radii ra, rb), as an SVG path. */
function capsule(a: P, b: P, ra: number, rb: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const p = (q: P, r: number, s: number): string => `${(q[0] + nx * r * s).toFixed(1)} ${(q[1] + ny * r * s).toFixed(1)}`;
  return `M${p(a, ra, 1)} L${p(b, rb, 1)} A${rb} ${rb} 0 0 0 ${p(b, rb, -1)} L${p(a, ra, -1)} A${ra} ${ra} 0 0 0 ${p(a, ra, 1)} Z`;
}
/** Gradient line across a limb so its top edge catches the rim light. */
function across(a: P, b: P, r: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return { x1: m[0] + nx * r, y1: m[1] + ny * r, x2: m[0] - nx * r, y2: m[1] - ny * r };
}
/** A soft fold crossing a limb at fraction t, bowed along the limb. */
function fold(a: P, b: P, t: number, r: number, bow: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const c: P = [a[0] + dx * t, a[1] + dy * t];
  const s: P = [c[0] + nx * r, c[1] + ny * r], e: P = [c[0] - nx * r * 0.85, c[1] - ny * r * 0.85], m: P = [c[0] + ux * bow, c[1] + uy * bow];
  return `M${s[0].toFixed(1)} ${s[1].toFixed(1)} Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
}

const SHOULDER: P = [468, 800], ELBOW: P = [622, 664], WRIST: P = [768, 566];
const FINGERS: { from: P; to: P; r: number }[] = [
  { from: [842, 500], to: [948, 452], r: 17 },  // index, leading
  { from: [852, 518], to: [948, 492], r: 17.5 },
  { from: [855, 536], to: [930, 526], r: 16 },
  { from: [850, 552], to: [905, 556], r: 13.5 },
];
const THUMB = { from: [812, 506] as P, to: [858, 452] as P, r: 16 };

export function Astronaut({ departing }: { departing: boolean }) {
  // The glove reaches a little further while the galaxy is hovered or focused.
  const reaching = useSyncExternalStore(bus.subscribe, () => bus.galaxyHover);
  const upper = across(SHOULDER, ELBOW, 78), fore = across(ELBOW, WRIST, 64);
  return <svg className={`astronaut${reaching ? ' is-reaching' : ''}${departing ? ' is-departing' : ''}`} viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="as-shell" cx="0.62" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#f6f3fb"/><stop offset="0.35" stopColor="#d9d5ea"/><stop offset="0.68" stopColor="#9895c0"/><stop offset="1" stopColor="#3f3d6a"/>
      </radialGradient>
      <linearGradient id="as-visor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#141633"/><stop offset="0.55" stopColor="#3a2f6e"/><stop offset="0.85" stopColor="#c58d6a"/><stop offset="1" stopColor="#f4cf98"/>
      </linearGradient>
      <radialGradient id="as-reflect" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe9c6" stopOpacity="0.95"/><stop offset="0.4" stopColor="#d8a6d6" stopOpacity="0.45"/><stop offset="1" stopColor="#6c5bd0" stopOpacity="0"/></radialGradient>
      <linearGradient id="as-torso" x1="0.8" y1="0" x2="0.2" y2="1">
        <stop offset="0" stopColor="#e9e6f2"/><stop offset="0.4" stopColor="#bdb9d6"/><stop offset="0.75" stopColor="#77749f"/><stop offset="1" stopColor="#2c2b4d"/>
      </linearGradient>
      <linearGradient id="as-upper" gradientUnits="userSpaceOnUse" {...upper}>
        <stop offset="0" stopColor="#fff1e2"/><stop offset="0.12" stopColor="#ece8f5"/><stop offset="0.5" stopColor="#c7c3dd"/><stop offset="0.82" stopColor="#8582ad"/><stop offset="1" stopColor="#4a4877"/>
      </linearGradient>
      <linearGradient id="as-fore" gradientUnits="userSpaceOnUse" {...fore}>
        <stop offset="0" stopColor="#fff0dc"/><stop offset="0.14" stopColor="#efebf7"/><stop offset="0.52" stopColor="#ccc8e1"/><stop offset="0.85" stopColor="#8885b0"/><stop offset="1" stopColor="#504e7c"/>
      </linearGradient>
      <linearGradient id="as-glove" x1="0.9" y1="0.1" x2="0.2" y2="0.9">
        <stop offset="0" stopColor="#fff3e3"/><stop offset="0.35" stopColor="#ebe6f1"/><stop offset="0.75" stopColor="#aaa6c8"/><stop offset="1" stopColor="#6b6893"/>
      </linearGradient>
      <linearGradient id="as-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e3c2"/><stop offset="0.45" stopColor="#b79a6a"/><stop offset="1" stopColor="#5a4a36"/>
      </linearGradient>
      <linearGradient id="as-pack" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1d1d36"/><stop offset="1" stopColor="#4d4b75"/></linearGradient>
      <radialGradient id="as-occlusion" cx="0.15" cy="1" r="0.75"><stop offset="0" stopColor="#05060e" stopOpacity="0.92"/><stop offset="1" stopColor="#05060e" stopOpacity="0"/></radialGradient>
      <filter id="as-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>

    {/* life-support pack, mostly out of frame */}
    <path d="M-40 560 Q-40 520 0 520 L120 520 Q160 520 160 560 L160 1000 L-40 1000 Z" fill="url(#as-pack)"/>
    <path d="M40 600 L130 600 M40 640 L130 640 M40 680 L130 680" stroke="#6f6d9b" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>

    {/* torso and shoulder */}
    <path d="M60 1000 C110 880 270 812 420 776 C526 752 600 796 602 874 C604 932 588 1000 588 1000 Z" fill="url(#as-torso)"/>
    <path d="M410 772 C520 746 598 790 600 870" fill="none" stroke="#ffe6cc" strokeWidth="5" strokeLinecap="round" opacity="0.55"/>
    <path d="M300 860 C380 830 470 830 540 860" fill="none" stroke="#6d6a96" strokeWidth="3" opacity="0.5"/>
    {/* a small engraved orbit on the shoulder patch */}
    <g transform="translate(470 905) rotate(-12)" opacity="0.85">
      <ellipse rx="40" ry="26" fill="#25244a" stroke="url(#as-metal)" strokeWidth="3"/>
      <ellipse rx="28" ry="9" fill="none" stroke="#dcb575" strokeWidth="1.6" transform="rotate(-18)"/>
      <circle r="5" fill="#f3d49c"/><circle cx="24" cy="-7" r="2.4" fill="#dcb575"/>
    </g>

    {/* the reaching arm */}
    <g className="astronaut-arm">
      <path d={capsule(SHOULDER, ELBOW, 82, 70)} fill="url(#as-upper)"/>
      {[0.42, 0.74].map((t, i) => <path key={t} d={fold(SHOULDER, ELBOW, t, 58 - i * 4, 12)} fill="none" stroke="#7c79a6" strokeWidth="2.4" strokeLinecap="round" opacity="0.32"/>)}
      <path d={capsule(ELBOW, WRIST, 66, 56)} fill="url(#as-fore)"/>
      {[0.5].map(t => <path key={t} d={fold(ELBOW, WRIST, t, 48, 10)} fill="none" stroke="#7c79a6" strokeWidth="2.2" strokeLinecap="round" opacity="0.3"/>)}
      {/* elbow joint and wrist cuff */}
      <ellipse cx={ELBOW[0]} cy={ELBOW[1]} rx="24" ry="70" transform={`rotate(-41 ${ELBOW[0]} ${ELBOW[1]})`} fill="none" stroke="#6b689a" strokeWidth="4" opacity="0.28"/>
      <ellipse cx={WRIST[0] + 4} cy={WRIST[1] - 2} rx="20" ry="60" transform={`rotate(-34 ${WRIST[0]} ${WRIST[1]})`} fill="url(#as-metal)"/>
      <ellipse cx={WRIST[0] + 8} cy={WRIST[1] - 5} rx="12" ry="52" transform={`rotate(-34 ${WRIST[0]} ${WRIST[1]})`} fill="none" stroke="#3d5fa8" strokeWidth="5" opacity="0.9"/>

      {/* glove */}
      <g className="astronaut-glove">
        <path d={capsule(THUMB.from, THUMB.to, THUMB.r + 3, THUMB.r)} fill="url(#as-glove)"/>
        <path d={`M${WRIST[0] + 6} ${WRIST[1] - 48} C 810 488, 836 476, 862 494 C 880 512, 878 548, 860 568 C 836 590, 800 600, ${WRIST[0] + 10} ${WRIST[1] + 40} Z`} fill="url(#as-glove)"/>
        {FINGERS.map(f => <path key={f.to.join()} d={capsule(f.from, f.to, f.r + 2, f.r)} fill="url(#as-glove)"/>)}
        {/* grip pads and knuckle seam */}
        {FINGERS.map(f => { const t = 0.62, x = f.from[0] + (f.to[0] - f.from[0]) * t, y = f.from[1] + (f.to[1] - f.from[1]) * t; return <circle key={`pad${f.to.join()}`} cx={x} cy={y} r={f.r * 0.5} fill="#8f8bb6" opacity="0.35"/>; })}
        <path d="M824 512 C838 498, 852 494, 866 500" fill="none" stroke="#7c79a6" strokeWidth="2.4" opacity="0.6"/>
        {/* rim light on the fingertips, the side facing the galaxy */}
        {[...FINGERS, THUMB].map(f => <circle key={`rim${f.to.join()}`} cx={f.to[0] + 3} cy={f.to[1] - 4} r={f.r * 0.62} fill="#fff4e4" opacity="0.7" filter="url(#as-soft)"/>)}
      </g>
    </g>

    {/* helmet, turned toward the galaxy so only a sliver of visor shows */}
    <g>
      <ellipse cx="350" cy="912" rx="230" ry="60" fill="url(#as-metal)"/>
      <circle cx="320" cy="690" r="232" fill="url(#as-shell)"/>
      {/* visor, seen from the side: deep glass with the galaxy caught in it */}
      <path d="M450 500 A232 232 0 0 1 536 760 C 512 778, 478 784, 448 776 C 492 690, 494 590, 450 500 Z" fill="url(#as-visor)"/>
      <ellipse cx="500" cy="636" rx="22" ry="56" fill="url(#as-reflect)" transform="rotate(12 500 636)"/>
      <circle cx="514" cy="688" r="2.4" fill="#fff"/><circle cx="488" cy="590" r="1.6" fill="#fff" opacity="0.8"/><circle cx="506" cy="726" r="1.4" fill="#fff" opacity="0.7"/>
      <path d="M450 500 A232 232 0 0 1 536 760" fill="none" stroke="#f6d8aa" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <path d="M450 500 C 480 600, 484 690, 448 776" fill="none" stroke="#2a2650" strokeWidth="3" opacity="0.6"/>
      {/* an engraved gold band and a small lamp */}
      <path d="M180 512 C 270 462, 380 462, 452 512" fill="none" stroke="#dcb575" strokeWidth="2.2" opacity="0.7"/>
      <rect x="294" y="462" width="56" height="22" rx="10" fill="#cfcbe0" stroke="#8c89b4" strokeWidth="2"/>
      <circle cx="309" cy="473" r="5" fill="#ffe7b8"/>
      <path d="M170 560 C 220 500, 300 470, 380 474" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity="0.38" filter="url(#as-soft)"/>
    </g>

    {/* occlusion where the figure meets the frame edge */}
    <rect x="-60" y="560" width="760" height="460" fill="url(#as-occlusion)"/>
  </svg>;
}
