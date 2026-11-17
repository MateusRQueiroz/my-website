import { blurCopy, paintGalaxy, paintGlow, paintHaze, paintMiniGalaxy, paintRays, paintSky } from './paint';
import { distantGalaxies } from './layout';

export type Quality = 'high' | 'low';
export type Painted = Awaited<ReturnType<typeof paint>>;

const pause = () => new Promise<void>(resolve => setTimeout(resolve, 0));

/** Paints every texture once, yielding between steps so input stays responsive. */
async function paint(quality: Quality) {
  const hi = quality === 'high';
  const galaxy = paintGalaxy(hi ? 2048 : 1024); await pause();
  const atmosphere = blurCopy(galaxy, hi ? 512 : 256); await pause();
  const sky = paintSky(hi ? 2048 : 1024); await pause();
  const minis = distantGalaxies().map(g => paintMiniGalaxy(g.seed, g.kind, hi ? 256 : 128)); await pause();
  const haze = [1, 2, 3].map(s => paintHaze(s, hi ? 256 : 128));
  const rays = paintRays(hi ? 512 : 256);
  const glow = paintGlow(128), marker = paintGlow(128, true);
  return { galaxy, atmosphere, sky, minis, haze, rays, glow, marker };
}

const cache = new Map<Quality, Promise<Painted>>();
export function painted(quality: Quality) {
  let p = cache.get(quality);
  if (!p) { p = paint(quality); cache.set(quality, p); }
  return p;
}
