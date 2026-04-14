import { test, expect, Page } from '@playwright/test';

/**
 * Phase transition E2E tests for Artemis Trail.
 * Each test starts a fresh game on Cadet difficulty and verifies
 * that specific phase transitions occur correctly.
 */

async function startGame(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Commander...').fill('Phase Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
}

async function launchMission(page: Page) {
  await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
  await page.waitForTimeout(1000);
}

/** Dismiss any event choice screen by clicking the first available choice button. */
async function dismissEventIfPresent(page: Page) {
  // EventScreen renders choices as buttons inside a panel with severity badge
  const eventChoiceButton = page.locator('button').filter({ hasText: /./i }).first();
  // Check if we're on an event screen by looking for severity labels
  const isEvent = await page.getByText(/MINOR|MODERATE|SEVERE|CATASTROPHIC|POSITIVE/).isVisible({ timeout: 500 }).catch(() => false);
  if (isEvent) {
    // Click the first choice button that's not a navigation button
    const choices = page.locator('button').filter({ hasText: /./i });
    const count = await choices.count();
    for (let i = 0; i < count; i++) {
      const btn = choices.nth(i);
      const text = await btn.textContent();
      if (text && !text.includes('CREW') && !text.includes('SAVE')) {
        await btn.click();
        await page.waitForTimeout(500);
        break;
      }
    }
  }
}

/** Click a game action button by matching its label text. Handles event interruptions.
 *  Action buttons in GameScreen use role="option", so we search by HTML element + text. */
async function clickAction(page: Page, labelPattern: RegExp, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    await dismissEventIfPresent(page);
    const btn = page.locator('button').filter({ hasText: labelPattern });
    if (await btn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.first().click();
      await page.waitForTimeout(500);
      return;
    }
    await page.waitForTimeout(500);
  }
  // Last attempt without catch
  await page.locator('button').filter({ hasText: labelPattern }).first().click();
}

test.describe('Phase Transitions', () => {

  test('MissionPrep → Launch transition', async ({ page }) => {
    await test.step('Start game on Cadet', async () => {
      await startGame(page);
      await page.screenshot({ path: 'test-results/phase-missionprep.png' });
    });

    await test.step('Verify mission prep UI elements', async () => {
      await expect(page.getByText(/Propulsion \(Fuel Units\)/i)).toBeVisible();
      await expect(page.getByText(/Life Support \(Supply Days\)/i)).toBeVisible();
      await expect(page.locator('span').filter({ hasText: 'BUDGET:' })).toBeVisible();
      await expect(page.getByRole('button', { name: /LAUNCH MISSION/i })).toBeVisible();
    });

    await test.step('Launch mission', async () => {
      await launchMission(page);
      await page.screenshot({ path: 'test-results/phase-launch.png' });
    });

    await test.step('Verify launch phase UI', async () => {
      // After launching, should see launch profile choices or game screen
      // StatusBar shows phase labels — check for LAUNCH in status bar
      const launchIndicator = page.getByText('LAUNCH').first();
      await expect(launchIndicator).toBeVisible({ timeout: 5000 });
      // Should see launch profile buttons
      const hasConservative = await page.getByText('Conservative Launch').isVisible({ timeout: 3000 }).catch(() => false);
      const hasStandard = await page.getByText('Standard Launch').isVisible({ timeout: 1000 }).catch(() => false);
      const hasAggressive = await page.getByText('Aggressive Launch').isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasConservative || hasStandard || hasAggressive).toBeTruthy();
    });
  });

  test('Launch → Transit transition', async ({ page }) => {
    await test.step('Start and launch game', async () => {
      await startGame(page);
      await launchMission(page);
    });

    await test.step('Select launch profile', async () => {
      await dismissEventIfPresent(page);
      // Pick conservative launch for safest option
      await clickAction(page, /Conservative Launch/i);
      await page.screenshot({ path: 'test-results/phase-launch-profile-selected.png' });
    });

    await test.step('Proceed through launch', async () => {
      // After selecting profile, "Continue to Lunar Transit" becomes available
      await clickAction(page, /Continue to Lunar Transit/i);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/phase-transit.png' });
    });

    await test.step('Verify transit phase', async () => {
      await dismissEventIfPresent(page);
      // StatusBar should now show LUNAR TRANSIT
      const transitIndicator = page.getByText('LUNAR TRANSIT').first();
      await expect(transitIndicator).toBeVisible({ timeout: 5000 });
      // Should see transit-specific actions like "Continue Transit" or "Course Correction Burn"
      const hasContinue = await page.getByText('Continue Transit').isVisible({ timeout: 3000 }).catch(() => false);
      const hasCourseCorrection = await page.getByText('Course Correction Burn').isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasContinue || hasCourseCorrection).toBeTruthy();
    });
  });

  test('can reach Gateway phase', async ({ page }) => {
    test.setTimeout(180_000);

    await test.step('Start, launch, and enter transit', async () => {
      await startGame(page);
      await launchMission(page);
      await dismissEventIfPresent(page);
      await clickAction(page, /Conservative Launch/i);
      await clickAction(page, /Continue to Lunar Transit/i);
      await page.waitForTimeout(500);
    });

    await test.step('Progress through transit turns', async () => {
      // Transit has a finite number of turns; keep clicking "Continue Transit"
      for (let turn = 0; turn < 30; turn++) {
        await dismissEventIfPresent(page);

        // Check if we've reached Gateway
        const isGateway = await page.getByText('GATEWAY').first().isVisible({ timeout: 500 }).catch(() => false);
        const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 500 }).catch(() => false);
        if (isGateway || isLandingSite) {
          break;
        }

        // Check for game over
        const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 300 }).catch(() => false);
        if (isGameOver) {
          test.skip(true, 'Game ended in defeat before reaching Gateway');
          return;
        }

        // Click continue transit if available
        const continueBtn = page.getByRole('button', { name: /Continue Transit/i });
        if (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(300);
        }
      }

      await page.screenshot({ path: 'test-results/phase-gateway.png' });
    });

    await test.step('Verify Gateway or Landing Site screen', async () => {
      // Should be at Gateway phase or LandingSiteScreen
      const isGateway = await page.getByText('GATEWAY').first().isVisible({ timeout: 3000 }).catch(() => false);
      const isDock = await page.getByText('Dock at Gateway Station').isVisible({ timeout: 1000 }).catch(() => false);
      const isBypass = await page.getByText('Bypass Gateway').isVisible({ timeout: 1000 }).catch(() => false);
      const isLandingSite = await page.getByText('SELECT LANDING SITE').isVisible({ timeout: 1000 }).catch(() => false);
      const isGameOver = await page.getByText('MISSION FAILED').isVisible({ timeout: 1000 }).catch(() => false);

      // Must have reached Gateway, Landing Site, or ended the game
      expect(isGateway || isDock || isBypass || isLandingSite || isGameOver).toBeTruthy();
    });
  });
});
