import { useEffect, useState, type KeyboardEvent, type Ref } from 'react';
import { TOOLKIT_ART } from '../components/Toolkit';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { coursework, skillGroups } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { Bust } from '../components/Glyphs';
import { RouteLink } from '../components/RouteLink';

/**
 * The toolkit: each group becomes its own classical scene. The previous scene
 * fades out while the next one assembles, so changes read as a transformation.
 */
function Toolkit() {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const still = useReducedMotion();
  const group = skillGroups[active];
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), 520);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  const choose = (i: number, focus = false) => {
    if (i === active) return;
    setLeaving(active); setActive(i);
    if (focus) document.getElementById(`tab-${i}`)?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = skillGroups.length;
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (active + 1) % n : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (active + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (next >= 0) { e.preventDefault(); choose(next, true); }
  };
  const Art = TOOLKIT_ART[active], Old = leaving !== null ? TOOLKIT_ART[leaving] : null;
  return <section className="toolkit" aria-labelledby="toolkit-title">
    <h2 id="toolkit-title" className="block-title">Toolkit</h2>
    <div className="toolkit-body">
      <div className="toolkit-art">
        {Old && leaving !== null && <div className="toolkit-scene is-leaving" key={`old-${leaving}`}><Old items={skillGroups[leaving].items} still/></div>}
        <div className="toolkit-scene is-entering" key={`art-${active}`}><Art items={group.items} still={still}/></div>
      </div>
      <div className="toolkit-controls">
        <div className="toolkit-tabs" role="tablist" aria-label="Skill groups">
          {skillGroups.map((g, i) => <button key={g.title} type="button" role="tab" id={`tab-${i}`} aria-controls="toolkit-panel" aria-selected={i === active}
            tabIndex={i === active ? 0 : -1} onClick={() => choose(i)} onKeyDown={onKey}>{g.title}</button>)}
        </div>
        <div id="toolkit-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="toolkit-panel" key={active}>
          <ul className="chips">{group.items.map(item => <li key={item}>{item}</li>)}</ul>
          <p className="used-in">{group.usedIn}</p>
        </div>
      </div>
    </div>
  </section>;
}

export function About({ headingRef }: { headingRef: Ref<HTMLHeadingElement> }) {
  return <article className="section-page page-about">
    <SectionHeader id="about" headingRef={headingRef} aside={<Bust/>}
      summary="I’m a computer science student at UMass Amherst. I like problems where the information is messy and the result has to be clear."/>
    <div className="about-lede">
      <p>Most of my work sits between data and the people using it: collecting and cleaning information, designing the tables and routes it lives behind, and building tools that make it easier to explore.</p>
      <p className="about-open">Open to internships, contract work, and collaborations. <RouteLink to={{ view: 'contact' }}>Get in touch →</RouteLink></p>
    </div>
    <Toolkit/>
    <details className="disclosure">
      <summary><span>Coursework</span><span className="disclosure-hint" aria-hidden="true">+</span></summary>
      <div className="course-grid">{coursework.map(group => <div key={group.title}>
        <h3>{group.title} <span>· {group.school}</span></h3>
        <ul>{group.courses.map(c => <li key={c}>{c}</li>)}</ul>
      </div>)}</div>
    </details>
  </article>;
}
