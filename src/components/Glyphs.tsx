import type { DestinationId } from '../universe/layout';

/** Engraved line icons for each destination; they inherit color from CSS. */
export function Glyph({ id }: { id: DestinationId | 'galaxy' | 'universe' }) {
  const common = { viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false };
  switch (id) {
    case 'about': // a classical bust in profile
      return <svg {...common}><path d="M27 9c5 0 8.5 3.6 8.5 8.4 0 2-.6 3.6-1.4 4.8l1.6 3.4-2.6.8.4 3.2c0 1.6-1.4 2.4-3 2.2l-2.6-.4.2 3.6"/><path d="M20 12.5c-2.4 1.4-3.6 4-3.6 7 0 3.4 1.6 6 4 7.4l-.2 6.1"/><path d="M14 40c1.6-3.6 5-5.4 10-5.4s8.4 1.8 10 5.4"/><path d="M12 42h24"/><path d="M21 11.5c1.6-2 4-2.8 6.4-2.4M19.5 15c1-.8 2.2-1.2 3.4-1"/></svg>;
    case 'projects': // three stars joined, inside an orbit
      return <svg {...common}><ellipse cx="24" cy="24" rx="18" ry="9" transform="rotate(-20 24 24)" opacity="0.55"/><path d="M14 30l10-14 10 10"/><path d="M14 27.5l.9 1.9 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill="currentColor"/><circle cx="24" cy="16" r="2.4" fill="currentColor"/><circle cx="34" cy="26" r="2" fill="currentColor"/></svg>;
    case 'experience': // a planet on its orbit: a body of work, in motion
      return <svg {...common}><circle cx="24" cy="24" r="8"/><ellipse cx="24" cy="24" rx="18" ry="6" transform="rotate(-16 24 24)"/><path d="M19 21c1.6-1.6 4-2.2 6-1.6" opacity="0.6"/><circle cx="40" cy="19.4" r="1.6" fill="currentColor"/></svg>;
    case 'contact': // a messenger comet
      return <svg {...common}><circle cx="31" cy="17" r="4.5"/><path d="M27.6 20.2L10 36M29.6 21.4L15 38.5M26.4 18.6L8.6 31.5" opacity="0.7"/><path d="M33 13.5l1.6-1.6M36 17h2" opacity="0.6"/></svg>;
    case 'galaxy':
      return <svg {...common}><path d="M24 24c0-3 2.6-4.6 5-4 3.6.8 4.6 5.4 2 8.6-3.4 4.2-10.6 3.6-13.4-1.4C14 21 18.8 13 26.6 13.4 35.4 14 40 23.4 36 31"/><circle cx="24" cy="24" r="1.6" fill="currentColor"/></svg>;
    case 'universe':
      return <svg {...common}><circle cx="24" cy="24" r="15" opacity="0.5"/><circle cx="24" cy="24" r="3"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/><circle cx="36" cy="32" r="1.2" fill="currentColor"/><circle cx="34" cy="12" r="1" fill="currentColor"/></svg>;
  }
}

/** A small marble bust for the About page: sculptural, softly lit from the galaxy side. */
export function Bust() {
  return <svg className="bust" viewBox="0 0 200 240" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="bust-marble" cx="0.65" cy="0.3" r="0.8"><stop offset="0" stopColor="#fbf8f2"/><stop offset="0.45" stopColor="#e3ddd2"/><stop offset="0.8" stopColor="#a9a1a6"/><stop offset="1" stopColor="#5e5870"/></radialGradient>
      <linearGradient id="bust-plinth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8e2d8"/><stop offset="1" stopColor="#8f8796"/></linearGradient>
      <filter id="bust-veins" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" result="v" values="0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0 0.5  0 0 0 -2.4 1.3"/><feComposite in="v" in2="SourceAlpha" operator="in" result="veins"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="veins"/></feMerge></filter>
    </defs>
    <g filter="url(#bust-veins)">
      {/* head in profile facing the galaxy (right), with a stylized curled fringe */}
      <path d="M112 32c26 2 42 22 42 46 0 10-3 18-7 24l9 16-12 5 2 14c0 8-7 12-15 11l-12-2 1 22H82l-2-26c-14-8-22-24-22-42 0-36 24-70 54-68z" fill="url(#bust-marble)"/>
      <path d="M68 70c-2-22 16-40 40-40 12 0 22 4 30 12-10-2-18 0-24 6-8-6-20-4-24 4-8-2-16 6-14 14-4 0-6 2-8 4z" fill="#d8d1c6"/>
      {[[78, 52], [92, 42], [108, 38], [124, 42], [84, 66], [70, 62]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#e9e3d9" stroke="#b5adb0" strokeWidth="1"/>)}
      <path d="M140 92c3 2 6 2 8 0" fill="none" stroke="#8f8796" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M118 74c4-2 9-2 12 0" fill="none" stroke="#8f8796" strokeWidth="1.6" strokeLinecap="round"/>
      {/* shoulders and plinth */}
      <path d="M40 206c4-22 24-36 52-38h14c28 2 48 16 52 38z" fill="url(#bust-marble)"/>
      <rect x="54" y="206" width="92" height="12" rx="2" fill="url(#bust-plinth)"/>
      <rect x="44" y="218" width="112" height="16" rx="2" fill="url(#bust-plinth)"/>
      <path d="M150 70c4 10 4 22 0 30" fill="none" stroke="#ffe3c2" strokeWidth="2.4" strokeLinecap="round" opacity="0.8"/>
    </g>
  </svg>;
}
