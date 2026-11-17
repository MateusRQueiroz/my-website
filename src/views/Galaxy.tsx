import { useLayoutEffect, useState, type CSSProperties, type Ref } from 'react';
import { RouteLink } from '../components/RouteLink';
import { Glyph } from '../components/Glyphs';
import { DESTINATION_ORDER, destinationPoints, project, shotFor, type DestinationId } from '../universe/layout';
import { bus } from '../universe/bus';
import { profile } from '../data/profile';
import { DESTINATIONS } from '../data/destinations';

function useMarks() {
  const compute = () => {
    const W = window.innerWidth, H = window.innerHeight, shot = shotFor('galaxy', W / H), pts = destinationPoints(W / H);
    return Object.fromEntries(DESTINATION_ORDER.map(id => { const p = project(shot, pts[id], W, H); return [id, { x: p.x, y: p.y, side: p.x > W * 0.55 ? 'left' : 'right' }]; })) as Record<DestinationId, { x: number; y: number; side: string }>;
  };
  const [marks, setMarks] = useState(compute);
  useLayoutEffect(() => { const f = () => setMarks(compute()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return marks;
}

export function Galaxy({ headingRef, revealed, selected }: { headingRef: Ref<HTMLHeadingElement>; revealed: boolean; selected?: string }) {
  const marks = useMarks();
  useLayoutEffect(() => () => bus.set({ hover: null }), []);
  const hover = (id: DestinationId | null) => bus.set({ hover: id });
  return <section className={`view view-galaxy${revealed ? ' is-revealed' : ''}${selected ? ' is-setting-course' : ''}`} aria-labelledby="view-heading">
    <nav aria-label="Destinations in the galaxy" className="marks">
      <ul>{DESTINATION_ORDER.map((id, i) => {
        const d = DESTINATIONS[id], m = marks[id];
        return <li key={id} className={`mark side-${m.side}${selected === id ? ' is-selected' : ''}`} style={{ left: m.x, top: m.y, '--i': i } as CSSProperties}>
          <RouteLink to={{ view: id }} onPointerEnter={() => hover(id)} onPointerLeave={() => hover(null)} onFocus={() => hover(id)} onBlur={() => hover(null)}>
            <span className="medallion" aria-hidden="true"><Glyph id={id}/></span>
            <span className="mark-text">
              <span className="mark-letter greek" aria-hidden="true">{d.letter}</span>
              <span className="mark-label">{d.label}</span>
              <span className="mark-purpose">{d.purpose}</span>
            </span>
          </RouteLink>
        </li>;
      })}</ul>
    </nav>
    <div className="galaxy-plaque">
      <p className="eyebrow">The galaxy</p>
      <h1 id="view-heading" ref={headingRef} tabIndex={-1}>{profile.name}</h1>
      <p className="plaque-role">Software Engineer</p>
      <p className="plaque-hint">Choose a destination to explore.</p>
    </div>
  </section>;
}
