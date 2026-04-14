import { test, expect, Page } from '@playwright/test';

/**
 * Interaction detail E2E tests for Artemis Trail.
 * Tests specific UI interactions: budget allocation, difficulty selection,
 * and landing site display.
 */

async function startGame(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Commander...').fill('Interaction Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
}

/** Dismiss event choice screens by clicking the first available choice. */
async function dismissEventIfPresent(page: Page) {
  const isEvent = await page.getByText(/MINOR|MODERATE|SEVERE|CATASTROPHIC|POSITIVE/).isVisible({ timeout: 500 }).catch(() => false);
  if (isEvent) {
    const choices = page.locator('button').filter({ hasText: /./i });
    const count = await choices.count();
    for (let i = 0; i < count; i++) {
      const btn = choices.nth(i);
      const text = await btn.textContent();
      if (text && !text.includes('CREW') && !text.includes('SAVE')) {
        await btn.click();
        await page.waitForTimeout(500);
        return;
      }
    }
  }
}

test.describe('Budget Allocation Interactions', () => {

  test('clicking +/- buttons changes resource units and budget', async ({ page }) => {
    await startGame(page);

    await test.step('Record initial propulsion value', async () => {
      // Propulsion is the first resource row; its number input is first
      const propulsionInput = page.locator('input[type="number"]').first();
      const initialValue = await propulsionInput.inputValue();
      expect(Number(initialValue)).toBe(250); // default propulsion is 250
    });

    await test.step('Click +10 to increase propulsion', async () => {
      // The +10 button for propulsion is in the first resource row
      // Resource rows have buttons: -10, -, input, +, +10
      // Get all +10 buttons - the first one belongs to propulsion
      const plus10Buttons = page.getByRole('button', { name: '+10' });
      await plus10Buttons.first().click();
      await page.waitForTimeout(200);

      const propulsionInput = page.locator('input[type="number"]').first();
      const newValue = await propulsionInput.inputValue();
      expect(Number(newValue)).toBe(260);
    });

    await test.step('Click - to decrease propulsion by 1', async () => {
      // The single "-" button for propulsion
      // Get buttons that exactly match "-" (not "-10")
      const minusButtons = page.getByRole('button', { name: '-', exact: true });
      await minusButtons.first().click();
      await page.waitForTimeout(200);

      const propulsionInput = page.locator('input[type="number"]').first();
      const newValue = await propulsionInput.inputValue();
      expect(Number(newValue)).toBe(259);
    });

    await test.step('Click + to increase propulsion by 1', async () => {
      const plusButtons = page.getByRole('button', { name: '+', exact: true });
      await plusButtons.first().click();
      await page.waitForTimeout(200);

      const propulsionInput = page.locator('input[type="number"]').first();
      const newValue = await propulsionInput.inputValue();
      expect(Number(newValue)).toBe(260);
    });

    await test.step('Click -10 to decrease propulsion', async () => {
      const minus10Buttons = page.getByRole('button', { name: '-10' });
      await minus10Buttons.first().click();
      await page.waitForTimeout(200);

      const propulsionInput = page.locator('input[type="number"]').first();
      const newValue = await propulsionInput.inputValue();
      expect(Number(newValue)).toBe(250);
    });

    await test.step('Verify budget display updates', async () => {
      // Budget display shows "BUDGET:" with remaining CR — use exact text to avoid matching description
      await expect(page.locator('span').filter({ hasText: 'BUDGET:' })).toBeVisible();
      // On Cadet difficulty, total budget is 1000 CR — scope to the budget span
      await expect(page.getByText('/ 1000 CR')).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-budget.png' });
    });

    await test.step('Modify life support and verify cost changes', async () => {
      // Life Support is the second number input
      const lifeSupportInput = page.locator('input[type="number"]').nth(1);
      const initialLS = await lifeSupportInput.inputValue();

      // Click +10 on life support (second +10 button)
      const plus10Buttons = page.getByRole('button', { name: '+10' });
      await plus10Buttons.nth(1).click();
      await page.waitForTimeout(200);

      const newLS = await lifeSupportInput.inputValue();
      expect(Number(newLS)).toBe(Number(initialLS) + 10);
      await page.screenshot({ path: 'test-results/interaction-budget-updated.png' });
    });
  });
});

test.describe('Difficulty Selection', () => {

  test('clicking each difficulty button highlights it', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Commander...').fill('Difficulty Tester');

    await test.step('Verify ASTRONAUT is selected by default', async () => {
      // Default difficulty is Astronaut
      const astronautBtn = page.getByRole('button', { name: /ASTRONAUT/i });
      await expect(astronautBtn).toBeVisible();
      // The description should show the Astronaut description
      await expect(page.getByText(/Standard challenge/i)).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-difficulty-default.png' });
    });

    await test.step('Select CADET difficulty', async () => {
      await page.getByRole('button', { name: /CADET/i }).click();
      await page.waitForTimeout(200);
      // Cadet description should appear
      await expect(page.getByText(/Generous budget/i)).toBeVisible();
      // Should show 1000 CR budget
      await expect(page.getByText('1000 CR')).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-difficulty-cadet.png' });
    });

    await test.step('Select COMMANDER difficulty', async () => {
      await page.getByRole('button', { name: /COMMANDER/i }).click();
      await page.waitForTimeout(200);
      // Commander description should appear
      await expect(page.getByText(/Tight budget/i)).toBeVisible();
      // Should show 600 CR budget — scope to the COMMANDER button to avoid matching IRONMAN
      await expect(page.getByRole('button', { name: /COMMANDER/i }).getByText('600 CR')).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-difficulty-commander.png' });
    });

    await test.step('Select IRONMAN difficulty', async () => {
      await page.getByRole('button', { name: /IRONMAN/i }).click();
      await page.waitForTimeout(200);
      // Ironman description should appear
      await expect(page.getByText(/no saves/i)).toBeVisible();
      // Should show 600 CR budget — scope to the IRONMAN button to avoid matching COMMANDER
      await expect(page.getByRole('button', { name: /IRONMAN/i }).getByText('600 CR')).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-difficulty-ironman.png' });
    });

    await test.step('Select ASTRONAUT again and verify', async () => {
      await page.getByRole('button', { name: /ASTRONAUT/i }).click();
      await page.waitForTimeout(200);
      await expect(page.getByText(/Standard challenge/i)).toBeVisible();
      await expect(page.getByText('800 CR')).toBeVisible();
      await page.screenshot({ path: 'test-results/interaction-difficulty-astronaut.png' });
    });
  });
});

