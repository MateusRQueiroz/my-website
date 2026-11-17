import { describe, expect, it } from 'vitest';
import { getMoodId, isThemeChoice } from './moods';
describe('time-of-day boundaries', () => {
  it.each([[0,'night'],[4,'night'],[5,'dawn'],[7,'dawn'],[8,'morning'],[10,'morning'],[11,'midday'],[13,'midday'],[14,'afternoon'],[17,'afternoon'],[18,'evening'],[21,'evening'],[22,'night'],[23,'night']] as const)('maps hour %i to %s', (hour,mood) => expect(getMoodId(hour)).toBe(mood));
  it('rejects invalid saved themes', () => {expect(isThemeChoice('auto')).toBe(true);expect(isThemeChoice('night')).toBe(true);expect(isThemeChoice('invalid')).toBe(false);expect(isThemeChoice(null)).toBe(false);});
});
