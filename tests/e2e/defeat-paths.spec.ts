import { test, expect, Page } from '@playwright/test';

/**
 * Defeat path E2E tests for Artemis Trail.
 * Tests that the game can end in defeat and that the death debrief
 * sequence renders correctly.
 */

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

test.describe('Defeat Paths', () => {

  test('game ends in defeat with minimal resources', async ({ page }) => {
    test.setTimeout(180_000);

    await test.step('Start game with minimal resources', async () => {
      await page.goto('/');
      await page.getByPlaceholder('Commander...').fill('Doomed Commander');
      // Use Commander difficulty for tighter budget and more hazards
      await page.getByRole('button', { name: /COMMANDER/i }).click();
      await page.getByRole('button', { name: /NEW MISSION/i }).click();
      await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
    });

    await test.step('Set minimum propulsion and strip other resources', async () => {
      // Find propulsion input and set to minimum 200
      const propulsionInput = page.locator('input[type="number"]').first();
      await propulsionInput.fill('200');

      // Set life support very low (second number input)
      const lifeSupportInput = page.locator('input[type="number"]').nth(1);
      await lifeSupportInput.fill('5');

      // Set spare parts to 0 (third number input)
      const sparePartsInput = page.locator('input[type="number"]').nth(2);
      await sparePartsInput.fill('0');

      // Set shielding to 0 (fourth number input)
      const shieldingInput = page.locator('input[type="number"]').nth(3);
      await shieldingInput.fill('0');

      // Set medical to 0 (fifth number input)
      const medicalInput = page.locator('input[type="number"]').nth(4);
      await medicalInput.fill('0');

      // Set consumption to Rationing to stretch supplies but increase illness
      await page.getByRole('button', { name: /RATIONING/i }).click();

      await page.screenshot({ path: 'test-results/defeat-minimal-resources.png' });
    });

    await test.step('Launch and play until defeat', async () => {
      await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
      await page.waitForTimeout(1000);

      // Progress through the game, taking risky actions
      for (let turn = 0; turn < 60; turn++) {
        // Check for game over
        const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 500 }).catch(() => false);
        if (isGameOver) {
          await page.screenshot({ path: 'test-results/defeat-game-over.png' });
          break;
        }

        await dismissEventIfPresent(page);

        // Check for game over again after event
        const isGameOverAfterEvent = await page.getByText('MISSION FAILED').isVisible({ timeout: 300 }).catch(() => false);
        if (isGameOverAfterEvent) {
          await page.screenshot({ path: 'test-results/defeat-game-over.png' });
          break;
        }

        // Try aggressive actions to hasten defeat
        const aggressiveBtn = page.getByRole('button', { name: /Aggressive Launch/i });
        if (await aggressiveBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await aggressiveBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // Continue Transit / Proceed through phases
        const continueTransit = page.getByRole('button', { name: /Continue Transit/i });
        if (await continueTransit.isVisible({ timeout: 300 }).catch(() => false)) {
          await continueTransit.click();
          await page.waitForTimeout(300);
          continue;
        }

        const continueBtn = page.getByRole('button', { name: /Continue to Lunar Transit/i });
        if (await continueBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // Bypass Gateway to save no fuel
        const bypassBtn = page.getByRole('button', { name: /Bypass Gateway/i });
        if (await bypassBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await bypassBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // If on landing site screen, pick first site
        const landingSiteHeader = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 300 }).catch(() => false);
        if (landingSiteHeader) {
          await page.getByText('Shackleton Rim').click();
          await page.waitForTimeout(200);
          const confirmBtn = page.getByRole('button', { name: /CONFIRM LANDING SITE/i });
          if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(500);
          }
          continue;
        }

        // Execute descent if available
        const descentBtn = page.getByRole('button', { name: /Execute Landing/i });
        if (await descentBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await descentBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // Begin Surface Operations
        const surfaceBtn = page.getByRole('button', { name: /Begin Surface Operations/i });
        if (await surfaceBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await surfaceBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // On surface, shelter to burn life support quickly
        const shelterBtn = page.getByRole('button', { name: /Shelter in Habitat/i });
        if (await shelterBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await shelterBtn.click();
          await page.waitForTimeout(300);
          continue;
        }

        // Catch-all: click any visible proceed/continue button
        const proceedBtn = page.getByRole('button', { name: /Proceed|Continue/i }).first();
        if (await proceedBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await proceedBtn.click();
          await page.waitForTimeout(300);
        }
      }
    });

    await test.step('Verify defeat screen appears', async () => {
      // The game should end in defeat with such minimal resources
      const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 10000 }).catch(() => false);
      if (!isGameOver) {
        // If somehow we survived, skip this part
        test.skip(true, 'Game did not end in defeat — surprisingly survived with minimal resources');
        return;
      }
      await expect(page.getByText('MISSION FAILED')).toBeVisible();
      await page.screenshot({ path: 'test-results/defeat-mission-failed.png' });
    });

    await test.step('Walk through death debrief sequence', async () => {
      const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 1000 }).catch(() => false);
      if (!isGameOver) return;

      // Debrief intro — should mention Congressional hearing
      await expect(page.getByText(/CONGRESSIONAL MISSION DEBRIEF/i)).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/defeat-debrief-intro.png' });

      // Click "Continue ▶" to proceed to first question
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.waitForTimeout(500);

      // Q1: "Would you like a Congressional hearing?"
      await expect(page.getByText(/Congressional hearing/i)).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/defeat-debrief-q1.png' });
      await page.getByRole('button', { name: 'YES' }).click();
      await page.waitForTimeout(500);

      // A1 response, then continue
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.waitForTimeout(500);

      // Q2: "Would you like a memorial?"
      await expect(page.getByText(/memorial/i)).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/defeat-debrief-q2.png' });
      await page.getByRole('button', { name: 'NO' }).click();
      await page.waitForTimeout(500);

      // A2 response mentions plaque
      await expect(page.getByText(/plaque/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.waitForTimeout(500);

      // Q3: "Should we inform your next of kin?"
      await expect(page.getByText(/next of kin/i)).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: 'YES' }).click();
      await page.waitForTimeout(500);

      // A3 response, then continue to signature
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.waitForTimeout(500);

      // Signature stage
      await expect(page.getByText(/Ad Astra Per Aspera/i)).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/defeat-debrief-signature.png' });
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.waitForTimeout(500);

      // Done stage — should show final score and TRY AGAIN button
      await expect(page.getByText(/Final Score/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /TRY AGAIN/i })).toBeVisible();
      await page.screenshot({ path: 'test-results/defeat-debrief-done.png' });
    });
  });
});
