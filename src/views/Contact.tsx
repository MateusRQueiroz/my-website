import { useState, type Ref } from 'react';
import { profile } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { Caduceus } from '../components/ClassicalArt';

export function Contact({ headingRef }: { headingRef: Ref<HTMLHeadingElement> }) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied('done'); }
    catch { setCopied('failed'); }
    window.setTimeout(() => setCopied('idle'), 2400);
  };
  const others = [
    { label: 'LinkedIn', detail: 'Professional profile', href: profile.linkedin, external: true },
    { label: 'GitHub', detail: 'SearchLens, QuizMaker, and more', href: profile.github, external: true },
    { label: 'Resume', detail: 'Download the PDF', href: profile.resume, download: true },
  ];
  return <article className="section-page page-contact">
    <SectionHeader id="contact" headingRef={headingRef} aside={<Caduceus/>} summary="Have an internship, a contract, or a project in mind? Email is the fastest way to reach me."/>
    <div className="letter">
      <a className="letter-email" href={`mailto:${profile.email}`}><span className="sr-only">Email </span>{profile.email}</a>
      <button type="button" className="btn-quiet" onClick={copy}>{copied === 'done' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy address'}</button>
      <span className="sr-only" role="status">{copied === 'done' ? 'Email address copied' : copied === 'failed' ? 'Could not copy the address' : ''}</span>
    </div>
    <ul className="channels">{others.map(o => <li key={o.label}>
      <a href={o.href} download={o.download ? profile.resumeFile : undefined} target={o.external ? '_blank' : undefined} rel={o.external ? 'noopener noreferrer' : undefined}>
        <span className="channel-label">{o.label}</span><span className="channel-detail">{o.detail}</span>
        <span className="channel-arrow" aria-hidden="true">{o.download ? '↓' : '↗'}</span>
      </a>
    </li>)}</ul>
  </article>;
}
