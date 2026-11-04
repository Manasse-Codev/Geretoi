import { expect, test } from 'playwright/test';
import { fr } from '../src/i18n/fr';

async function createAccount(page: import('playwright/test').Page) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await page.goto('/login');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse e-mail').fill(`dayflow-${suffix}@example.test`);
  await page.getByLabel('Mot de passe').fill('dayflow-test-123');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
}

test('crée et termine une tâche, puis synchronise une création hors ligne', async ({ page, context }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `dayflow-${suffix}@example.test`;
  const password = 'dayflow-test-123';
  const onlineTitle = `Parcours en ligne ${suffix}`;
  const offlineTitle = `Parcours hors ligne ${suffix}`;

  await page.goto('/login');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();

  await page.getByRole('button', { name: fr.design.bottomNav.add, exact: true }).click();
  await page.getByLabel('Titre').fill(onlineTitle);
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: onlineTitle })).toBeVisible();

  await page.getByRole('checkbox', { name: `Terminer : ${onlineTitle}` }).click();
  await expect(page.getByText('Tâche terminée')).toBeVisible();

  // Load the settings route while online; this development-server test has no service worker.
  await page.getByRole('button', { name: 'Réglages', exact: true }).click();
  await expect(page.getByRole('button', { name: fr.settingsPage.signOut, exact: true })).toBeVisible();
  await page.getByRole('button', { name: fr.navigation.today, exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByRole('status', { name: 'Hors ligne' })).toBeVisible();
  await page.getByRole('button', { name: fr.design.bottomNav.add, exact: true }).click();
  await page.getByLabel('Titre').fill(offlineTitle);
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: offlineTitle })).toBeVisible();

  await page.getByRole('button', { name: 'Réglages', exact: true }).click();
  await page.getByRole('button', { name: fr.settingsPage.signOut, exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(fr.auth.errors.pendingWrites, { timeout: 15000 });
  await expect(page).not.toHaveURL(/\/login$/);

  await context.setOffline(false);
  await expect(page.getByRole('status', { name: 'Synchronisé' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: fr.navigation.today, exact: true }).click();
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.getByRole('heading', { name: offlineTitle })).toBeVisible();
});

test('attend les écritures puis efface le cache Firestore avant la déconnexion', async ({ page }) => {
  await createAccount(page);
  await page.getByRole('button', { name: 'Réglages', exact: true }).click();
  await page.getByRole('button', { name: fr.settingsPage.signOut, exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Connectez-vous à votre espace' })).toBeVisible();
  await expect.poll(() => page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases.some((database) => database.name?.includes('firestore'));
  })).toBe(false);
});

test('le service worker de développement suit le réglage explicite', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (message) => { if (message.text().includes('[PWA]')) logs.push(message.text()); });
  await page.goto('/login');

  if (process.env.VITE_ENABLE_SW_DEV !== 'true') {
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
    expect(logs).toEqual([]);
    return;
  }

  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  expect(logs.some((message) => message.includes('Service worker enregistré'))).toBe(true);
});

test('le mouvement réduit supprime les animations en boucle et le FAB reste dans les limites aux tailles cibles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await createAccount(page);
  const addButton = page.getByRole('button', { name: fr.design.bottomNav.add, exact: true });
  await expect(addButton).toBeVisible();
  const nav = page.getByRole('navigation', { name: fr.navigation.label });
  await nav.getByRole('button', { name: fr.navigation.stats }).focus();
  await page.keyboard.press('Tab');
  await expect(addButton).toBeFocused();
  await page.waitForTimeout(180);
  await expect.poll(() => addButton.evaluate((button) => button.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);

  for (const size of [
    { width: 360, height: 640 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    const navBox = await nav.boundingBox();
    const buttonBox = await addButton.boundingBox();
    expect(navBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.x).toBeGreaterThanOrEqual(0);
    expect(buttonBox!.y).toBeGreaterThanOrEqual(0);
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(size.width);
    expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(size.height);
    expect(Math.abs((buttonBox!.x + buttonBox!.width / 2) - (navBox!.x + navBox!.width / 2))).toBeLessThanOrEqual(1);
    expect(await page.locator('.app-shell').evaluate((shell) => Number.parseFloat(getComputedStyle(shell).paddingBottom))).toBeGreaterThanOrEqual(128);
  }
});

test.describe('test explicite du mouvement', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('la lévitation garde le bouton centré, cliquable et rend le focus après le retour', async ({ page }) => {
  await createAccount(page);
  await page.mouse.move(24, 24);
  const addButton = page.getByRole('button', { name: fr.design.bottomNav.add, exact: true });
  const face = addButton.locator('[data-fab-face]');
  await page.mouse.move(24, 24);
  await expect.poll(() => addButton.getAttribute('data-floating')).toBe('true');
  await expect.poll(() => face.evaluate((element) => element.getAnimations().some((animation) => animation.effect?.getTiming().iterations === Infinity))).toBe(true);

  const navBox = await page.getByRole('navigation', { name: 'Navigation principale' }).boundingBox();
  expect(navBox).not.toBeNull();
  for (let frame = 0; frame < 6; frame += 1) {
    const buttonBox = await addButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs((buttonBox!.x + buttonBox!.width / 2) - (navBox!.x + navBox!.width / 2))).toBeLessThanOrEqual(1);
    await page.waitForTimeout(100);
  }

  await addButton.click();
  await expect(page).toHaveURL(/\/new$/);
  await expect(page.getByLabel('Titre')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
  await expect(page.getByRole('button', { name: fr.design.bottomNav.add, exact: true })).toBeFocused();
  });
});
