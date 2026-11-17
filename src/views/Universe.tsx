import { useLayoutEffect, useState, type Ref } from 'react';
import { galaxyFootprint } from '../universe/layout';
import { bus } from '../universe/bus';

/**
 * The opening: no copy competing with the scene. The central galaxy is the
 * one interactive object, announced by an engraved ring and a quiet label.
 */
export function Universe({ headingRef, onEnter }: { headingRef: Ref<HTMLHeadingElement>; onEnter: () => void }) {
  const [box, setBox] = useState(() => galaxyFootprint(window.innerWidth, window.innerHeight));
  useLayoutEffect(() => {
    const onResize = () => setBox(galaxyFootprint(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); bus.set({ galaxyHover: false }); };
  }, []);
  const pad = 18, w = box.right - box.left + pad * 2, h = box.bottom - box.top + pad * 2;
  const hover = (on: boolean) => bus.set({ galaxyHover: on });
  return <section className="view view-universe" aria-labelledby="view-heading">
    <h1 id="view-heading" ref={headingRef} tabIndex={-1} className="sr-only">Mateus Queiroz, portfolio</h1>
    <button type="button" className="galaxy-target" onClick={onEnter}
      style={{ left: box.left - pad, top: box.top - pad, width: w, height: h }}
      onPointerEnter={() => hover(true)} onPointerLeave={() => hover(false)} onFocus={() => hover(true)} onBlur={() => hover(false)}>
      <span className="sr-only">Enter the galaxy and begin the introduction</span>
      <span className="target-ring" aria-hidden="true"/>
    </button>
    <p className="galaxy-epigraph" style={{ left: box.cx, top: box.top - 56 }}>Beyond the known, there is more to discover.</p>
    <div className="galaxy-cue" style={{ left: box.cx, top: box.bottom + 26 }} aria-hidden="true">
      <span className="cue-line"/>
      <span className="cue-label">Enter the galaxy</span>
    </div>
    <p className="universe-note">A portfolio by <strong>Mateus Queiroz</strong>. Select the galaxy to begin, or go straight to a section from the menu.</p>
  </section>;
}
