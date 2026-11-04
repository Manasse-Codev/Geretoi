import { expect, test } from 'playwright/test';
import { fr } from '../src/i18n/fr';

async function createAccount(page: import('playwright/test').Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Bienvenue sur DayFlow' })).toBeVisible();
  await expect(page.getByTestId('install-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continuer sans compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
}

async function dispatchBeforeInstallPrompt(page: import('playwright/test').Page, outcome: 'accepted' | 'dismissed' = 'accepted') {
  await page.evaluate((choice) => {
    const pageWithPromptCount = window as Window & { __installPromptCount?: number };
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => { pageWithPromptCount.__installPromptCount = (pageWithPromptCount.__installPromptCount ?? 0) + 1; },
      userChoice: Promise.resolve({ outcome: choice, platform: 'web' }),
    });
    window.dispatchEvent(event);
  }, outcome);
}

async function createFirstTask(page: import('playwright/test').Page, title: string) {
  await page.getByRole('button', { name: fr.design.bottomNav.add, exact: true }).click();
  await page.getByLabel('Titre').fill(title);
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test('propose l’installation après la première tâche et appelle prompt après un clic', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await createAccount(page);
  await dispatchBeforeInstallPrompt(page);
  await expect(page.getByTestId('install-card')).toHaveCount(0);

  await createFirstTask(page, `Installer ${Date.now()}`);
  const card = page.getByTestId('install-card');
  await expect(card).toBeVisible();
  await expect(card.getByText(fr.install.title)).toBeVisible();
  await expect(card.getByText(fr.install.description)).toBeVisible();
  await card.getByRole('button', { name: fr.install.install, exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __installPromptCount?: number }).__installPromptCount ?? 0)).toBe(1);
  await expect(page.getByRole('status').filter({ hasText: fr.install.installed })).toBeVisible();
  await expect(page.getByTestId('install-card')).toHaveCount(0);
});

test('Plus tard masque la carte pendant quatorze jours, mais garde la ligne des réglages', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await createAccount(page);
  await dispatchBeforeInstallPrompt(page, 'dismissed');
  await createFirstTask(page, `Reporter ${Date.now()}`);
  await expect(page.getByTestId('install-card')).toBeVisible();
  await page.getByTestId('install-card').getByRole('button', { name: fr.install.later, exact: true }).click();
  await expect(page.getByTestId('install-card')).toHaveCount(0);

  const navigation = page.getByRole('navigation', { name: fr.navigation.label });
  await navigation.getByRole('button', { name: fr.pages.settings, exact: true }).click();
  const installRow = page.getByRole('button', { name: new RegExp(fr.install.settings) });
  await expect(installRow).toBeVisible();
  await installRow.click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __installPromptCount?: number }).__installPromptCount ?? 0)).toBe(1);
  await expect(page.getByRole('dialog', { name: fr.install.guideTitle })).toHaveCount(0);
});

test('ne propose pas l’installation en mode autonome', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true });
  });
  await createAccount(page);
  await dispatchBeforeInstallPrompt(page);
  await createFirstTask(page, `Autonome ${Date.now()}`);
  await expect(page.getByTestId('install-card')).toHaveCount(0);

  const navigation = page.getByRole('navigation', { name: fr.navigation.label });
  await navigation.getByRole('button', { name: fr.pages.settings, exact: true }).click();
  await expect(page.getByRole('button', { name: new RegExp(fr.install.settings) })).toHaveCount(0);
});

test('la carte reste au-dessus de la navigation et ne chevauche pas le bouton Ajouter', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await createAccount(page);
  await dispatchBeforeInstallPrompt(page);
  await createFirstTask(page, `Géométrie ${Date.now()}`);
  const card = page.getByTestId('install-card');
  const navigation = page.getByRole('navigation', { name: fr.navigation.label });
  const addButton = page.getByRole('button', { name: fr.design.bottomNav.add, exact: true });

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
