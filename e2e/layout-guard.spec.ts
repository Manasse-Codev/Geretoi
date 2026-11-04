import { mkdir } from 'node:fs/promises';
import { expect, test } from 'playwright/test';

async function signIn(page: import('playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continuer sans compte', exact: true }).click();
  await expect(page.locator('main.page-content')).toBeVisible();
}

const routes = ['/', '/new', '/planner', '/lists', '/history', '/stats', '/settings', '/missing-route'];
const sizes = [
  { width: 320, height: 640 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 844, height: 390 },
] as const;

for (const theme of ['light', 'dark'] as const) {
  for (const scale of [1, 1.3, 2] as const) {
    test(`layout guard ${theme} ${scale * 100}%`, async ({ page }) => {
      await signIn(page);
      await mkdir('artifacts/layout-guard', { recursive: true });

      for (const size of sizes) {
        await page.setViewportSize(size);
        for (const route of routes) {
          await page.goto(route);
          await page.evaluate(({ theme: nextTheme, scale: nextScale }) => {
            document.documentElement.dataset.theme = nextTheme;
            document.documentElement.style.fontSize = `${nextScale * 100}%`;
          }, { theme, scale });
          await page.waitForTimeout(50);

          const result = await page.evaluate(() => {
            const viewportWidth = window.innerWidth;
            const rect = (element: Element) => element.getBoundingClientRect();
            const visible = (element: Element) => getComputedStyle(element).display !== 'none' && rect(element).width > 0 && rect(element).height > 0;
            const pageContainers = [...document.querySelectorAll<HTMLElement>('.page-content')].filter(visible);
            const cards = [...document.querySelectorAll<HTMLElement>('.card, .surface-raised')].filter((element) => visible(element) && !element.closest('.bottom-nav'));
            const interactive = [...document.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [role="button"], [role="radio"], [role="switch"]')].filter(visible);
            const textNodes = [...document.querySelectorAll<HTMLElement>('.segmented__option, .filter-chip, .settings-row > span, .task-card h3, .task-card__description, .planner-task h3, .planner-task p, .card > h2')].filter(visible);
            const failures: string[] = [];
            for (const element of [...pageContainers, ...cards]) {
              const box = rect(element);
              if (box.left < -1 || box.right > viewportWidth + 1) failures.push(`${element.className}: bord ${box.left}/${box.right} sur ${viewportWidth}`);
              if (element.scrollWidth > element.clientWidth + 1 && !element.matches('.segmented, .list-filter-row, .task-filters, .choice-row, .quick-date-row')) failures.push(`${element.className}: texte ou contenu coupé ${element.scrollWidth}>${element.clientWidth}`);
            }
            for (const element of interactive) {
              const box = rect(element);
              if (box.width < 44 || box.height < 44) failures.push(`${element.className}: cible ${box.width}x${box.height}`);
            }
            for (let index = 0; index < textNodes.length; index += 1) {
              const current = rect(textNodes[index]!);
              for (const next of textNodes.slice(index + 1)) {
                const other = rect(next);
                if (current.left < other.right && current.right > other.left && current.top < other.bottom && current.bottom > other.top) {
                  failures.push(`chevauchement ${textNodes[index]!.className}/${next.className}`);
                }
              }
            }
            return {
              failures,
              horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
          });

          expect(result.horizontalOverflow, `${route} ${size.width}px ${scale * 100}%: débordement horizontal`).toBeLessThanOrEqual(0);
          expect(result.failures, `${route} ${size.width}px ${scale * 100}%: ${result.failures.join('; ')}`).toEqual([]);
          await page.screenshot({ fullPage: true, path: `artifacts/layout-guard/${theme}-${scale * 100}-${size.width}x${size.height}-${route === '/' ? 'today' : route.slice(1).replaceAll('/', '-')}.png` });
        }
      }
    });
  }
}
