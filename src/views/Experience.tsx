import type { Ref } from 'react';
import { experience } from '../data/experience';
import { profile } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { ArgoNavis } from '../components/ClassicalArt';
import { RouteLink } from '../components/RouteLink';

/** A short voyage log: stops on an engraved line, details on request. */
export function Experience({ headingRef }: { headingRef: Ref<HTMLHeadingElement> }) {
  return <article className="section-page page-experience">
    <SectionHeader id="experience" headingRef={headingRef} aside={<ArgoNavis/>} summary="Contract work, and where I study."/>
    <ol className="voyage">
      {experience.map(item => <li key={item.id} className="stop">
        <span className="stop-node" aria-hidden="true"/>
        <p className="stop-when">{item.period}</p>
        <h2 className="stop-title">{item.organization}</h2>
        <p className="stop-role">{item.role}</p>
        <p className="stop-summary">{item.summary}</p>
        <ul className="chips" aria-label="Technologies">{item.stack.map(s => <li key={s}>{s}</li>)}</ul>
        <details className="disclosure">
          <summary><span>The brief and what I delivered</span><span className="disclosure-hint" aria-hidden="true">+</span></summary>
          <div className="stop-detail">
            <div><h3 className="block-title">The brief</h3><p>{item.brief}</p></div>
            <div><h3 className="block-title">Delivered</h3><ul className="built">{item.delivered.map(d => <li key={d}>{d}</li>)}</ul></div>
          </div>
        </details>
      </li>)}
      <li className="stop stop-education">
        <span className="stop-node" aria-hidden="true"/>
        <p className="stop-when">Current</p>
        <h2 className="stop-title">UMass Amherst</h2>
        <p className="stop-role">Computer science student</p>
        <p className="stop-summary">Coursework in data structures, algorithms, software engineering, and computer systems. <RouteLink to={{ view: 'about' }}>See the list →</RouteLink></p>
      </li>
    </ol>
    <p className="page-aside">Team and independent builds are under <RouteLink to={{ view: 'projects' }}>Projects</RouteLink>. The full history is in my <a href={profile.resume} download={profile.resumeFile}>resume (PDF)</a>.</p>
  </article>;
}
