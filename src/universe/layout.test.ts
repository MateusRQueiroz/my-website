import { describe, expect, it } from 'vitest';
import { DESTINATION_ORDER, INTRO, arcPose, destinationPoints, galaxyFootprint, journeyEase, project, shotFor } from './layout';

const aspects = [1440 / 900, 1280 / 720, 390 / 844, 768 / 1024];

describe('composition', () => {
  it.each(aspects)('keeps every destination on screen in the overview (aspect %f)', aspect => {
    const W = 1000, H = W / aspect, shot = shotFor('galaxy', aspect), pts = destinationPoints(aspect);
    for (const id of DESTINATION_ORDER) {
      const p = project(shot, pts[id], W, H);
      expect(p.visible).toBe(true);
      expect(p.x).toBeGreaterThan(W * 0.05); expect(p.x).toBeLessThan(W * 0.95);
      expect(p.y).toBeGreaterThan(H * 0.1); expect(p.y).toBeLessThan(H * 0.9);
    }
  });

  it.each(aspects)('places the central galaxy fully on screen in the universe (aspect %f)', aspect => {
    const W = 1000, H = W / aspect, box = galaxyFootprint(W, H);
    expect(box.left).toBeGreaterThan(0); expect(box.right).toBeLessThan(W);
    expect(box.top).toBeGreaterThan(H * 0.08); expect(box.bottom).toBeLessThan(H * 0.9);
  });

  it('frames each destination close-up with its marker in the top band', () => {
    for (const aspect of aspects) {
      const W = 1000, H = W / aspect, pts = destinationPoints(aspect);
      for (const id of DESTINATION_ORDER) expect(project(shotFor(id, aspect), pts[id], W, H).y).toBeLessThan(H * 0.42);
    }
  });
});

describe('motion', () => {
  it('eases in and out without overshoot', () => {
    let prev = 0;
    for (let t = 0; t <= 1.0001; t += 0.01) { const s = journeyEase(Math.min(1, t)); expect(s).toBeGreaterThanOrEqual(prev - 1e-9); prev = s; }
    expect(journeyEase(0)).toBe(0); expect(journeyEase(1)).toBe(1);
    expect(journeyEase(0.1)).toBeLessThan(0.05);   // a deliberate start
    expect(journeyEase(0.9)).toBeGreaterThan(0.97); // a long, soft landing
  });

  it('starts and ends the journey exactly on the two shots, so nothing jumps', () => {
    const a = shotFor('universe', 16 / 9), b = shotFor('galaxy', 16 / 9);
    const start = arcPose(a, b, 0), end = arcPose(a, b, 1);
    start.pos.forEach((v, i) => expect(v).toBeCloseTo(a.pos[i], 6));
    end.pos.forEach((v, i) => expect(v).toBeCloseTo(b.pos[i], 6));
  });

  it('gives each title enough time to read and never overlaps them', () => {
    const [one, two] = INTRO.beats;
    expect(one.out - one.in).toBeGreaterThanOrEqual(3000);
    expect(two.out - two.in).toBeGreaterThanOrEqual(3300);
    expect(two.in).toBeGreaterThan(one.out);
    expect(INTRO.title.in).toBeGreaterThan(two.out);
    expect(INTRO.done).toBeGreaterThanOrEqual(INTRO.title.out);
  });
});
