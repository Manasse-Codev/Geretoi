import { expect, test } from 'playwright/test';
import { fr } from '../src/i18n/fr';

async function prepareInstallablePage(page: import('playwright/test').Page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/e2e/install-harness.html');
  await page.evaluate((outcome) => {
    const testWindow = window as Window & { __installPromptCount?: number };
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => { testWindow.__installPromptCount = (testWindow.__installPromptCount ?? 0) + 1; },
      userChoice: Promise.resolve({ outcome, platform: 'web' }),
    });
    window.dispatchEvent(event);
  }, 'dismissed');
  await expect(page.getByTestId('install-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tâche créée' }).click();
  await expect(page.getByTestId('install-card')).toBeVisible();
}

test('Playwright installe sur geste, reporte sans fermer la ligne des réglages', async ({ page }) => {
  await prepareInstallablePage(page);
  const card = page.getByTestId('install-card');
  await expect(card.getByRole('button', { name: fr.install.install, exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as Window & { __installPromptCount?: number }).__installPromptCount ?? 0)).toBe(0);
  await card.getByRole('button', { name: fr.install.later, exact: true }).click();
  await expect(card).toHaveCount(0);
  const settingsInstall = page.getByRole('button', { name: 'Réglages : installer' });
  await expect(settingsInstall).toBeVisible();
  await settingsInstall.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __installPromptCount?: number }).__installPromptCount ?? 0)).toBe(1);
  const preferences = await page.evaluate(() => JSON.parse(localStorage.getItem('dayflow.install.preferences.v1') ?? '{}') as { dismissedUntil?: number });
  expect(preferences.dismissedUntil).toBeGreaterThan(Date.now());
});

test('Playwright masque la proposition en mode autonome', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true });
  });
  await page.goto('/e2e/install-harness.html');
  await page.evaluate(() => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => undefined,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
    });
    window.dispatchEvent(event);
  });
  await page.evaluate(() => window.dispatchEvent(new Event('dayflow:task-created')));
  await expect(page.getByTestId('install-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Réglages : installer' })).toHaveCount(0);
});

test('Playwright masque l’offre et confirme l’installation sur appinstalled', async ({ page }) => {
  await prepareInstallablePage(page);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByTestId('install-card')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: fr.install.installed })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Réglages : installer' })).toHaveCount(0);
});

test('Playwright mesure la carte face à la barre et au bouton Ajouter aux tailles demandées', async ({ page }) => {
  await prepareInstallablePage(page);
  const card = page.getByTestId('install-card');
  const navigation = page.getByRole('navigation', { name: 'Navigation' });
  const addButton = page.getByRole('button', { name: 'Ajouter' });
  for (const size of [
    { width: 360, height: 640 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(140);
    const cardBox = await card.boundingBox();
    const navBox = await navigation.boundingBox();
    const addBox = await addButton.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(addBox).not.toBeNull();
    expect(cardBox!.x).toBeGreaterThanOrEqual(0);
    expect(cardBox!.x + cardBox!.width).toBeLessThanOrEqual(size.width);
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(navBox!.y);
    const overlapsAdd = cardBox!.x < addBox!.x + addBox!.width && cardBox!.x + cardBox!.width > addBox!.x &&
      cardBox!.y < addBox!.y + addBox!.height && cardBox!.y + cardBox!.height > addBox!.y;
    expect(overlapsAdd).toBe(false);
  }
});
