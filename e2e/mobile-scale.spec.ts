import { mkdir } from 'node:fs/promises';
import { expect, test } from 'playwright/test';

async function signIn(page: import('playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continuer sans compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
}

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 844, height: 390 },
] as const;

test('mesure l’échelle, les cibles et les positions à toutes les largeurs', async ({ page }) => {
  await signIn(page);
  await mkdir('artifacts/mobile-scale', { recursive: true });
  const routes = ['/', '/new', '/planner', '/lists', '/history', '/stats', '/settings'];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const zoom of [1, 1.3, 2]) {
      for (const route of routes) {
        await page.goto(route);
        await page.evaluate((value) => { document.documentElement.style.fontSize = `${value * 100}%`; }, zoom);
        await expect(page.locator('main')).toBeVisible();
        if (viewport.width === 390 && zoom === 1) {
          await page.screenshot({ fullPage: true, path: `artifacts/mobile-scale/after-${route === '/' ? 'today' : route.slice(1)}.png` });
        }
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '';
          const interactive = [...document.querySelectorAll<HTMLElement>('button, a, input, textarea, select, [role="button"]')]
            .filter((element) => element.offsetParent !== null)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            });
          const textSizes = [...document.querySelectorAll<HTMLElement>('body, h1, h2, h3, p, input, textarea, select, .task-card__title-row h3')]
            .filter((element) => element.offsetParent !== null)
            .map((element) => Number.parseFloat(getComputedStyle(element).fontSize))
            .filter(Number.isFinite);
          const metadataSizes = [...document.querySelectorAll<HTMLElement>('.task-card__meta, .muted, .eyebrow, .bottom-nav__tab')]
            .filter((element) => element.offsetParent !== null)
            .map((element) => Number.parseFloat(getComputedStyle(element).fontSize))
            .filter(Number.isFinite);
          const nav = document.querySelector<HTMLElement>('.bottom-nav')?.getBoundingClientRect();
          const fab = document.querySelector<HTMLElement>('.bottom-nav__add')?.getBoundingClientRect();
          return {
            viewportMeta,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            minText: Math.min(...textSizes, 999),
            minMetadata: Math.min(...metadataSizes, 999),
            minInteractive: Math.min(...interactive.map(({ width, height }) => Math.min(width, height)), 999),
            navFabCentered: nav && fab ? Math.abs((nav.left + nav.width / 2) - (fab.left + fab.width / 2)) <= 1 : true,
            navFabVisible: nav && fab ? fab.top >= 0 && fab.bottom <= window.innerHeight + 1 : true,
            hasGlobalScale: getComputedStyle(root).transform !== 'none' || getComputedStyle(root).zoom !== '1',
          };
        });
        expect(result.viewportMeta).toContain('width=device-width');
        expect(result.viewportMeta).toContain('initial-scale=1');
        expect(result.viewportMeta).toContain('viewport-fit=cover');
        expect(result.viewportMeta).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/i);
        expect(result.overflow).toBe(false);
        expect(result.minText).toBeGreaterThanOrEqual(15);
        expect(result.minMetadata).toBeGreaterThanOrEqual(13);
        expect(result.minInteractive).toBeGreaterThanOrEqual(44);
        expect(result.navFabCentered).toBe(true);
        expect(result.navFabVisible).toBe(true);
        expect(result.hasGlobalScale).toBe(false);
      }
      await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    }
  }
});
