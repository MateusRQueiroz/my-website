import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import type { Move } from './bus';
import type { Quality } from './assets';

// Three.js and the painted textures load as separate chunks; the page never waits for them.
const Scene3D = lazy(() => import('./Scene3D'));
const Still2D = lazy(() => import('./Still2D'));

export function supportsWebGL() {
  if (/[?&]nowebgl/.test(window.location.search)) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

export function detectQuality(): Quality {
  if (/[?&]quality=low/.test(window.location.search)) return 'low';
  if (/[?&]quality=high/.test(window.location.search)) return 'high';
  const small = window.matchMedia('(max-width: 760px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return small || coarse || cores <= 4 || memory <= 4 ? 'low' : 'high';
}

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function UniverseStage({ move, ambient, view, onReady, onArrive }: {
  move: Move; ambient: boolean; view: string; onReady: (mode: 'webgl' | 'still') => void; onArrive: (id: number) => void;
}) {
  const [mode, setMode] = useState<'webgl' | 'still'>(() => (supportsWebGL() ? 'webgl' : 'still'));
  const [quality] = useState(detectQuality);
  const [visible, setVisible] = useState(false);
  const ready3d = useCallback(() => { setVisible(true); onReady('webgl'); }, [onReady]);
  const ready2d = useCallback(() => { setVisible(true); onReady('still'); }, [onReady]);
  return <div className={`stage stage-${view}${visible ? ' is-visible' : ''}`} data-mode={mode} data-quality={quality} aria-hidden="true">
    <div className="stage-placeholder"/>
    <Suspense fallback={null}>
      {mode === 'webgl'
        ? <Boundary onError={() => setMode('still')}><Scene3D move={move} ambient={ambient} quality={quality} onReady={ready3d} onArrive={onArrive}/></Boundary>
        : <Still2D shot={move.shot} onReady={ready2d}/>}
    </Suspense>
    <div className="stage-veil"/>
  </div>;
}
