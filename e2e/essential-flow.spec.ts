import { expect, test } from 'playwright/test';

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

  await page.getByRole('button', { name: 'Ajouter une tâche', exact: true }).click();
  await page.getByLabel('Titre').fill(onlineTitle);
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: onlineTitle })).toBeVisible();

  await page.getByRole('checkbox', { name: `Terminer : ${onlineTitle}` }).click();
  await expect(page.getByText('Tâche terminée')).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByRole('status', { name: 'Hors ligne' })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter une tâche', exact: true }).click();
  await page.getByLabel('Titre').fill(offlineTitle);
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: offlineTitle })).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByRole('status', { name: 'Synchronisé' })).toBeVisible({ timeout: 30000 });
  await page.reload();
  await expect(page.getByRole('heading', { name: offlineTitle })).toBeVisible();
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
