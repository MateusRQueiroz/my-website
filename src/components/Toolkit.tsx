import type { ReactNode } from 'react';

/*
 * Toolkit illustrations: one classical scene per skill group. Names come from
 * the real skill list. Motion uses SVG animation and is omitted
 * entirely when `still` is set (reduced motion).
 */
type Art = { items: string[]; still: boolean };
const GOLD = '#dcb575', BRIGHT = '#f2d39a', IVORY = '#f1ead9', LAPIS = '#8ea4ee', ROSE = '#e7a6bb';
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))] as const;

function Defs() {
  return <defs>
    <radialGradient id="tk-marble" cx="0.65" cy="0.3" r="0.8"><stop offset="0" stopColor="#fdfaf4"/><stop offset="0.55" stopColor="#d9d2c8"/><stop offset="1" stopColor="#8f8798"/></radialGradient>
    <linearGradient id="tk-bronze" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9cf98"/><stop offset="0.45" stopColor="#a8834f"/><stop offset="1" stopColor="#4a3a28"/></linearGradient>
    <radialGradient id="tk-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={BRIGHT} stopOpacity="0.9"/><stop offset="1" stopColor={BRIGHT} stopOpacity="0"/></radialGradient>
    <radialGradient id="tk-flame" cx="0.5" cy="0.8" r="0.7"><stop offset="0" stopColor="#fff3d6"/><stop offset="0.45" stopColor="#f2b35e"/><stop offset="1" stopColor="#c0582c" stopOpacity="0"/></radialGradient>
  </defs>;
}

function Frame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <svg viewBox="0 0 360 380" className="toolkit-svg" aria-hidden="true" focusable="false">
    <Defs/>
    {children}
    <text x="180" y="356" textAnchor="middle" className="tk-title">{title}</text>
    <text x="180" y="372" textAnchor="middle" className="tk-subtitle">{subtitle}</text>
  </svg>;
}

/* ------------------------------------------------ Languages: a celestial atlas */
const PATTERNS: [number, number][][] = [
  [[0, 0], [14, -10], [26, -4], [34, 10], [20, 18]],
  [[0, 0], [10, 16], [24, 20], [34, 8]],
  [[0, 0], [16, -6], [18, 12], [32, 18], [8, 24]],
  [[0, 0], [12, 10], [8, 26], [26, 22]],
  [[0, 0], [18, 4], [30, -8], [24, 14], [36, 22]],
  [[0, 0], [10, -12], [24, -6], [20, 10]],
];
export function LanguagesAtlas({ items, still }: Art) {
  const C = 180, n = items.length;
  return <Frame title="Logos" subtitle="A celestial atlas of languages">
    <circle cx={C} cy={C - 10} r="158" fill="none" stroke={GOLD} strokeOpacity="0.5"/>
    <g>
      {!still && <animateTransform attributeName="transform" type="rotate" from={`0 ${C} ${C - 10}`} to={`360 ${C} ${C - 10}`} dur="160s" repeatCount="indefinite"/>}
      {Array.from({ length: 72 }, (_, i) => { const a = i * 5, [x1, y1] = polar(C, C - 10, 150, a), [x2, y2] = polar(C, C - 10, i % 6 === 0 ? 140 : 145, a); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeOpacity="0.55"/>; })}
    </g>
    <circle cx={C} cy={C - 10} r="138" fill="rgba(142,164,238,0.04)" stroke={GOLD} strokeOpacity="0.35"/>
    <g fill="none" stroke={LAPIS} strokeOpacity="0.12">
      <ellipse cx={C} cy={C - 10} rx="130" ry="52" transform="rotate(-32 180 170)"/>
      <ellipse cx={C} cy={C - 10} rx="52" ry="130" transform="rotate(-32 180 170)"/>
    </g>
    {items.map((_, k) => { const a = -90 + (k * 360) / n, [x1, y1] = polar(C, C - 10, 34, a), [x2, y2] = polar(C, C - 10, 138, a); return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeOpacity="0.3" strokeDasharray="2 4"/>; })}
    <circle cx={C} cy={C - 10} r="30" fill="url(#tk-glow)"/>
    <circle cx={C} cy={C - 10} r="28" fill="url(#tk-bronze)" stroke={BRIGHT} strokeWidth="0.6"/>
    <text x={C} y={C - 5} textAnchor="middle" className="tk-greek">ΛΟΓΟΣ</text>
    {items.map((name, k) => {
      const mid = -90 + ((k + 0.5) * 360) / n, [sx, sy] = polar(C, C - 10, 74, mid), [lx, ly] = polar(C, C - 10, 114, mid);
      const pts = PATTERNS[k % PATTERNS.length].map(([dx, dy]) => [sx + dx - 16, sy + dy - 8] as const);
      return <g key={name} className="tk-region" style={{ animationDelay: `${k * 120}ms` }}>
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={BRIGHT} strokeOpacity="0.7" strokeWidth="0.9" className="tk-draw"/>
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 0 ? 2.6 : 1.8} fill={IVORY}>
          {!still && <animate attributeName="opacity" values="1;0.45;1" dur={`${3 + ((k + i) % 4)}s`} repeatCount="indefinite"/>}
        </circle>)}
        <text x={lx} y={ly + 4} textAnchor="middle" className="tk-label">{name}</text>
      </g>;
    })}
  </Frame>;
}

