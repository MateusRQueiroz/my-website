/*
 * Section illustrations and project emblems in one engraved language:
 * gold hairlines, marble and bronze fills, light from the upper right.
 */
const G = '#dcb575', B = '#f2d39a';

function SharedDefs({ id }: { id: string }) {
  return <defs>
    <radialGradient id={`${id}-marble`} cx="0.65" cy="0.3" r="0.85"><stop offset="0" stopColor="#fdfaf4"/><stop offset="0.5" stopColor="#ddd6cb"/><stop offset="1" stopColor="#7f7790"/></radialGradient>
    <linearGradient id={`${id}-bronze`} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0d7a2"/><stop offset="0.5" stopColor="#a8834f"/><stop offset="1" stopColor="#3f3222"/></linearGradient>
    <radialGradient id={`${id}-glow`}><stop offset="0" stopColor={B} stopOpacity="0.75"/><stop offset="1" stopColor={B} stopOpacity="0"/></radialGradient>
  </defs>;
}

/** Projects: an armillary sphere, slowly turning. */
export function Armillary({ still }: { still?: boolean }) {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180, inner = i % 3 ? 68 : 64;
    return <line key={i} x1={100 + Math.cos(a) * 72} y1={96 + Math.sin(a) * 72} x2={100 + Math.cos(a) * inner} y2={96 + Math.sin(a) * inner} stroke={G} strokeOpacity="0.7"/>;
  });
  const bodies: [number, number][] = [[-20, 0.3], [30, 0.8], [-60, 0.55]];
  return <svg className="section-art" viewBox="0 0 200 220" aria-hidden="true" focusable="false">
    <SharedDefs id="arm"/>
    <circle cx="100" cy="96" r="18" fill="url(#arm-glow)"/>
    <circle cx="100" cy="96" r="7" fill={B}/>
    <g>
      {!still && <animateTransform attributeName="transform" type="rotate" from="0 100 96" to="360 100 96" dur="80s" repeatCount="indefinite"/>}
      <circle cx="100" cy="96" r="72" fill="none" stroke={G} strokeOpacity="0.75"/>
      <ellipse cx="100" cy="96" rx="72" ry="22" fill="none" stroke={G} strokeWidth="1.4" transform="rotate(-23 100 96)"/>
      <ellipse cx="100" cy="96" rx="22" ry="72" fill="none" stroke={G} strokeOpacity="0.6"/>
      <ellipse cx="100" cy="96" rx="72" ry="10" fill="none" stroke={B} strokeOpacity="0.5" strokeDasharray="2 3"/>
      {ticks}
      {bodies.map(([d, t]) => { const a = (d * Math.PI) / 180; return <circle key={d} cx={100 + Math.cos(a) * 72 * t} cy={96 + Math.sin(a) * 22 * t} r="3.4" fill="url(#arm-marble)" stroke={G}/>; })}
    </g>
    <path d="M100 168 L100 186 M84 200 L116 200 L108 186 L92 186 Z" fill="url(#arm-bronze)" stroke={G} strokeOpacity="0.8"/>
    <rect x="70" y="200" width="60" height="10" rx="2" fill="url(#arm-marble)" stroke={G} strokeOpacity="0.5"/>
  </svg>;
}

/** Experience: Argo Navis, the ship among the stars, as a voyage log's emblem. */
export function ArgoNavis() {
  const stars: [number, number][] = [[30, 120], [62, 132], [98, 136], [134, 128], [166, 110], [150, 80], [118, 62], [96, 40], [72, 74]];
  return <svg className="section-art" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <SharedDefs id="argo"/>
    <circle cx="100" cy="100" r="92" fill="none" stroke={G} strokeOpacity="0.35"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke={G} strokeOpacity="0.25" strokeDasharray="1 4"/>
    <path d="M24 122 C 60 150, 140 150, 176 108 L 150 112 C 120 128, 70 130, 36 118 Z" fill="url(#argo-bronze)" opacity="0.45" stroke={G} strokeOpacity="0.6"/>
    <path d="M96 128 L96 40 M96 44 C 124 58, 132 84, 128 112 M96 50 C 76 62, 70 86, 74 110" fill="none" stroke={G} strokeOpacity="0.55"/>
    <path d="M101 52 Q131 74 124 107 Q111 102 101 113 Z" fill="url(#argo-marble)" opacity="0.48"/>
    <path d="M91 57 Q74 78 78 105 L91 112 Z" fill="url(#argo-marble)" opacity="0.25"/>
    <path d="M44 150 Q100 166 157 144 M60 161 Q102 173 139 158" fill="none" stroke={G} strokeOpacity="0.25"/>
    <polyline points={stars.map(p => p.join(',')).join(' ')} fill="none" stroke={B} strokeOpacity="0.85"/>
    {stars.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 7 ? 4 : 2.6} fill="#fff3da"/>)}
    <circle cx="96" cy="40" r="10" fill="url(#argo-glow)"/>
    <text x="100" y="180" textAnchor="middle" className="art-caption">Argo Navis</text>
  </svg>;
}

