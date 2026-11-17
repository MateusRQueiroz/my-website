import { useState, useSyncExternalStore } from 'react';
import { art } from '../data/art';
import { bus } from '../universe/bus';
import { Astronaut } from './Astronaut';

/**
 * Responsive painted artwork. The original vector is only an asset-load fallback.
 */
export function Figure({ departing }: { departing: boolean }) {
  const reaching = useSyncExternalStore(bus.subscribe, () => bus.galaxyHover);
  const [failed, setFailed] = useState(false);
  if (failed) return <Astronaut departing={departing}/>;
  return <img
    className={`astronaut astronaut-art${reaching ? ' is-reaching' : ''}${departing ? ' is-departing' : ''}`}
    src={`${import.meta.env.BASE_URL}${art.astronaut}`} alt="" aria-hidden="true" decoding="async"
    srcSet={`${import.meta.env.BASE_URL}${art.astronautSmall} 800w, ${import.meta.env.BASE_URL}${art.astronaut} 1280w`}
    sizes="(max-aspect-ratio: 9/10) 118vw, (max-width: 1100px) 68vw, 76vh"
    fetchPriority="high" onError={() => setFailed(true)} width={1280} height={1280}
  />;
}
