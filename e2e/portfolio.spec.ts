import { expect, test, type Page } from '@playwright/test';

const ready = (page: Page) => page.waitForFunction(() => { const s = document.querySelector('.app')?.getAttribute('data-scene'); return !!s && s !== 'loading'; }, null, { timeout: 90000 });
const nav = (page: Page) => page.getByRole('navigation', { name: 'Portfolio' });
const marks = (page: Page) => page.getByRole('navigation', { name: 'Destinations in the galaxy' }).getByRole('link');
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

/** Counts WebGL draw calls, to check that the scene stops rendering when nothing moves. */
async function countDraws(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __draws: number }; w.__draws = 0;
    const P = WebGL2RenderingContext.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
    for (const name of ['drawArrays', 'drawElements']) { const orig = P[name]; P[name] = function (this: unknown, ...a: unknown[]) { w.__draws++; return orig.apply(this, a); }; }
  });
}

test('portfolio links and the resume work before the 3D chunk arrives', async ({ page, request }) => {
  let release!: () => void;
  const held = new Promise<void>(r => { release = r; });
  await page.route(/Scene3D-.*\.js$/, async route => { await held; await route.continue(); });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Enter the galaxy/ })).toBeVisible();
  await expect(page.locator('.app')).toHaveAttribute('data-scene', 'loading');
  const resume = page.locator('header').getByRole('link', { name: /Resume/ }).first();
  const res = await request.get(await resume.getAttribute('href') ?? '');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
  await nav(page).getByRole('link', { name: 'Projects' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeFocused();
  release();
  await ready(page);
});

test('the same short flight runs on first and repeat entry, and history still works', async ({ page }) => {
  await page.goto('/'); await ready(page);
  await page.getByRole('button', { name: /Enter the galaxy/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeFocused();
  await expect(page.locator('.intro-stage, .intro-beat, .intro-title')).toHaveCount(0);
  await expect(marks(page).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('button', { name: /Skip intro/ })).toHaveCount(0);
  await marks(page).filter({ hasText: 'Experience' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Experience' })).toBeFocused();
  await page.goBack(); await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeVisible();
  await page.goBack(); await expect(page.getByRole('button', { name: /Enter the galaxy/ })).toBeVisible();
  await page.goForward(); await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Skip intro/ })).toHaveCount(0);
  await nav(page).getByRole('link', { name: 'Universe' }).click();
  await page.getByRole('button', { name: /Enter the galaxy/ }).click();
  await expect(page.getByRole('button', { name: /Skip intro/ })).toHaveCount(0);
  await expect(marks(page).first()).toBeVisible({ timeout: 8000 });
});

test('destinations are labeled before selection and respond to hover and keyboard focus', async ({ page }) => {
  await page.goto('/#/galaxy'); await ready(page);
  const projects = marks(page).filter({ hasText: 'Projects' });
  await expect(projects).toContainText('SearchLens, UMarket, and UTrace');
  const before = await projects.locator('.medallion').evaluate(el => getComputedStyle(el).transform);
  await projects.hover(); await page.waitForTimeout(400);
  expect(await projects.locator('.medallion').evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await page.keyboard.press('Tab');
  await projects.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeFocused();
  await page.getByRole('tab', { name: /UTrace/ }).click();
  await expect(page).toHaveURL(/#\/projects\/utrace$/);
  await expect(page.getByRole('heading', { level: 2, name: 'UTrace' })).toBeVisible();
});

test('direct URLs, refresh, and old anchors', async ({ page }) => {
  for (const [path, name] of [['/#/galaxy', 'Mateus Queiroz'], ['/#/about', 'About'], ['/#/projects', 'Projects'], ['/#/experience', 'Experience'], ['/#/contact', 'Contact']] as const) {
    await page.goto(path); await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await page.reload(); await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  }
  await page.goto('/#/projects/umarket');
  await expect(page.getByRole('tab', { name: /UMarket/ })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/#work'); await expect(page).toHaveURL(/#\/projects$/);
});

test('the scene stops drawing on section pages and keeps idle motion light', async ({ page }) => {
  await countDraws(page);
  await page.goto('/#/about'); await ready(page);
  await page.waitForTimeout(3000);
  const a = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
  await page.waitForTimeout(2000);
  const b = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
  expect(b - a).toBe(0);
});

test('reduced motion: the overview opens without camera travel, and everything stays reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await ready(page);
  await expect(page.locator('.astronaut')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: /Enter the galaxy/ }).click();
  await expect(page.getByRole('button', { name: /Skip intro/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeFocused();
  for (const m of await marks(page).all()) await expect(m).toBeVisible();
});

test('without WebGL the same universe is drawn as a still', async ({ page }) => {
  await page.goto('/?nowebgl#/galaxy'); await ready(page);
  await expect(page.locator('.app')).toHaveAttribute('data-scene', 'still');
  await expect(marks(page)).toHaveCount(4);
  await marks(page).filter({ hasText: 'Contact' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeFocused();
});

test('phones: menu, destinations, layouts, and the quiz', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/'); await ready(page);
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape'); await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('navigation', { name: 'Portfolio (menu)' }).getByRole('link', { name: 'Galaxy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeFocused();
  await expect(marks(page).first()).toBeVisible({ timeout: 8000 });
  for (const m of await marks(page).all()) await expect(m).toBeInViewport();
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/#/', '/#/galaxy', '/#/about', '/#/projects', '/#/experience', '/#/contact']) {
      await page.goto(path);
      expect(await noOverflow(page), `${path} at ${width}`).toBe(true);
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/projects/experiments');
  await page.getByRole('button', { name: 'Try the sample quiz' }).click();
  await page.getByLabel('The useState hook', { exact: true }).check();
  await page.getByLabel('Store and exchange structured data', { exact: true }).check();
  await page.getByLabel('A stable, unique project ID', { exact: true }).check();
  await page.getByRole('button', { name: /Check my answers/ }).click();
  await expect(page.getByRole('heading', { name: 'Your score: 3 / 3' })).toBeVisible();
});

test('keyboard: skip link, then the galaxy itself is reachable and starts the entry', async ({ page }) => {
  await page.goto('/'); await ready(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /Enter the galaxy/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Mateus Queiroz' })).toBeFocused();
});
