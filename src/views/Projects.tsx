import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { experiments, featuredProjects, type CaseStudy } from '../data/projects';
import { ProjectVisual } from '../components/Schematics';
import { SectionHeader } from '../components/SectionHeader';
import { Armillary, ProjectEmblem } from '../components/ClassicalArt';
import { useReducedMotion } from '../hooks/useReducedMotion';

const QuizDemo = lazy(() => import('../demo/QuizDemo'));
type ProjectId = CaseStudy['id'];
const isProject = (p?: string): p is ProjectId => featuredProjects.some(f => f.id === p);

function ProjectPanel({ project }: { project: CaseStudy }) {
  return <div className="project" role="tabpanel" id={`panel-${project.id}`} aria-labelledby={`tab-${project.id}`}>
    <div className="project-main">
      <p className="project-context">{project.context}</p>
      <h2 id={`${project.id}-title`} className="project-title" tabIndex={-1}>{project.title}</h2>
      <p className="project-tagline">{project.tagline}</p>
      <p className="project-what">{project.what}</p>
      <h3 className="block-title">My part</h3>
      <p className="project-role">{project.role}</p>
      <ul className="built">{project.built.map(b => <li key={b}>{b}</li>)}</ul>
      {project.team && <p className="team-note"><span>Built by teammates:</span> {project.team.join(' · ')}</p>}
      <ul className="chips" aria-label={`${project.title} technologies`}>{project.stack.map(s => <li key={s}>{s}</li>)}</ul>
      <p className="project-links">{project.links.map(l => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span><span className="sr-only"> for {project.title} (opens in a new tab)</span></a>)}</p>
    </div>
    <div className={`project-visual frame-${project.id}`}>
      <p className="frame-head"><span className="frame-emblem" aria-hidden="true"><ProjectEmblem id={project.id}/></span><span>{project.emblem}</span></p>
      <ProjectVisual kind={project.visual}/>
    </div>
    <details className="disclosure project-more">
      <summary><span>How it works · {project.decision.title}</span><span className="disclosure-hint" aria-hidden="true">+</span></summary>
      <dl className="project-detail">
        <div><dt>How it works</dt><dd>{project.how}</dd></div>
        <div><dt>{project.decision.title}</dt><dd>{project.decision.body}</dd></div>
        <div><dt>Where it stands</dt><dd>{project.status}</dd></div>
      </dl>
    </details>
  </div>;
}

export function Projects({ headingRef, project }: { headingRef: Ref<HTMLHeadingElement>; project?: string }) {
  const [active, setActive] = useState<ProjectId>(isProject(project) ? project : 'searchlens');
  const [quiz, setQuiz] = useState(false);
  const still = useReducedMotion();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => { if (isProject(project)) setActive(project); }, [project]);
  const select = (id: ProjectId, focus = false) => {
    setActive(id);
    history.replaceState(history.state, '', `#/projects/${id}`);
    if (focus) tabs.current[id]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = featuredProjects.length;
    const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (next >= 0) { e.preventDefault(); select(featuredProjects[next].id, true); }
  };
  const current = featuredProjects.find(p => p.id === active)!;
  return <article className="section-page page-projects">
    <SectionHeader id="projects" headingRef={headingRef} aside={<Armillary still={still}/>} summary="Three builds, and what I personally did in each."/>
    <div className="constellation" role="tablist" aria-label="Projects">
      <svg className="constellation-line" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M10 32 Q150 -8 290 32"/></svg>
      {featuredProjects.map((p, i) => <button key={p.id} ref={el => { tabs.current[p.id] = el; }} type="button" role="tab" id={`tab-${p.id}`}
        aria-selected={p.id === active} aria-controls={`panel-${p.id}`} tabIndex={p.id === active ? 0 : -1}
        className="star-tab" onClick={() => select(p.id)} onKeyDown={e => onKey(e, i)}>
        <span className="star-emblem" aria-hidden="true"><ProjectEmblem id={p.id}/></span>
        <span className="star-name">{p.title}</span>
        <span className="star-tag">{p.tagline}</span>
      </button>)}
    </div>
    <ProjectPanel key={current.id} project={current}/>

    <section className="experiments" id="project-experiments" aria-labelledby="experiments-title">
      <h2 id="experiments-title" className="block-title" tabIndex={-1}>Smaller experiments</h2>
      <ul className="experiment-list">{experiments.map(x => <li key={x.id} className="experiment">
        <div className="experiment-row">
          <div>
            <h3>{x.title} <span>{x.context}</span></h3>
            <p>{x.description}</p>
          </div>
          <div className="experiment-actions">
            {x.demo && !quiz && <button type="button" className="btn-quiet" onClick={() => setQuiz(true)}>Try the sample quiz</button>}
            <a href={x.link.href} target="_blank" rel="noopener noreferrer">{x.link.label} <span aria-hidden="true">↗</span><span className="sr-only"> for {x.title} (opens in a new tab)</span></a>
          </div>
        </div>
        {x.demo && quiz && <Suspense fallback={<p role="status">Loading the quiz…</p>}><QuizDemo/></Suspense>}
      </li>)}</ul>
    </section>
  </article>;
}