/* ------------------------------------------------ Data and ML: the celestial forge */
function gearPath(cx: number, cy: number, r: number, teeth: number) {
  const out: string[] = [], depth = r * 0.14;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * 360, w = 360 / teeth;
    const p = [polar(cx, cy, r - depth, a0), polar(cx, cy, r, a0 + w * 0.18), polar(cx, cy, r, a0 + w * 0.48), polar(cx, cy, r - depth, a0 + w * 0.66)];
    p.forEach(([x, y], j) => out.push(`${i === 0 && j === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`));
  }
  return out.join(' ') + 'Z';
}
function Gear({ cx, cy, r, teeth, dur, reverse, still }: { cx: number; cy: number; r: number; teeth: number; dur: number; reverse?: boolean; still: boolean }) {
  return <g>
    {!still && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`${reverse ? -360 : 360} ${cx} ${cy}`} dur={`${dur}s`} repeatCount="indefinite"/>}
    <path d={gearPath(cx, cy, r, teeth)} fill="url(#tk-bronze)" stroke={BRIGHT} strokeOpacity="0.55" strokeWidth="0.8"/>
    <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="#3a2d1f" strokeOpacity="0.7"/>
    {[0, 60, 120].map(a => { const [x1, y1] = polar(cx, cy, r * 0.6, a), [x2, y2] = polar(cx, cy, r * 0.6, a + 180); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a2d1f" strokeOpacity="0.55" strokeWidth="2"/>; })}
    <circle cx={cx} cy={cy} r={r * 0.16} fill="#2c2218" stroke={BRIGHT} strokeOpacity="0.6"/>
  </g>;
}
const INFLOW = ['M8 70 C 60 60, 110 120, 182 160', 'M4 150 C 50 150, 110 150, 182 162', 'M10 230 C 60 230, 120 190, 182 164', 'M30 300 C 70 260, 130 200, 182 166'];
export function CelestialForge({ items, still }: Art) {
  const labels: [number, number, string][] = [[24, 40, items[0]], [16, 272, items[1]], [248, 300, items[2]], [282, 166, items[3]], [262, 30, items[4]]];
  return <Frame title="The celestial forge" subtitle="Raw data in, ordered patterns out">
    {/* engraved dial behind the mechanism */}
    <circle cx="182" cy="164" r="104" fill="none" stroke={GOLD} strokeOpacity="0.28"/>
    <path d="M108 64 Q182 28 256 64 L268 254 Q182 290 96 254 Z" fill="rgba(220,181,117,0.035)" stroke={GOLD} strokeOpacity="0.22"/>
    {[64, 254].flatMap(y => [108, 256].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="url(#tk-bronze)" stroke={BRIGHT} strokeWidth="0.5"/>))}
    {Array.from({ length: 48 }, (_, i) => { const [x1, y1] = polar(182, 164, 104, i * 7.5), [x2, y2] = polar(182, 164, i % 4 === 0 ? 96 : 100, i * 7.5); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeOpacity="0.35"/>; })}
    {/* the forge fire beneath it */}
    <ellipse cx="182" cy="300" rx="70" ry="16" fill="url(#tk-glow)" opacity="0.5"/>
    <path d="M182 268 C 170 286, 168 300, 182 312 C 196 300, 194 286, 182 268 Z" fill="url(#tk-flame)">
      {!still && <animateTransform attributeName="transform" type="scale" values="1 1;1.04 0.94;0.97 1.05;1 1" dur="2.6s" repeatCount="indefinite" additive="sum"/>}
    </path>
    {/* data flowing in: scattered points along four channels */}
    {INFLOW.map((d, i) => <path key={i} d={d} fill="none" stroke={LAPIS} strokeOpacity="0.22" strokeDasharray="2 5"/>)}
    {!still && INFLOW.flatMap((d, i) => [0, 1].map(k => <circle key={`${i}-${k}`} r="2.6" fill={[LAPIS, ROSE, IVORY, BRIGHT][(i + k) % 4]}>
      <animateMotion path={d} dur={`${3.2 + i * 0.4}s`} begin={`${k * 1.6 + i * 0.3}s`} repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={`${3.2 + i * 0.4}s`} begin={`${k * 1.6 + i * 0.3}s`} repeatCount="indefinite"/>
    </circle>))}
    <Gear cx={182} cy={164} r={58} teeth={24} dur={40} still={still}/>
    <Gear cx={254} cy={218} r={32} teeth={13} dur={40 * 13 / 24} reverse still={still}/>
    <Gear cx={114} cy={206} r={24} teeth={10} dur={40 * 10 / 24} reverse still={still}/>
    {/* ordered output: a small lattice lighting up in sequence */}
    <g transform="translate(286 76)">
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={(i % 4) * 14} y={Math.floor(i / 4) * 14} width="8" height="8" rx="1.5" fill={BRIGHT} opacity={still ? 0.8 : 0.15}>
        {!still && <animate attributeName="opacity" values="0.15;0.95;0.95;0.15" keyTimes="0;0.2;0.75;1" dur="6s" begin={`${i * 0.25}s`} repeatCount="indefinite"/>}
      </rect>)}
    </g>
    <path d="M232 120 C 250 104, 266 96, 282 92" fill="none" stroke={BRIGHT} strokeOpacity="0.4" strokeDasharray="2 4"/>
    {!still && [0, 1, 2].map(i => <circle key={`out-${i}`} r="2.5" fill={BRIGHT}>
      <animateMotion path="M232 120 C250 104 266 96 282 92" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite"/>
    </circle>)}
    {labels.map(([x, y, name]) => name && <text key={name} x={x} y={y} className="tk-label tk-label-left">{name}</text>)}
  </Frame>;
}

