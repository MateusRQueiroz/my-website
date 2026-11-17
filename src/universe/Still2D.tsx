import { useEffect, useRef, useState } from 'react';
import { painted, type Painted } from './assets';
import { DESTINATION_ORDER, GALAXY_RADIUS, destinationPoints, distantGalaxies, project, shotFor, type ShotId, type Vec3 } from './layout';

/**
 * WebGL unavailable: the same painted textures composed as a still for each
 * shot. The galaxy disc is placed with an affine map of three projected
 * points, which is close to the perspective view.
 */
export default function Still2D({ shot, onReady }: { shot: ShotId; onReady: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [art, setArt] = useState<Painted | null>(null);
  // If painting fails (no 2D canvas), the page simply keeps its CSS backdrop.
  useEffect(() => { painted('low').then(setArt).catch(() => onReady()); }, [onReady]);
  useEffect(() => {
    if (!art) return;
    const draw = () => {
      const el = ref.current, g = el?.getContext('2d');
      if (!el || !g) return;
      const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = W * dpr; el.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = shotFor(shot, W / H);
      const sk = art.sky, k = Math.max(W / sk.width, H / (sk.height * 0.6));
      g.fillStyle = '#05060e'; g.fillRect(0, 0, W, H);
      g.drawImage(sk, 0, sk.height * 0.2, sk.width, sk.height * 0.6, (W - sk.width * k) / 2, 0, sk.width * k, sk.height * 0.6 * k);
      g.globalCompositeOperation = 'lighter';
      distantGalaxies().forEach((d, i) => {
        const p = project(s, d.pos, W, H); if (!p.visible) return;
        const edge = project(s, [d.pos[0] + d.size, d.pos[1], d.pos[2]], W, H), r = Math.abs(edge.x - p.x) + 6;
        g.globalAlpha = 0.85; g.drawImage(art.minis[i], p.x - r, p.y - r * 0.6, r * 2, r * 1.2);
      });
      // Galaxy disc: map the painted square onto the projected disc.
      const span = GALAXY_RADIUS / 0.47;
      const c = project(s, [0, 0, 0], W, H), ex = project(s, [span, 0, 0], W, H), ez = project(s, [0, 0, span], W, H);
      if (c.visible) {
        g.save();
        g.setTransform(dpr * (ex.x - c.x), dpr * (ex.y - c.y), dpr * (ez.x - c.x), dpr * (ez.y - c.y), dpr * c.x, dpr * c.y);
        g.globalAlpha = 0.5; g.drawImage(art.atmosphere, -1.3, -1.3, 2.6, 2.6);
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.drawImage(art.galaxy, -1, -1, 2, 2);
        g.restore();
        g.globalCompositeOperation = 'lighter';
        const unit = Math.hypot(ex.x - c.x, ex.y - c.y) / span;
        g.globalAlpha = 0.35; g.drawImage(art.rays, c.x - unit * 8, c.y - unit * 8, unit * 16, unit * 16);
        g.globalAlpha = 0.8; g.drawImage(art.glow, c.x - unit * 1.8, c.y - unit * 1.3, unit * 3.6, unit * 2.6);
      }
      // Engraved rings and, near the galaxy, the destination orbits.
      const ring = (radius: number, alpha: number) => {
        g.beginPath();
        for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2, p = project(s, [Math.cos(a) * radius, 0, Math.sin(a) * radius] as Vec3, W, H); if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); }
        g.globalAlpha = alpha; g.strokeStyle = '#dcb575'; g.lineWidth = 1; g.stroke();
      };
      g.globalCompositeOperation = 'source-over';
      if (shot === 'universe') { ring(GALAXY_RADIUS * 1.12, 0.35); ring(GALAXY_RADIUS * 1.2, 0.3); }
      else {
        const pts = destinationPoints(W / H);
        DESTINATION_ORDER.forEach(id => ring(Math.hypot(pts[id][0], pts[id][2]), 0.16));
        g.globalCompositeOperation = 'lighter';
        DESTINATION_ORDER.forEach(id => { const p = project(s, pts[id], W, H); g.globalAlpha = 0.8; g.drawImage(art.marker, p.x - 16, p.y - 16, 32, 32); });
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    };
    draw();
    onReady();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [art, shot, onReady]);
  return <canvas ref={ref} className="universe-canvas" aria-hidden="true"/>;
}
