import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './routes';

describe('hash routes', () => {
  it.each([
    ['', 'home', undefined, null],
    ['#/', 'home', undefined, null],
    ['#/galaxy', 'galaxy', undefined, null],
    ['#/about', 'about', undefined, null],
    ['#/projects', 'projects', undefined, null],
    ['#/projects/utrace', 'projects', 'utrace', null],
    ['#/experience', 'experience', undefined, null],
    ['#/contact', 'contact', undefined, null],
  ])('parses %s', (hash, view, project, canonical) => {
    expect(parseHash(hash)).toEqual({ route: project ? { view, project } : { view }, canonical });
  });

  it.each([
    ['#work', 'projects', '#/projects'],
    ['#about', 'about', '#/about'],
    ['#expertise', 'about', '#/about'],
    ['#signal', 'about', '#/about'],
    ['#contact', 'contact', '#/contact'],
    ['#home', 'home', '#/'],
  ])('maps the old section link %s', (hash, view, canonical) => {
    expect(parseHash(hash)).toEqual({ route: { view }, canonical });
  });

  it('falls back safely for unknown paths and projects', () => {
    expect(parseHash('#/nowhere')).toEqual({ route: { view: 'home' }, canonical: '#/' });
    expect(parseHash('#/projects/unknown')).toEqual({ route: { view: 'projects' }, canonical: '#/projects' });
    expect(parseHash('#/About')).toEqual({ route: { view: 'about' }, canonical: '#/about' });
  });

  it('builds links', () => {
    expect(hrefFor({ view: 'home' })).toBe('#/');
    expect(hrefFor({ view: 'projects', project: 'searchlens' })).toBe('#/projects/searchlens');
  });
});
