import type { DestinationId, ShotId } from './layout';

/**
 * Tiny shared state between the HTML layer and the scene. The scene renders
 * on demand, so every change asks it for a fresh frame.
 */
export type Move = { id: number; shot: ShotId; kind: 'journey' | 'glide' | 'cut'; duration?: number };

interface BusState { hover: DestinationId | null; selected: DestinationId | null; galaxyHover: boolean; reveal: boolean }
const listeners = new Set<() => void>();
export const bus: BusState & { set: (patch: Partial<BusState>) => void; subscribe: (fn: () => void) => () => void } = {
  hover: null, selected: null, galaxyHover: false, reveal: false,
  set(patch) { Object.assign(bus, patch); listeners.forEach(fn => fn()); },
  subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};
