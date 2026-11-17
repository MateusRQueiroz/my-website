import { useEffect, useRef, useState } from 'react';
import type { ViewId } from '../lib/routes';
import { profile } from '../data/profile';
import { RouteLink } from './RouteLink';
import { Glyph } from './Glyphs';

const places: { id: ViewId; label: string }[] = [{ id: 'home', label: 'Universe' }, { id: 'galaxy', label: 'Galaxy' }];
const sections: { id: ViewId; label: string }[] = [{ id: 'about', label: 'About' }, { id: 'projects', label: 'Projects' }, { id: 'experience', label: 'Experience' }, { id: 'contact', label: 'Contact' }];

function Links({ active, onPick }: { active: ViewId; onPick?: () => void }) {
  const item = (l: { id: ViewId; label: string }, glyph?: boolean) => <li key={l.id}>
    <RouteLink to={{ view: l.id }} aria-current={active === l.id ? 'page' : undefined} onClick={onPick} className={glyph ? 'nav-place' : undefined}>
      {glyph && <span className="nav-glyph"><Glyph id={l.id === 'home' ? 'universe' : 'galaxy'}/></span>}{l.label}
    </RouteLink>
  </li>;
  return <>
    <ul className="nav-group nav-places">{places.map(l => item(l, true))}</ul>
    <span className="nav-divider" aria-hidden="true"/>
    <ul className="nav-group">{sections.map(l => item(l))}</ul>
  </>;
}

export function NavBar({ active }: { active: ViewId }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null), bar = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); }, [active]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!bar.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open]);
  return <header className="navbar" ref={bar}>
    <RouteLink to={{ view: 'home' }} className="nav-brand" aria-label="Mateus Queiroz, back to the universe">
      <span className="brand-mark" aria-hidden="true"><Glyph id="galaxy"/></span>
      <span className="brand-name">Mateus Queiroz</span>
    </RouteLink>
    <nav className="nav-main" aria-label="Portfolio"><Links active={active}/></nav>
    <a className="nav-resume" href={profile.resume} download={profile.resumeFile}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Resume
    </a>
    <button ref={toggle} type="button" className="nav-toggle" aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen(v => !v)}>
      <span className="toggle-bars" aria-hidden="true"/><span>Menu</span>
    </button>
    <div id="nav-sheet" className="nav-sheet" hidden={!open}>
      <nav aria-label="Portfolio (menu)"><Links active={active} onPick={() => setOpen(false)}/></nav>
    </div>
  </header>;
}
