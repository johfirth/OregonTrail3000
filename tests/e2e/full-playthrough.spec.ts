import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * If the EventScreen is showing (has choices rendered with "(N)" prefix),
 * click the first choice to dismiss it and return true.
 * Returns false if no event screen was detected.
 */
async function handleEventIfPresent(page: Page): Promise<boolean> {
  // EventScreen renders choices as buttons with "(1)" prefix text
  // Check for the "CHOOSE YOUR RESPONSE" heading that only EventScreen renders
  const chooseHeading = page.getByText('CHOOSE YOUR RESPONSE');
  const visible = await chooseHeading.isVisible({ timeout: 800 }).catch(() => false);
  if (!visible) return false;

  // Click the first choice button — they have "(1)" prefix
  const firstChoice = page.locator('button').filter({ hasText: /^\(1\)/ }).first();
  if (await firstChoice.isVisible({ timeout: 500 }).catch(() => false)) {
    await firstChoice.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

/**
 * If an EVA Skill Challenge is showing, click the first outcome to resolve it.
 */
async function handleEvaSkillIfPresent(page: Page): Promise<boolean> {
  const evaHeading = page.getByText('EVA SKILL CHALLENGE');
  const visible = await evaHeading.isVisible({ timeout: 500 }).catch(() => false);
  if (!visible) return false;

  // Click the first outcome button (e.g. "SUCCESS", "PARTIAL", etc.)
  const outcomeBtn = page.locator('button').filter({ hasText: /SUCCESS|PARTIAL|CRITICAL_SUCCESS/i }).first();
  if (await outcomeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await outcomeBtn.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

/**
 * Get the currently displayed phase label from the StatusBar.
 * StatusBar format: "═══ MISSION DAY X │ PHASE: LABEL │ ..."
 */
async function getCurrentPhase(page: Page): Promise<string> {
  const phaseSpan = page.locator('span').filter({ hasText: /^(LAUNCH|LUNAR TRANSIT|GATEWAY|DESCENT|SURFACE OPS|COLONY|MISSION PREP)$/ }).first();
  const text = await phaseSpan.textContent({ timeout: 5000 }).catch(() => '');
  return text?.trim() ?? '';
}

/**
 * Wait for the phase to change to one of the expected values.
 */
async function waitForPhase(page: Page, phases: string[], timeoutMs = 15000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const current = await getCurrentPhase(page);
    if (phases.includes(current)) return current;
    await page.waitForTimeout(300);
  }
  throw new Error(`Timed out waiting for phase to be one of [${phases.join(', ')}]. Current page content might not contain the StatusBar.`);
}

/**
 * Click the first enabled action button whose label matches the regex.
 * Action buttons in GameScreen are rendered with "(N) Label" format.
 */
async function clickAction(page: Page, labelPattern: RegExp, timeoutMs = 10000): Promise<void> {
  const btn = page.locator('button:not([disabled])').filter({ hasText: labelPattern }).first();
  await btn.click({ timeout: timeoutMs });
  await page.waitForTimeout(500);
}

/**
 * Keep handling events/EVA challenges and then try to click the target action.
 * Retries up to maxAttempts times to handle interleaved events.
 */
async function clickActionHandlingEvents(page: Page, labelPattern: RegExp, maxAttempts = 5): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    // Handle any interleaved events or EVA challenges first
    const handledEvent = await handleEventIfPresent(page);
    const handledEva = await handleEvaSkillIfPresent(page);
    if (handledEvent || handledEva) {
      await page.waitForTimeout(400);
      continue;
    }

    // Try to click the action
    const btn = page.locator('button:not([disabled])').filter({ hasText: labelPattern }).first();
    const visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      await btn.click();
      await page.waitForTimeout(500);
      return;
    }
  }
  throw new Error(`Could not find action matching ${labelPattern} after ${maxAttempts} attempts`);
}

/**
 * Detect if the game has ended (victory or defeat screen).
 */
async function isGameOver(page: Page): Promise<'victory' | 'defeat' | null> {
  // Victory: Colony phase shows tier banner + "PLAY AGAIN" button or score breakdown
  const victoryText = page.getByText(/COLONY ESTABLISHED|OUTPOST ESTABLISHED|BARE SURVIVAL|PLAY AGAIN|SCORE BREAKDOWN/i).first();
  if (await victoryText.isVisible({ timeout: 500 }).catch(() => false)) return 'victory';

  // Also check if phase label shows COLONY (victory phase)
  const colonyPhase = page.locator('span').filter({ hasText: /^COLONY$/ }).first();
  if (await colonyPhase.isVisible({ timeout: 300 }).catch(() => false)) return 'victory';

  // Defeat: "MISSION FAILED" text
  const defeatText = page.getByText('MISSION FAILED').first();
  if (await defeatText.isVisible({ timeout: 500 }).catch(() => false)) return 'defeat';

  return null;
}


