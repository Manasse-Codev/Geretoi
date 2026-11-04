import { expect, test } from 'playwright/test';

const routes = ['/new', '/planner', '/lists', '/stats', '/history', '/settings'];

async function createAccount(page: import('playwright/test').Page) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await page.goto('/login');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse e-mail').fill(`dayflow-offline-${suffix}@example.test`);
  await page.getByLabel('Mot de passe').fill('dayflow-test-123');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
}

test.describe('navigation hors ligne sur le build', () => {
  test('ouvre toutes les routes précachées et recharge une route profonde', async ({ page, context }) => {
    await createAccount(page);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('.route-error')).toHaveCount(0);
    }

    await page.goto('/history');
    await page.reload();
    await expect(page.locator('.route-error')).toHaveCount(0);
  });

  test('affiche une erreur française pour un chunk indisponible puis reprend après rétablissement', async ({ page, context }) => {
    await page.route('**/*.js', async (route) => {
      if (route.request().url().includes('TaskFormPage')) await route.abort('failed');
      else await route.continue();
    });
    await createAccount(page);
    await page.getByRole('button', { name: 'Nouvelle tâche', exact: true }).click();
    await expect(page.getByRole('heading', { name: "Cet écran n'a pas pu se charger." })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
    await expect(page.getByText(/Failed to fetch|dynamically imported module/i)).toHaveCount(0);
    await page.unroute('**/*.js');
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Réessayer' }).click();
    await expect(page.getByLabel('Titre')).toBeVisible();
  });

  test('ne recharge pas en boucle après un chunk 404', async ({ page }) => {
    let reloads = 0;
    page.on('framenavigated', () => { reloads += 1; });
    await page.route('**/*.js', async (route) => {
      if (route.request().url().includes('TaskFormPage')) await route.fulfill({ status: 404, body: '' });
      else await route.continue();
    });
    await createAccount(page);
    await page.goto('/new');
    await page.waitForTimeout(1000);
    expect(reloads).toBeLessThan(4);
  });
});
