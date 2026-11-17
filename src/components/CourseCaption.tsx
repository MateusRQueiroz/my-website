import type { ViewId } from '../lib/routes';
import { DESTINATIONS } from '../data/destinations';

/** Names the destination while the camera sets course and travels, then fades as the page arrives. */
export function CourseCaption({ to, phase }: { to: ViewId; phase: 'aim' | 'travel' }) {
  const d = to in DESTINATIONS ? DESTINATIONS[to as keyof typeof DESTINATIONS] : null;
  if (!d) return null;
  return <div className={`course course-${phase}`} role="status" aria-live="polite">
    <span className="course-rule" aria-hidden="true"/>
    <span className="course-kicker">{phase === 'aim' ? 'Setting course' : 'Arriving'}</span>
    <span className="course-name"><span className="greek" aria-hidden="true">{d.letter}</span> {d.label}</span>
  </div>;
}
