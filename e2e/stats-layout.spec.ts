import { expect, test } from 'playwright/test';

const sizes = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
] as const;

const values = ['0', '12', '100+'] as const;
const estimatedValues = ['12,5', '125,5'] as const;

async function createAccount(page: import('playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continuer sans compte', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Aujourd'hui" })).toBeVisible();
}

async function createCompletedTask(page: import('playwright/test').Page) {
  await page.getByRole('button', { name: 'Nouvelle tâche', exact: true }).click();
  await page.getByLabel('Titre').fill('Tâche statistique');
  await page.locator('.form-submit').click();
  await expect(page.getByRole('heading', { name: 'Tâche statistique' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Terminer : Tâche statistique' }).click();
  await expect(page.getByText('Tâche terminée')).toBeVisible();
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await expect(page.getByRole('group', { name: /Terminées/ })).toBeVisible();
}

async function assertCardLayout(page: import('playwright/test').Page, size: { width: number; height: number }, theme: 'light' | 'dark', zoom: number) {
  await page.setViewportSize(size);
  await page.evaluate(({ theme: nextTheme, nextZoom }) => {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.fontSize = `${nextZoom * 100}%`;
  }, { theme, zoom });

  const cards = page.locator('.stats-ring-card');
  await expect(cards).toHaveCount(2);
  const cardBoxes = await cards.evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
  }));
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(size.width);
  expect(cardBoxes[0].bottom - cardBoxes[0].top).toBe(cardBoxes[1].bottom - cardBoxes[1].top);

  for (const card of await cards.all()) {
    const cardBox = await card.boundingBox();
    const labelBox = await card.locator('h2').boundingBox();
    const valueBox = await card.locator('.stats-value').boundingBox();
    const unit = card.locator('.stats-value__unit');
    const unitBox = await unit.count() > 0 ? await unit.boundingBox() : null;
    const descriptionBox = await card.locator('p').boundingBox();
    expect(cardBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(valueBox).not.toBeNull();
    expect(descriptionBox).not.toBeNull();
    const boxes = [labelBox!, valueBox!, descriptionBox!];
    if (unitBox) {
      expect(unitBox.x).toBeGreaterThanOrEqual(cardBox!.x);
      expect(unitBox.y).toBeGreaterThanOrEqual(cardBox!.y);
      expect(unitBox.x + unitBox.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
      expect(unitBox.y + unitBox.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
    }
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(cardBox!.x);
      expect(box.y).toBeGreaterThanOrEqual(cardBox!.y);
      expect(box.x + box.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
      expect(box.y + box.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
    }
    for (let index = 0; index < boxes.length; index += 1) {
      for (let next = index + 1; next < boxes.length; next += 1) {
        expect(boxes[index].x + boxes[index].width <= boxes[next].x || boxes[next].x + boxes[next].width <= boxes[index].x || boxes[index].y + boxes[index].height <= boxes[next].y || boxes[next].y + boxes[next].height <= boxes[index].y).toBe(true);
      }
    }
  }

  await page.screenshot({ path: `test-results/stats-layout/${theme}-${size.width}x${size.height}-zoom-${zoom}.png`, fullPage: true });
}

test('les cartes Stats restent lisibles en clair/sombre et avec une grande taille de texte', async ({ page }) => {
  await createAccount(page);
  await createCompletedTask(page);

  for (const size of sizes) {
    for (const theme of ['light', 'dark'] as const) {
      for (const zoom of [1, 2] as const) {
        await assertCardLayout(page, size, theme, zoom);
        const cards = page.locator('.stats-ring-card');
        await cards.nth(0).locator('.stats-value__number').evaluate((element, value) => { element.textContent = value; }, values[(size.width + zoom) % values.length]);
        await cards.nth(1).locator('.stats-value__number').evaluate((element, value) => { element.textContent = value; }, estimatedValues[(size.width + zoom) % estimatedValues.length]);
        await assertCardLayout(page, size, theme, zoom);
      }
    }
  }
});