/* ------------------------------------------------ Web and APIs: Hermes' relay */
export function HermesRelay({ items, still }: Art) {
  const C: [number, number] = [180, 168], n = items.length;
  const nodes = items.map((name, i) => { const a = -90 + (i * 360) / n; const [x, y] = polar(C[0], C[1], 1, a); return { name, x: C[0] + (x - C[0]) * 138, y: C[1] + (y - C[1]) * 128 }; });
  const routes = nodes.map((a, i) => { const b = nodes[(i + 2) % n]; const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; const cx = C[0] + (mx - C[0]) * 0.35, cy = C[1] + (my - C[1]) * 0.35; return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; });
  return <Frame title="Hermes’ relay" subtitle="Messages between distant points">
    <ellipse cx={C[0]} cy={C[1]} rx="138" ry="128" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeDasharray="1 5"/>
    {routes.map((d, i) => <path key={i} d={d} fill="none" stroke={LAPIS} strokeOpacity="0.28"/>)}
    {!still && routes.map((d, i) => <circle key={`m${i}`} r="3" fill={BRIGHT}>
      <animateMotion path={d} dur="2.8s" begin={`${i * 0.55}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.2 1"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.8s" begin={`${i * 0.55}s`} repeatCount="indefinite"/>
    </circle>)}
    {/* the messenger's emblem: a winged caduceus */}
    <g transform={`translate(${C[0]} ${C[1]})`}>
      <circle r="62" fill="rgba(142,164,238,0.035)" stroke={GOLD} strokeOpacity="0.22"/>
      <ellipse rx="28" ry="62" fill="none" stroke={LAPIS} strokeOpacity="0.2" transform="rotate(24)"/>
      <circle r="42" fill="url(#tk-glow)" opacity="0.35"/>
      {[-1, 1].map(s => <g key={s} transform={`scale(${s} 1)`}>
        <path d="M6 -26 C 22 -40, 44 -42, 58 -34 C 46 -32, 36 -28, 30 -22 C 42 -24, 50 -22, 56 -16 C 44 -16, 34 -14, 26 -10 C 34 -10, 40 -6, 44 0 C 30 -2, 16 -8, 6 -16 Z" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.7" strokeWidth="0.8"/>
        <path d="M12 -25 Q30 -34 46 -35 M12 -20 Q27 -25 39 -24 M12 -15 Q25 -16 33 -13" fill="none" stroke="#817681" strokeWidth="0.8" strokeOpacity="0.65"/>
      </g>)}
      <line x1="0" y1="-34" x2="0" y2="46" stroke={BRIGHT} strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="0" cy="-36" r="4" fill={BRIGHT}/>
      <path d="M0 -14 C 12 -8, 12 2, 0 8 C -12 14, -12 24, 0 30 M0 -14 C -12 -8, -12 2, 0 8 C 12 14, 12 24, 0 30" fill="none" stroke={GOLD} strokeWidth="1.4"/>
    </g>
    {nodes.map(nd => <g key={nd.name}>
      <circle cx={nd.x} cy={nd.y} r="9" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.8"/>
      <text x={nd.x} y={nd.y + (nd.y < C[1] ? -15 : 24)} textAnchor="middle" className="tk-label">{nd.name}</text>
    </g>)}
  </Frame>;
}

/* ------------------------------------------------ Practice: the scales of proof */
export function ScalesOfProof({ items, still }: Art) {
  const [history, ...checks] = items;
  return <Frame title="The scales of proof" subtitle="History on one side, evidence on the other">
    <circle cx="180" cy="174" r="142" fill="rgba(142,164,238,0.025)" stroke={GOLD} strokeOpacity="0.2"/>
    <path d="M44 174 H316 M180 32 V316" fill="none" stroke={GOLD} strokeOpacity="0.12" strokeDasharray="2 6"/>
    <path d="M60 80 A150 150 0 0 1 300 80" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeDasharray="1 8"/>
    {/* a fluted column holding the balance */}
    <rect x="166" y="122" width="28" height="170" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.4"/>
    {[172, 179, 186].map(x => <line key={x} x1={x} y1="128" x2={x} y2="286" stroke="#8f8798" strokeOpacity="0.6"/>)}
    <rect x="154" y="112" width="52" height="12" rx="2" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.5"/>
    <rect x="146" y="290" width="68" height="12" rx="2" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.5"/>
    <rect x="136" y="302" width="88" height="10" rx="2" fill="url(#tk-marble)" stroke={GOLD} strokeOpacity="0.5"/>
    <circle cx="180" cy="104" r="7" fill="url(#tk-bronze)" stroke={BRIGHT} strokeOpacity="0.6"/>
    <g>
      {!still && <animateTransform attributeName="transform" type="rotate" values="0 180 104;-5 180 104;3 180 104;-1.2 180 104;0 180 104;0 180 104" keyTimes="0;0.18;0.36;0.52;0.66;1" dur="9s" repeatCount="indefinite"/>}
      <line x1="56" y1="104" x2="304" y2="104" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round"/>
      <path d="M180 92 L188 104 L180 116 L172 104 Z" fill={BRIGHT}/>
      {[{ x: 70, label: [history] }, { x: 290, label: checks }].map(({ x, label }, side) => <g key={side}>
        <line x1={x} y1="104" x2={x - 30} y2="156" stroke={GOLD} strokeOpacity="0.7"/><line x1={x} y1="104" x2={x + 30} y2="156" stroke={GOLD} strokeOpacity="0.7"/>
        <path d={`M${x - 40} 156 Q${x} 178 ${x + 40} 156 Z`} fill="url(#tk-bronze)" stroke={BRIGHT} strokeOpacity="0.5"/>
        {label.map((t, i) => <text key={t} x={x} y={198 + i * 18} textAnchor="middle" className="tk-label">{t}</text>)}
        {side === 0 && <g transform={`translate(${x} 146)`}>{/* commits on a branch */}
          <path d="M-18 0 L18 0 M-6 0 Q0 -10 8 -10 L18 -10" fill="none" stroke={LAPIS} strokeWidth="1.4"/>
          {[-18, -6, 6, 18].map(cx => <circle key={cx} cx={cx} cy="0" r="2.6" fill={LAPIS}/>)}<circle cx="18" cy="-10" r="2.6" fill={ROSE}/>
        </g>}
        {side === 1 && <g transform={`translate(${x} 140)`}>{[-16, 0, 16].map((cx, i) => <path key={cx} d={`M${cx - 5} 2 l4 4 l7 -9`} fill="none" stroke={BRIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {!still && <animate attributeName="opacity" values="0.25;1;1;0.25" keyTimes="0;0.15;0.8;1" dur="9s" begin={`${i * 0.4}s`} repeatCount="indefinite"/>}
        </path>)}</g>}
      </g>)}
    </g>
  </Frame>;
}

export const TOOLKIT_ART = [LanguagesAtlas, CelestialForge, HermesRelay, ScalesOfProof];
