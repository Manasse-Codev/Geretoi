import { mkdir } from 'node:fs/promises';
import { expect, test } from 'playwright/test';

async function signIn(page: import('playwright/test').Page) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await page.goto('/login');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse e-mail').fill(`nav-${suffix}@example.test`);
  await page.getByLabel('Mot de passe').fill('dayflow-test-123');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
}

const viewports = [
  { width: 320, height: 640 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 844, height: 390 },
] as const;

for (const theme of ['light', 'dark'] as const) {
  for (const fontScale of [1, 1.3, 2] as const) {
    test(`navigation ${theme} ${fontScale * 100}%`, async ({ page }) => {
      await signIn(page);
      await mkdir('artifacts/bottom-nav', { recursive: true });

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(({ theme: nextTheme, fontScale: nextScale }) => {
          document.documentElement.dataset.theme = nextTheme;
          document.documentElement.style.fontSize = `${nextScale * 100}%`;
        }, { theme, fontScale });
        await page.waitForTimeout(50);

        const result = await page.evaluate(() => {
          const nav = document.querySelector<HTMLElement>('.bottom-nav');
          const fab = document.querySelector<HTMLElement>('.bottom-nav__add');
          const tabs = [...document.querySelectorAll<HTMLElement>('.bottom-nav__tab')];
          const labels = tabs.map((tab) => tab.querySelector('span'));
          const rect = (element: Element | null) => element?.getBoundingClientRect() ?? null;
          const intersects = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          const navRect = rect(nav);
          const fabRect = rect(fab);
          const tabRects = tabs.map((tab) => rect(tab));
          const labelRects = labels.map((label) => rect(label));
          const labelGaps = labelRects.slice(0, -1).map((current, index) => {
            const next = labelRects[index + 1];
            return current && next ? Math.min(next.left - current.right, current.left - next.right) : null;
          });
          return {
            order: tabs.map((tab) => tab.getAttribute('aria-label')),
            navRect, fabRect, tabRects, labelRects, labelGaps,
            labelsHidden: labels.every((label) => label && getComputedStyle(label).display === 'none'),
            labelsFit: labels.every((label) => !label || label.scrollWidth <= label.clientWidth),
            touchTargets: tabRects.map((item) => item ? { width: item.width, height: item.height } : null),
            fabCentered: navRect && fabRect ? Math.abs((navRect.left + navRect.width / 2) - (fabRect.left + fabRect.width / 2)) <= 1 : false,
            fabDoesNotOverlapTabs: fabRect && tabRects.every((item) => item ? !intersects(fabRect, item) : false),
          };
        });

        expect(result.order).toEqual(["Aujourd'hui", 'Planning', 'Listes', 'Stats']);
        expect(result.labelsFit).toBe(true);
        expect(result.touchTargets.every((item) => item && item.width >= 44 && item.height >= 44)).toBe(true);
        expect(result.fabCentered).toBe(true);
        expect(result.fabDoesNotOverlapTabs).toBe(true);
        if (fontScale >= 1.3) expect(result.labelsHidden).toBe(true);
        if (fontScale < 1.3) {
          expect(result.labelGaps.filter((gap): gap is number => gap !== null).every((gap) => gap >= 8)).toBe(true);
          expect(result.labelsHidden).toBe(false);
        }
        await page.screenshot({
          fullPage: true,
          path: `artifacts/bottom-nav/${theme}-${fontScale * 100}-${viewport.width}x${viewport.height}.png`,
        });
      }
    });
  }
}
