import { expect, test } from 'playwright/test';

const viewports = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`authentification email reste lisible à ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Bienvenue sur DayFlow' })).toBeVisible();
    await expect(page.getByLabel('Adresse e-mail')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      controls: [...document.querySelectorAll<HTMLElement>('button, input, select')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height, right: rect.right };
      }),
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.controls.every((control) => control.width >= 44 && control.height >= 44 && control.right <= layout.viewportWidth + 1)).toBe(true);
  });
}