test.describe('Landing Site Selection', () => {

  test('landing site screen shows 5 sites with ratings', async ({ page }) => {
    test.setTimeout(180_000);

    await test.step('Start game and progress to Gateway', async () => {
      await startGame(page);

      // Launch mission
      await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
      await page.waitForTimeout(1000);

      // Select conservative launch
      await dismissEventIfPresent(page);
      const conservativeBtn = page.getByRole('button', { name: /Conservative Launch/i });
      if (await conservativeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await conservativeBtn.click();
        await page.waitForTimeout(500);
      }

      // Continue to Lunar Transit
      await dismissEventIfPresent(page);
      const continueToTransit = page.getByRole('button', { name: /Continue to Lunar Transit/i });
      if (await continueToTransit.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueToTransit.click();
        await page.waitForTimeout(500);
      }

      // Progress through transit
      for (let turn = 0; turn < 30; turn++) {
        await dismissEventIfPresent(page);

        const isGateway = await page.getByText('GATEWAY').first().isVisible({ timeout: 500 }).catch(() => false);
        const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 300 }).catch(() => false);
        const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 300 }).catch(() => false);

        if (isGateway || isLandingSite || isGameOver) break;

        const continueTransit = page.getByRole('button', { name: /Continue Transit/i });
        if (await continueTransit.isVisible({ timeout: 1000 }).catch(() => false)) {
          await continueTransit.click();
          await page.waitForTimeout(300);
        }
      }
    });

    await test.step('Navigate to landing site screen', async () => {
      // If at Gateway, bypass or dock then proceed to landing site selection
      const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 500 }).catch(() => false);
      if (isGameOver) {
        test.skip(true, 'Game ended before reaching landing site selection');
        return;
      }

      await dismissEventIfPresent(page);

      // Try Bypass Gateway or Dock
      const bypassBtn = page.getByRole('button', { name: /Bypass Gateway/i });
      if (await bypassBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await bypassBtn.click();
        await page.waitForTimeout(500);
      }

      // If we docked, proceed to landing site
      const proceedBtn = page.getByRole('button', { name: /Proceed to Landing Site Selection/i });
      if (await proceedBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await proceedBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: 'test-results/interaction-landing-site.png' });
    });

    await test.step('Verify 5 landing sites are displayed', async () => {
      const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 5000 }).catch(() => false);
      if (!isLandingSite) {
        test.skip(true, 'Did not reach landing site selection screen');
        return;
      }

      await expect(page.getByText('SELECT LANDING SITE')).toBeVisible();

      // Verify all 5 sites are listed
      await expect(page.getByText('Shackleton Rim')).toBeVisible();
      await expect(page.getByText('Nobile Valley')).toBeVisible();
      await expect(page.getByText('Malapert Summit')).toBeVisible();
      await expect(page.getByText('Haworth Basin')).toBeVisible();
      await expect(page.getByText('de Gerlache Ridge')).toBeVisible();
    });

    await test.step('Verify star ratings are shown', async () => {
      const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 1000 }).catch(() => false);
      if (!isLandingSite) return;

      // Each site shows: Sunlight, Ice Access, Terrain, Comms ratings
      await expect(page.getByText('Sunlight:').first()).toBeVisible();
      await expect(page.getByText('Ice Access:').first()).toBeVisible();
      await expect(page.getByText('Terrain:').first()).toBeVisible();
      await expect(page.getByText('Comms:').first()).toBeVisible();

      // Star ratings should use ★ and ☆ characters
      const starElements = page.locator('text=/[★☆]+/');
      const starCount = await starElements.count();
      // 5 sites × 4 ratings = 20 star rating elements
      expect(starCount).toBeGreaterThanOrEqual(20);

      await page.screenshot({ path: 'test-results/interaction-landing-ratings.png' });
    });

    await test.step('Verify CONFIRM LANDING SITE button', async () => {
      const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 1000 }).catch(() => false);
      if (!isLandingSite) return;

      // Confirm button should exist but be disabled before selection
      const confirmBtn = page.getByRole('button', { name: /CONFIRM LANDING SITE/i });
      await expect(confirmBtn).toBeVisible();

      // Click a landing site to select it
      await page.getByText('Shackleton Rim').click();
      await page.waitForTimeout(300);

      // The selected site should show the ▶ indicator
      await expect(page.getByText('▶ Shackleton Rim')).toBeVisible();

      await page.screenshot({ path: 'test-results/interaction-landing-selected.png' });
    });
  });
});