// ─── Test ───────────────────────────────────────────────────────────────────

test.describe('Full Game Playthrough', () => {
  test('plays the entire Artemis Trail game from title to completion', async ({ page }) => {
    test.setTimeout(300_000); // 5 minutes for the full game

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 1: Title Screen → Mission Prep
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 1: Title Screen', async () => {
      await page.goto('/');
      await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('The Oregon Trail... TO THE MOON')).toBeVisible();

      // Fill commander name
      const nameInput = page.getByPlaceholder('Commander...');
      await nameInput.fill('Buzz Aldrin');

      // Select CADET difficulty (most forgiving)
      await page.getByRole('button', { name: /CADET/i }).click();
      await page.waitForTimeout(300);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/01-title-screen.png` });

      // Click NEW MISSION
      await page.getByRole('button', { name: /NEW MISSION/i }).click();

      // Verify we're on Mission Prep screen
      await expect(page.getByText('MISSION PREPARATION')).toBeVisible({ timeout: 10000 });
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 2: Mission Prep → Launch
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 2: Mission Prep', async () => {
      // Verify budget display
      await expect(page.getByText(/BUDGET:/)).toBeVisible();
      await expect(page.getByText(/\/ \d+ CR/)).toBeVisible();

      // Verify resource allocation controls
      await expect(page.getByText('Propulsion (Fuel Units)')).toBeVisible();
      await expect(page.getByText('Life Support (Supply Days)')).toBeVisible();
      await expect(page.getByText('Spare Parts (Part Units)')).toBeVisible();
      await expect(page.getByText('Shielding (Shield Rating)')).toBeVisible();
      await expect(page.getByText('Medical (Med Units)')).toBeVisible();

      // Verify consumption level selector
      await expect(page.getByText('LIFE SUPPORT CONSUMPTION LEVEL:')).toBeVisible();

      await page.screenshot({ path: `${SCREENSHOT_DIR}/02-mission-prep.png` });

      // Click LAUNCH MISSION with default allocations
      const launchBtn = page.getByRole('button', { name: /LAUNCH MISSION/i });
      await expect(launchBtn).toBeEnabled();
      await launchBtn.click();

      // Should no longer be on mission prep
      await expect(page.getByText('MISSION PREPARATION')).not.toBeVisible({ timeout: 10000 });
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 3: Launch
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 3: Launch Phase', async () => {
      // We should see the game screen with LAUNCH phase in status bar
      const phase = await waitForPhase(page, ['LAUNCH'], 10000);
      expect(phase).toBe('LAUNCH');

      // Handle any event that appeared during launch setup
      await handleEventIfPresent(page);

      // Select Conservative Launch profile (safest, 90 FU)
      await clickActionHandlingEvents(page, /Conservative Launch/);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/03-launch-phase.png` });

      // After selecting profile, we need to PROCEED to transit
      // Handle events that may appear
      await handleEventIfPresent(page);

      // Click "Continue to Lunar Transit"
      await clickActionHandlingEvents(page, /Continue to Lunar Transit/);

      // Wait for phase transition
      await page.waitForTimeout(1000);
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 4: Lunar Transit (multiple turns)
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 4: Lunar Transit', async () => {
      let screenshotTaken = false;

      for (let turn = 0; turn < 10; turn++) {
        // Check if we've moved past transit
        const currentPhase = await getCurrentPhase(page);
        if (currentPhase !== 'LUNAR TRANSIT') break;

        // Handle any events
        const hadEvent = await handleEventIfPresent(page);
        if (hadEvent) continue;

        if (!screenshotTaken) {
          await page.screenshot({ path: `${SCREENSHOT_DIR}/04-transit-phase.png` });
          screenshotTaken = true;
        }

        // Click "Continue Transit" to advance a turn
        const continueBtn = page.locator('button:not([disabled])').filter({ hasText: /Continue Transit/ }).first();
        const visible = await continueBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (visible) {
          await continueBtn.click();
          await page.waitForTimeout(800);
        } else {
          // Might be an event we need to handle
          await handleEventIfPresent(page);
          await page.waitForTimeout(500);
        }

        // Check for game over after each turn
        const gameEnd = await isGameOver(page);
        if (gameEnd) {
          await page.screenshot({ path: `${SCREENSHOT_DIR}/09-game-end-transit.png` });
          return; // test ends here
        }
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 5: Gateway
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 5: Gateway', async () => {
      // We may still be finishing transit or handling events
      // Keep processing until we reach Gateway or game ends
      for (let i = 0; i < 15; i++) {
        const gameEnd = await isGameOver(page);
        if (gameEnd) {
          await page.screenshot({ path: `${SCREENSHOT_DIR}/09-game-end-gateway.png` });
          return;
        }

        const handled = await handleEventIfPresent(page);
        if (handled) continue;

        const phase = await getCurrentPhase(page);
        if (phase === 'GATEWAY') break;

        // Still in transit — click Continue Transit
        if (phase === 'LUNAR TRANSIT') {
          const continueBtn = page.locator('button:not([disabled])').filter({ hasText: /Continue Transit/ }).first();
          const vis = await continueBtn.isVisible({ timeout: 2000 }).catch(() => false);
          if (vis) {
            await continueBtn.click();
            await page.waitForTimeout(800);
          }
          continue;
        }

        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: `${SCREENSHOT_DIR}/05-gateway-phase.png` });

      // Dock at Gateway Station
      const dockBtn = page.locator('button:not([disabled])').filter({ hasText: /Dock at Gateway Station/ }).first();
      const dockVisible = await dockBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (dockVisible) {
        await dockBtn.click();
        await page.waitForTimeout(800);
        await handleEventIfPresent(page);
      }

      // After docking, we can resupply or proceed
      // Skip resupply, proceed to landing site selection
      const proceedBtn = page.locator('button:not([disabled])').filter({ hasText: /Proceed to Landing Site Selection/ }).first();
      const proceedVisible = await proceedBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (proceedVisible) {
        await proceedBtn.click();
        await page.waitForTimeout(800);
      }

      // Now the LandingSiteScreen should appear
      await expect(page.getByText('SELECT LANDING SITE')).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: `${SCREENSHOT_DIR}/06-landing-site-selection.png` });

      // Click the first landing site to select it (Shackleton Rim)
      const firstSite = page.getByText('Shackleton Rim').first();
      await firstSite.click();
      await page.waitForTimeout(300);

      // Confirm selection
      const confirmBtn = page.getByRole('button', { name: /CONFIRM LANDING SITE/i });
      await expect(confirmBtn).toBeEnabled();
      await confirmBtn.click();
      await page.waitForTimeout(1000);
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 6: Descent
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 6: Descent', async () => {
      // Handle any events
      for (let i = 0; i < 3; i++) {
        const handled = await handleEventIfPresent(page);
        if (!handled) break;
        await page.waitForTimeout(400);
      }

      const gameEnd = await isGameOver(page);
      if (gameEnd) {
        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-game-end-descent.png` });
        return;
      }

      const phase = await getCurrentPhase(page);
      expect(phase).toBe('DESCENT');

      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-descent-phase.png` });

      // Execute Landing — fuel input defaults to 60 which is good
      await clickActionHandlingEvents(page, /Execute Landing/);

      await page.waitForTimeout(1000);

      // After descent, we may need to PROCEED to surface ops
      // or it may auto-advance
      for (let i = 0; i < 5; i++) {
        const handled = await handleEventIfPresent(page);
        if (!handled) break;
        await page.waitForTimeout(400);
      }

      // Check if we need to click "Begin Surface Operations"
      const beginSurfaceBtn = page.locator('button:not([disabled])').filter({ hasText: /Begin Surface Operations/ }).first();
      const visible = await beginSurfaceBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) {
        await beginSurfaceBtn.click();
        await page.waitForTimeout(800);
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 7: Surface Operations
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 7: Surface Operations', async () => {
      // Handle events that may have appeared
      for (let i = 0; i < 3; i++) {
        const handled = await handleEventIfPresent(page);
        if (!handled) break;
        await page.waitForTimeout(400);
      }

      let gameEnd = await isGameOver(page);
      if (gameEnd) {
        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-game-end-surface.png` });
        return;
      }

      let screenshotTaken = false;

      // Play through surface ops turns — shelter is always safe
      // Surface ops can be 5-15+ turns depending on difficulty and fuel bonus
      for (let turn = 0; turn < 30; turn++) {
        // Check for game end
        gameEnd = await isGameOver(page);
        if (gameEnd) break;

        // Check current phase — Colony means victory transition happened
        const currentPhase = await getCurrentPhase(page);
        if (currentPhase !== 'SURFACE OPS' && currentPhase !== '') break;

        // Handle events and EVA challenges
        const handledEvent = await handleEventIfPresent(page);
        if (handledEvent) continue;

        const handledEva = await handleEvaSkillIfPresent(page);
        if (handledEva) continue;

        if (!screenshotTaken) {
          await page.screenshot({ path: `${SCREENSHOT_DIR}/08-surface-ops.png` });
          screenshotTaken = true;
        }

        // Choose "Shelter in Habitat" as the safest option to ensure survival
        const shelterBtn = page.locator('button:not([disabled])').filter({ hasText: /Shelter in Habitat/ }).first();
        const shelterVisible = await shelterBtn.isVisible({ timeout: 3000 }).catch(() => false);

        if (shelterVisible) {
          await shelterBtn.click();
          await page.waitForTimeout(800);
        } else {
          // May be an event or EVA — try handling again
          const h1 = await handleEventIfPresent(page);
          const h2 = await handleEvaSkillIfPresent(page);
          if (!h1 && !h2) {
            // Try clicking any enabled action button to progress
            const anyBtn = page.locator('button:not([disabled])').filter({ hasText: /Shelter|Proceed|Continue|Begin/ }).first();
            const anyVisible = await anyBtn.isVisible({ timeout: 1000 }).catch(() => false);
            if (anyVisible) {
              await anyBtn.click();
              await page.waitForTimeout(800);
            }
          }
          await page.waitForTimeout(500);
        }
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 8: Victory or Defeat
    // ──────────────────────────────────────────────────────────────────────
    await test.step('Phase 8: Game End', async () => {
      // Wait a moment for the final state to render
      await page.waitForTimeout(2000);

      // Handle any remaining events
      for (let i = 0; i < 5; i++) {
        const handled = await handleEventIfPresent(page);
        if (!handled) break;
        await page.waitForTimeout(400);
      }

      // If still in Surface Ops, keep clicking shelter to finish
      for (let i = 0; i < 15; i++) {
        const gameEndCheck = await isGameOver(page);
        if (gameEndCheck) break;

        const currentPhase = await getCurrentPhase(page).catch(() => '');
        if (currentPhase !== 'SURFACE OPS') break;

        await handleEventIfPresent(page);
        await handleEvaSkillIfPresent(page);

        const shelterBtn = page.locator('button:not([disabled])').filter({ hasText: /Shelter in Habitat/ }).first();
        const shelterVisible = await shelterBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (shelterVisible) {
          await shelterBtn.click();
          await page.waitForTimeout(800);
        } else {
          const anyBtn = page.locator('button:not([disabled])').filter({ hasText: /Shelter|Proceed|Continue|Begin/ }).first();
          const anyVisible = await anyBtn.isVisible({ timeout: 1000 }).catch(() => false);
          if (anyVisible) {
            await anyBtn.click();
            await page.waitForTimeout(800);
          }
        }
      }

      // Final wait for game end screen to render
      await page.waitForTimeout(1000);

      const gameEnd = await isGameOver(page);

      if (gameEnd === 'victory') {
        // Victory screen — tier banner text varies:
        //   "🌟 THRIVING COLONY ESTABLISHED 🌟"
        //   "🏗️ SUSTAINABLE OUTPOST ESTABLISHED"
        //   "⚠️ BARE SURVIVAL — COLONY MARGINAL"
        await expect(
          page.getByText(/COLONY ESTABLISHED|OUTPOST ESTABLISHED|BARE SURVIVAL/i)
        ).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('SCORE BREAKDOWN')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: /PLAY AGAIN/i })).toBeVisible();

        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-victory.png` });
      } else if (gameEnd === 'defeat') {
        // Defeat screen with debrief
        await expect(page.getByText('MISSION FAILED')).toBeVisible();

        // Walk through the debrief sequence
        for (let i = 0; i < 10; i++) {
          // Click "Continue ▶" if visible
          const continueBtn = page.getByRole('button', { name: /Continue/i }).first();
          const contVisible = await continueBtn.isVisible({ timeout: 1000 }).catch(() => false);
          if (contVisible) {
            await continueBtn.click();
            await page.waitForTimeout(600);
            continue;
          }

          // Click YES/NO if a debrief question is showing
          const yesBtn = page.getByRole('button', { name: 'YES' }).first();
          const yesVisible = await yesBtn.isVisible({ timeout: 500 }).catch(() => false);
          if (yesVisible) {
            await yesBtn.click();
            await page.waitForTimeout(600);
            continue;
          }

          // Check if "TRY AGAIN" is visible — debrief is done
          const tryAgainBtn = page.getByRole('button', { name: /TRY AGAIN/i }).first();
          const tryAgainVisible = await tryAgainBtn.isVisible({ timeout: 500 }).catch(() => false);
          if (tryAgainVisible) break;
        }

        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-defeat.png` });
      } else {
        // Game might still be running — take a diagnostic screenshot
        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-unknown-state.png` });

        // Check if Colony phase (victory) without the expected text
        const phase = await getCurrentPhase(page).catch(() => '');
        if (phase === 'COLONY') {
          // Victory screen variant
          await page.screenshot({ path: `${SCREENSHOT_DIR}/09-colony-victory.png` });
        } else {
          // Log what we see for debugging
          const bodyText = await page.locator('body').textContent();
          console.log('Game state at end:', bodyText?.substring(0, 500));
        }
      }

      // Final verification: the game concluded
      const finalEnd = await isGameOver(page);
      // Accept either victory or defeat — the test played the whole game
      expect(finalEnd).not.toBeNull();
    });
  });
});
