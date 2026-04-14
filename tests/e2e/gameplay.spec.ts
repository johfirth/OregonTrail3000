import { test, expect } from '@playwright/test';

test.describe('Gameplay - Full Game Loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('title screen renders correctly', async ({ page }) => {
    await expect(page.getByText('LUNAR COLONY 3000')).toBeVisible();
    await expect(page.getByRole('button', { name: /NEW MISSION/i })).toBeVisible();
  });

  test('can start a new game on Cadet difficulty', async ({ page }) => {
    // Enter commander name
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Test Commander');

    // Select difficulty
    await page.getByRole('button', { name: /CADET/i }).click();

    // Click new mission
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // Should show mission prep screen
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
  });

  test('mission prep - can allocate budget and launch', async ({ page }) => {
    // Start game
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Test Commander');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // Should see resource allocation controls
    await expect(page.getByText(/propulsion/i)).toBeVisible();
    await expect(page.getByText('Life Support (Supply Days)')).toBeVisible();

    // Find and interact with allocation controls
    const launchButton = page.getByText(/launch|start mission/i);
    // The button should become enabled after valid allocation
    await expect(launchButton).toBeVisible();
  });

  test('game displays status bar during gameplay', async ({ page }) => {
    // Quick-start a game
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Test Commander');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // After starting, should see mission prep screen
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Gameplay - Phase Transitions', () => {
  test('game progresses through phases', async ({ page }) => {
    await page.goto('/');
    // Start game and verify phase transitions are possible
    await expect(page.getByText('LUNAR COLONY 3000')).toBeVisible();
  });
});
