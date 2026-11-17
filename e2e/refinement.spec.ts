import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const ready = (page: Page) => page.waitForFunction(() => document.querySelector('.app')?.getAttribute('data-scene') === 'webgl', null, { timeout: 90000 });
const nav = (page: Page) => page.getByRole('navigation', { name: 'Portfolio' });
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

test('Back during the selection hold cancels the old destination, and Forward still works', async ({ page }) => {
  await page.goto('/#/galaxy'); await ready(page);
  await nav(page).getByRole('link', { name: 'Projects' }).click();
  await expect(page.locator('.course-aim')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.course')).toHaveCount(0);
  await page.waitForTimeout(4200);
  await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeVisible();
  await expect(page).toHaveURL(/#\/galaxy$/);
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeFocused({ timeout: 10000 });
});

test('interrupted flight keeps the unvisited page hidden, lightens the veil, and focuses the final destination', async ({ page }) => {
  await page.goto('/#/galaxy'); await ready(page);
  await nav(page).getByRole('link', { name: 'About' }).click();
  await expect(page.locator('.course-travel')).toBeVisible();
  await expect(page.locator('.view-frame')).toHaveAttribute('inert', '');
  await expect.poll(() => page.locator('.stage-veil').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(0.2);
  await nav(page).getByRole('link', { name: 'Contact' }).click();
  await expect(page.locator('.view-frame')).toHaveCSS('visibility', 'hidden');
  await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeFocused({ timeout: 10000 });
  await expect(page.locator('.course')).toHaveCount(0);
  await expect(page.locator('.view-frame')).not.toHaveAttribute('inert');
  await expect(page.locator('.stage-veil')).toHaveCSS('opacity', '1');
});

test('toolkit keyboard selection preserves the real skills and reduced motion stops the mechanisms', async ({ page }) => {
  await page.goto('/#/about'); await ready(page);
  const languages = page.getByRole('tab', { name: 'Languages', exact: true });
  await languages.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Data and ML', exact: true })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('scikit-learn');
  await expect(page.locator('.toolkit-scene.is-entering')).toContainText('The celestial forge');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tabpanel')).toContainText('FastAPI');
  await expect(page.locator('.toolkit-scene.is-entering')).toContainText('Hermes’ relay');
  await page.keyboard.press('End');
  await expect(page.getByRole('tabpanel')).toContainText('Git and pull requests');
  await page.keyboard.press('Home');
  await expect(languages).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.toolkit-scene.is-entering animate, .toolkit-scene.is-entering animateTransform, .toolkit-scene.is-entering animateMotion')).toHaveCount(0);
  await nav(page).getByRole('link', { name: 'Projects' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeFocused();
  await expect(page.locator('.course')).toHaveCount(0);
});

test('switching to reduced motion during flight arrives immediately', async ({ page }) => {
  await page.goto('/#/galaxy'); await ready(page);
  await nav(page).getByRole('link', { name: 'Experience' }).click();
  await expect(page.locator('.course-travel')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.course')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Experience' })).toBeFocused();
});

test('every resume download is the exact final draft, including with the mobile menu open', async ({ page, request }) => {
  const expected = digest(await readFile('FinalDraft Resume.pdf'));
  const served = await request.get('/resume.pdf');
  expect(digest(await served.body())).toBe(expected);
  for (const route of ['/', '/#/experience', '/#/contact']) {
    await page.goto(route);
    if (route !== '/') await expect(page.getByRole('heading', { level: 1, name: route.endsWith('contact') ? 'Contact' : 'Experience' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.course')).toHaveCount(0);
    for (const link of await page.locator('a[download]').all()) {
      if (!await link.isVisible()) continue;
      const waiting = page.waitForEvent('download'); await link.click();
      const download = await waiting;
      expect(download.suggestedFilename()).toBe('Mateus-Queiroz-Resume.pdf');
      expect(digest(await readFile((await download.path())!))).toBe(expected);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Menu' }).click();
  const waiting = page.waitForEvent('download');
  await page.locator('header a[download]').click();
  const download = await waiting;
  expect(digest(await readFile((await download.path())!))).toBe(expected);
});
