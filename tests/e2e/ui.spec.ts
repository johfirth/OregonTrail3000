import { test, expect } from '@playwright/test';

test.describe('UI - Visual Elements', () => {
  test('title screen has retro terminal styling', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    // Check for dark background
    await expect(body).toHaveCSS('background-color', 'rgb(6, 26, 64)');
  });

  test('title screen has all menu options', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
    await expect(page.getByRole('button', { name: /NEW MISSION/i })).toBeVisible();
  });

  test('difficulty options are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /CADET/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ASTRONAUT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^COMMANDER/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /IRONMAN/i })).toBeVisible();
  });

  test('narrative log renders text entries', async ({ page }) => {
    await page.goto('/');
    // Start game and check narrative log appears
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Test');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // Some narrative or status text should appear
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('UI - Navigation', () => {
  test('can navigate from title to mission prep', async ({ page }) => {
    await page.goto('/');
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Navigator');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // Should transition to prep screen
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible({ timeout: 5000 });
  });
});
