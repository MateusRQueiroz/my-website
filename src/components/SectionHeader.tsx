import type { ReactNode, Ref } from 'react';
import type { DestinationId } from '../universe/layout';
import { Glyph } from './Glyphs';
import { DESTINATIONS } from '../data/destinations';

/** The opening of every section: engraved medallion, Greek index, title, and one-line summary. */
export function SectionHeader({ id, headingRef, summary, aside }: { id: DestinationId; headingRef: Ref<HTMLHeadingElement>; summary: ReactNode; aside?: ReactNode }) {
  const d = DESTINATIONS[id];
  return <header className="section-head">
    <div className="section-head-main">
      <p className="eyebrow"><span className="medallion medallion-sm" aria-hidden="true"><Glyph id={id}/></span><span className="greek" aria-hidden="true">{d.letter}</span> Destination</p>
      <h1 id="view-heading" ref={headingRef} tabIndex={-1}>{d.label}</h1>
      <p className="section-summary">{summary}</p>
    </div>
    {aside && <div className="section-head-aside">{aside}</div>}
  </header>;
}
