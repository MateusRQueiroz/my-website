export const views = ['home', 'galaxy', 'about', 'projects', 'experience', 'contact'] as const;
export type ViewId = typeof views[number];

export interface Route { view: ViewId; project?: string }

export const destinations: { id: ViewId; label: string; title: string }[] = [
  { id: 'home', label: 'Universe', title: 'Mateus Queiroz — Portfolio' },
  { id: 'galaxy', label: 'Galaxy', title: 'The galaxy — Mateus Queiroz' },
  { id: 'about', label: 'About', title: 'About — Mateus Queiroz' },
  { id: 'projects', label: 'Projects', title: 'Projects — Mateus Queiroz' },
  { id: 'experience', label: 'Experience', title: 'Experience — Mateus Queiroz' },
  { id: 'contact', label: 'Contact', title: 'Contact — Mateus Queiroz' },
];

/** Project case studies that can be linked directly, e.g. #/projects/utrace. */
export const projectAnchors = ['searchlens', 'umarket', 'utrace', 'experiments'] as const;

/** Section anchors from the earlier single-page site, mapped to their new destinations. */
const legacyAnchors: Record<string, Route> = {
  home: { view: 'home' },
  work: { view: 'projects' },
  about: { view: 'about' },
  expertise: { view: 'about' },
  signal: { view: 'about' },
  contact: { view: 'contact' },
};

export function hrefFor(route: Route): string {
  if (route.view === 'home') return '#/';
  return `#/${route.view}${route.project ? `/${route.project}` : ''}`;
}

/**
 * Parses a location hash. `canonical` is set when the address bar should be
 * rewritten (legacy anchors and unknown paths) without adding a history entry.
 */
export function parseHash(hash: string): { route: Route; canonical: string | null } {
  const raw = hash.replace(/^#/, '');
  if (raw === '' || raw === '/') return { route: { view: 'home' }, canonical: null };
  if (!raw.startsWith('/')) {
    const legacy = legacyAnchors[raw.toLowerCase()];
    const route = legacy ?? { view: 'home' as const };
    return { route, canonical: hrefFor(route) };
  }
  const [view, project, ...rest] = raw.slice(1).toLowerCase().split('/').filter(Boolean);
  if (!views.includes(view as ViewId)) return { route: { view: 'home' }, canonical: '#/' };
  const route: Route = { view: view as ViewId };
  if (view === 'projects' && project && projectAnchors.includes(project as typeof projectAnchors[number])) route.project = project;
  const canonical = hrefFor(route);
  return { route, canonical: canonical === `#${raw}` && rest.length === 0 ? null : canonical };
}
