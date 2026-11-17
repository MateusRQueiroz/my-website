import type { DestinationId } from '../universe/layout';

/** What each destination holds, said before anyone selects it. Greek letters number them in order. */
export const DESTINATIONS: Record<DestinationId, { label: string; purpose: string; letter: string }> = {
  about: { label: 'About', purpose: 'Who I am and the tools I use', letter: 'α' },
  projects: { label: 'Projects', purpose: 'SearchLens, UMarket, and UTrace', letter: 'β' },
  experience: { label: 'Experience', purpose: 'Contract web work for RQ Best Prices', letter: 'γ' },
  contact: { label: 'Contact', purpose: 'Email, LinkedIn, GitHub, and resume', letter: 'δ' },
};
