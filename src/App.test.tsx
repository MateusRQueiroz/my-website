import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App, { introStorageKey } from './App';

const go = (hash: string) => act(() => { window.location.hash = hash; });
const nav = () => screen.getByRole('navigation', { name: 'Portfolio' });

describe('the universe', () => {
  it('opens with the galaxy as the one interactive object, plus direct navigation and the resume', () => {
    render(<App/>);
    expect(screen.getByRole('button', { name: /Enter the galaxy/ })).toBeVisible();
    expect(within(nav()).getAllByRole('link').map(l => l.textContent)).toEqual(['Universe', 'Galaxy', 'About', 'Projects', 'Experience', 'Contact']);
    const resume = screen.getAllByRole('link', { name: /Resume/ })[0];
    expect(resume).toHaveAttribute('href', expect.stringMatching(/resume\.pdf$/));
    expect(resume).toHaveAttribute('download');
    // The introduction does not start on its own.
    expect(screen.queryByRole('button', { name: /Skip intro/ })).not.toBeInTheDocument();
  });

  it('plays the introduction once when the galaxy is selected, and Skip intro lands on the overview', async () => {
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('button', { name: /Enter the galaxy/ }));
    const skip = await screen.findByRole('button', { name: /Skip intro/ });
    expect(skip).toHaveFocus();
    expect(screen.getByText('I’m Mateus, a computer science student at UMass Amherst.')).toBeInTheDocument();
    expect(screen.getByText('I build data pipelines, web apps, and tools for exploring complex information.')).toBeInTheDocument();
    expect(within(document.querySelector('.intro') as HTMLElement).getByText('Software Engineer')).toBeInTheDocument();
    await user.click(skip);
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toHaveFocus());
    expect(sessionStorage.getItem(introStorageKey)).toBe('1');
    const marks = within(screen.getByRole('navigation', { name: 'Destinations in the galaxy' })).getAllByRole('link');
    expect(marks.map(l => l.getAttribute('href'))).toEqual(['#/about', '#/projects', '#/experience', '#/contact']);
    expect(marks[1]).toHaveAccessibleName(/Projects.*SearchLens, UMarket, and UTrace/);
  });

  it('finishes the introduction on its own', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App/>);
      await user.click(screen.getByRole('button', { name: /Enter the galaxy/ }));
      expect(await screen.findByRole('button', { name: /Skip intro/ })).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(14000); });
      expect(screen.queryByRole('button', { name: /Skip intro/ })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toHaveFocus();
    } finally { vi.useRealTimers(); }
  });

  it('does not replay the introduction later in the session, or on routine navigation', async () => {
    sessionStorage.setItem(introStorageKey, '1');
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('button', { name: /Enter the galaxy/ }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toHaveFocus());
    expect(screen.queryByRole('button', { name: /Skip intro/ })).not.toBeInTheDocument();
  });
});

describe('sections', () => {
  it('jumps straight to a section from the navigation, without the cinematic sequence', async () => {
    const user = userEvent.setup();
    render(<App/>);
    await user.click(within(nav()).getByRole('link', { name: 'Projects' }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toHaveFocus());
    expect(screen.queryByRole('button', { name: /Skip intro/ })).not.toBeInTheDocument();
    expect(within(nav()).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
  });

  it('opens direct links, rewrites old anchors, and follows history', async () => {
    history.replaceState(null, '', '/#/experience');
    render(<App/>);
    expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'RQ Best Prices' })).toBeVisible();
    expect(screen.getByText('Contract Website Developer')).toBeVisible();
    expect(document.title).toBe('Experience — Mateus Queiroz');
    go('#/galaxy');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toHaveFocus());
    go('#work');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible());
    expect(window.location.hash).toBe('#/projects');
  });

  it('shows one project at a time, with keyboard tabs and deep links', async () => {
    history.replaceState(null, '', '/#/projects/umarket');
    const user = userEvent.setup();
    render(<App/>);
    const tabs = screen.getByRole('tablist', { name: 'Projects' });
    expect(within(tabs).getByRole('tab', { name: /UMarket/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Built by teammates/)).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'UMarket' })).toBeVisible();
    within(tabs).getByRole('tab', { name: /UMarket/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(tabs).getByRole('tab', { name: /UTrace/ })).toHaveFocus();
    expect(screen.getByRole('heading', { level: 2, name: 'UTrace' })).toBeVisible();
    expect(window.location.hash).toBe('#/projects/utrace');
    expect(screen.getByRole('link', { name: /Repository for UTrace/ })).toHaveAttribute('href', 'https://github.com/RichardCarlson3/Trace');
  });

  it('keeps details optional and copies the email address', async () => {
    history.replaceState(null, '', '/#/contact');
    const user = userEvent.setup();
    // user-event installs its own clipboard; replace it after setup.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<App/>);
    expect(screen.getByRole('link', { name: /romaomatq@gmail\.com/ })).toHaveAttribute('href', 'mailto:romaomatq@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Copy address' }));
    expect(writeText).toHaveBeenCalledWith('romaomatq@gmail.com');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeVisible();
  });

  it('keeps the skip link separate from routing, and the mobile menu dismissible', async () => {
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('link', { name: 'Skip to content' }));
    expect(document.getElementById('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('navigation', { name: 'Portfolio (menu)' })).getAllByRole('link')).toHaveLength(6);
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});
