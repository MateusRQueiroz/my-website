import { useEffect, useState } from 'react';
import UniverseCanvas, { type UniverseCanvasProps } from './UniverseCanvas';
import { painted, type Painted } from './assets';

/** Paints the textures, then mounts the WebGL scene. */
export default function Scene3D(props: Omit<UniverseCanvasProps, 'art'>) {
  const [art, setArt] = useState<Painted | null>(null);
  useEffect(() => { let alive = true; painted(props.quality).then(a => { if (alive) setArt(a); }).catch(() => props.onReady()); return () => { alive = false; }; }, [props.quality]);
  return art ? <UniverseCanvas {...props} art={art}/> : null;
}
