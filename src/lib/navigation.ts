/**
 * Records that the next hash change was started by a click inside the site,
 * as opposed to Back/Forward or a typed URL. The signature flight only plays
 * for in-site navigation from Home to About.
 */
let intent: { at: number } | null = null;

export function markClickNavigation() { intent = { at: Date.now() }; }

export function consumeClickNavigation(): boolean {
  const recent = intent !== null && Date.now() - intent.at < 1000;
  intent = null;
  return recent;
}
