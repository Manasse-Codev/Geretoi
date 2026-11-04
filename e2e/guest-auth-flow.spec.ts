import { expect, test } from 'playwright/test';

test('ouvre DayFlow en invité et demande une authentification pour créer une tâche', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Bienvenue sur DayFlow !' })).toBeVisible();
  await page.getByRole('button', { name: 'Découvrir DayFlow' }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
  await expect(page.getByText('Votre espace est prêt à être organisé')).toBeVisible();

  await page.getByRole('button', { name: 'Nouvelle tâche', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Connexion à DayFlow' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer sans compte' }).click();
  await expect(page.getByRole('dialog', { name: 'Connexion à DayFlow' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
});
