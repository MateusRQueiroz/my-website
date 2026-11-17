import type { CSSProperties, Ref } from 'react';
import { INTRO } from '../universe/layout';
import { intro, profile } from '../data/profile';

/**
 * Opening-credit titles timed to the journey. Each beat fades in, holds long
 * enough to read, and fades out before the next; only one is ever on screen.
 */
export function IntroTitles({ onSkip, skipRef }: { onSkip: () => void; skipRef: Ref<HTMLButtonElement> }) {
  const [first, second] = intro.split(/(?<=\.)\s+/);
  const beat = (start: number, end: number): CSSProperties => ({ '--in': `${start}ms`, '--hold': `${end - start}ms` } as CSSProperties);
  return <div className="intro">
    <div className="intro-stage" aria-live="polite">
      <p className="intro-beat" style={beat(INTRO.beats[0].in, INTRO.beats[0].out)}>{first}</p>
      <p className="intro-beat" style={beat(INTRO.beats[1].in, INTRO.beats[1].out)}>{second}</p>
      <div className="intro-title" style={beat(INTRO.title.in, INTRO.title.out)}>
        <p className="intro-name">{profile.name}</p>
        <p className="intro-role">Software Engineer</p>
      </div>
    </div>
    <button ref={skipRef} type="button" className="skip-intro" onClick={onSkip}>Skip intro <span aria-hidden="true">→</span></button>
  </div>;
}