/** Contact: Hermes' winged caduceus, the messenger's staff. */
export function Caduceus() {
  return <svg className="section-art" viewBox="0 0 200 220" aria-hidden="true" focusable="false">
    <SharedDefs id="cad"/>
    <circle cx="100" cy="64" r="34" fill="url(#cad-glow)" opacity="0.6"/>
    {[-1, 1].map(s => <g key={s} transform={`translate(100 0) scale(${s} 1)`}>
      <path d="M8 58 C 30 34, 66 28, 88 40 C 70 42, 56 48, 46 56 C 64 54, 76 58, 84 66 C 66 66, 52 68, 40 74 C 52 74, 60 80, 64 88 C 42 84, 22 76, 8 66 Z" fill="url(#cad-marble)" stroke={G} strokeOpacity="0.8"/>
      <path d="M20 58 C 40 48, 60 44, 76 46 M26 66 C 44 62, 56 62, 70 66" fill="none" stroke="#8f8798" strokeOpacity="0.6"/>
    </g>)}
    <line x1="100" y1="40" x2="100" y2="200" stroke="url(#cad-bronze)" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="100" cy="36" r="8" fill="url(#cad-bronze)" stroke={B}/>
    <path d="M100 82 C 124 92, 124 112, 100 122 C 76 132, 76 152, 100 162 C 120 170, 120 184, 104 192 M100 82 C 76 92, 76 112, 100 122 C 124 132, 124 152, 100 162 C 80 170, 80 184, 96 192" fill="none" stroke={B} strokeWidth="2.4" strokeLinecap="round"/>
  </svg>;
}

/** Project emblems: a mythic image for what each project does. */
export function ProjectEmblem({ id }: { id: 'searchlens' | 'umarket' | 'utrace' }) {
  const common = { viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, focusable: false };
  if (id === 'searchlens') { // Argus, the many-eyed watcher
    const eyes = [0, 60, 120, 180, 240, 300].map(a => { const r = (a * Math.PI) / 180; return <circle key={a} cx={24 + Math.cos(r) * 19} cy={24 + Math.sin(r) * 19} r="1.4" fill="currentColor"/>; });
    return <svg {...common} aria-hidden="true"><path d="M8 24c4.6-6 10-9 16-9s11.4 3 16 9c-4.6 6-10 9-16 9s-11.4-3-16-9z"/><circle cx="24" cy="24" r="5.4"/><circle cx="24" cy="24" r="1.8" fill="currentColor"/>{eyes}</svg>;
  }
  if (id === 'umarket') // the agora: a colonnade under the stars
    return <svg {...common} aria-hidden="true"><path d="M8 18L24 9l16 9z"/><path d="M10 20h28M11 38h26M9 41h30"/>{[13, 19.5, 26, 32.5].map(x => <path key={x} d={`M${x} 21v16`}/>)}<circle cx="36" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="7" r="1" fill="currentColor"/></svg>;
  return <svg {...common} aria-hidden="true">{/* Ariadne's thread through a labyrinth, to a star */}
    <circle cx="24" cy="24" r="18" opacity="0.5"/><path d="M24 12a12 12 0 1 1-12 12" opacity="0.5"/><path d="M24 18a6 6 0 1 0 6 6" opacity="0.5"/>
    <path d="M6 24c4 0 4-6 9-6s4 8 9 6 2-6 6-6" strokeWidth="1.8"/><circle cx="31" cy="18" r="2.2" fill="currentColor"/>
  </svg>;
}
