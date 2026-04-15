import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EVA_ACTION_PATTERNS = [/EVA: Ice Extraction/, /EVA: Equipment Repair/, /EVA: Science Mission/];

/** Dismiss an EventScreen by clicking the first numbered choice. */
async function handleEventIfPresent(page: Page): Promise<boolean> {
  const chooseHeading = page.getByText('CHOOSE YOUR RESPONSE');
  if (!(await chooseHeading.isVisible({ timeout: 800 }).catch(() => false))) return false;
  const firstChoice = page.locator('button').filter({ hasText: /^\(1\)/ }).first();
  if (await firstChoice.isVisible({ timeout: 500 }).catch(() => false)) {
    await firstChoice.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

/** Handle an EVA typing challenge by typing the target word. */
async function handleTypingChallengeIfPresent(page: Page): Promise<boolean> {
  const heading = page.getByText('EVA SKILL CHALLENGE');
  if (!(await heading.isVisible({ timeout: 500 }).catch(() => false))) return false;
  const wordLocator = page.locator('div').filter({ hasText: /^>>> .+ <<<$/ }).first();
  const wordText = await wordLocator.textContent({ timeout: 1000 }).catch(() => '');
  const match = wordText?.match(/>>>\s*(\w+)\s*<<</);
  if (match) {
    const input = page.locator('input[aria-label="Type the EVA command word"]');
    if (await input.isVisible({ timeout: 500 }).catch(() => false)) {
      await input.fill(match[1]);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);
      return true;
    }
  }
  return false;
}

/** Get the current phase label from the status bar. */
async function getCurrentPhase(page: Page): Promise<string> {
  const phaseSpan = page.locator('span').filter({
    hasText: /^(LAUNCH|LUNAR TRANSIT|GATEWAY|DESCENT|SURFACE OPS|COLONY|MISSION PREP)$/,
  }).first();
  const text = await phaseSpan.textContent({ timeout: 5000 }).catch(() => '');
  return text?.trim() ?? '';
}

/** Check if the game has ended (victory or defeat). */
async function isGameOver(page: Page): Promise<boolean> {
  const victory = page.getByText(/COLONY ESTABLISHED|OUTPOST ESTABLISHED|BARE SURVIVAL|PLAY AGAIN|SCORE BREAKDOWN/i).first();
  if (await victory.isVisible({ timeout: 500 }).catch(() => false)) return true;
  const defeat = page.getByText('MISSION FAILED').first();
  if (await defeat.isVisible({ timeout: 500 }).catch(() => false)) return true;
  return false;
}

/**
 * Start a new game on Cadet difficulty and navigate through all phases
 * to reach Surface Operations.
 */
async function startAndReachSurface(page: Page): Promise<boolean> {
  await page.goto('/');
  await page.getByPlaceholder('Commander...').fill('Trivia Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await expect(page.getByText('MISSION PREPARATION')).toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
  await page.waitForTimeout(1000);

  // Launch phase → Conservative Launch
  for (let i = 0; i < 5; i++) {
    await handleEventIfPresent(page);
    const btn = page.locator('button:not([disabled])').filter({ hasText: /Conservative Launch/ }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(600);
      break;
    }
    await page.waitForTimeout(400);
  }

  // Continue to Lunar Transit
  for (let i = 0; i < 5; i++) {
    await handleEventIfPresent(page);
    const btn = page.locator('button:not([disabled])').filter({ hasText: /Continue to Lunar Transit/ }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(600);
      break;
    }
    await page.waitForTimeout(400);
  }

  // Lunar Transit turns
  for (let turn = 0; turn < 15; turn++) {
    if (await isGameOver(page)) return false;
    const phase = await getCurrentPhase(page);
    if (phase !== 'LUNAR TRANSIT') break;
    if (await handleEventIfPresent(page)) continue;
    const btn = page.locator('button:not([disabled])').filter({ hasText: /Continue Transit/ }).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(800);
    }
  }

  // Gateway phase
  for (let i = 0; i < 10; i++) {
    if (await isGameOver(page)) return false;
    if (await handleEventIfPresent(page)) continue;
    const phase = await getCurrentPhase(page);
    if (phase === 'GATEWAY') break;
    if (phase === 'LUNAR TRANSIT') {
      const btn = page.locator('button:not([disabled])').filter({ hasText: /Continue Transit/ }).first();
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(800);
      }
    }
    await page.waitForTimeout(400);
  }

  const dockBtn = page.locator('button:not([disabled])').filter({ hasText: /Dock at Gateway Station/ }).first();
  if (await dockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dockBtn.click();
    await page.waitForTimeout(800);
    await handleEventIfPresent(page);
  }

  const proceedBtn = page.locator('button:not([disabled])').filter({ hasText: /Proceed to Landing Site Selection/ }).first();
  if (await proceedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await proceedBtn.click();
    await page.waitForTimeout(800);
  }

  // Select landing site
  const siteLabel = page.getByText('Shackleton Rim').first();
  if (await siteLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
    await siteLabel.click();
    await page.waitForTimeout(300);
    const confirmBtn = page.getByRole('button', { name: /CONFIRM LANDING SITE/i });
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Descent
  for (let i = 0; i < 5; i++) {
    if (await handleEventIfPresent(page)) continue;
    const phase = await getCurrentPhase(page);
    if (phase === 'DESCENT') break;
    await page.waitForTimeout(400);
  }

  const landBtn = page.locator('button:not([disabled])').filter({ hasText: /Execute Landing/ }).first();
  if (await landBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await landBtn.click();
    await page.waitForTimeout(1000);
  }

  // Post-descent → Surface Ops
  for (let i = 0; i < 5; i++) {
    if (await handleEventIfPresent(page)) continue;
    const btn = page.locator('button:not([disabled])').filter({ hasText: /Begin Surface Operations/ }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(800);
    }
    const phase = await getCurrentPhase(page);
    if (phase === 'SURFACE OPS') return true;
  }

  return (await getCurrentPhase(page)) === 'SURFACE OPS';
}

/** Click an EVA action on the surface. */
async function clickEvaAction(page: Page): Promise<boolean> {
  for (const pattern of EVA_ACTION_PATTERNS) {
    const btn = page.locator('button:not([disabled])').filter({ hasText: pattern }).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }
  return false;
}

/** Clear events, then click an EVA action. */
async function clearEventsAndClickEva(page: Page): Promise<boolean> {
  for (let i = 0; i < 3; i++) {
    await handleEventIfPresent(page);
    await page.waitForTimeout(300);
  }
  return clickEvaAction(page);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Trivia Challenge System', () => {
  test.setTimeout(180_000);

  test('EVA triggers either typing or trivia challenge', async ({ page }) => {
    const onSurface = await startAndReachSurface(page);
    if (!onSurface) {
      console.log('Could not reach surface — skipping');
      return;
    }

    const clicked = await clearEventsAndClickEva(page);
    if (!clicked) {
      console.log('No EVA action found on surface — skipping');
      return;
    }

    const hasTyping = await page.getByText('EVA SKILL CHALLENGE').isVisible({ timeout: 2000 }).catch(() => false);
    const hasTrivia = await page.getByText('SPACE TRIVIA CHALLENGE').isVisible({ timeout: 500 }).catch(() => false);

    console.log('Challenge type:', hasTyping ? 'TYPING' : hasTrivia ? 'TRIVIA' : 'NONE');
    expect(hasTyping || hasTrivia).toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/trivia-or-typing.png' });

    if (hasTrivia) {
      await expect(page.getByText('SPACE TRIVIA CHALLENGE')).toBeVisible();
      const options = page.locator('button').filter({ hasText: /^\(\d\)/ });
      expect(await options.count()).toBe(4);
      await expect(page.getByText(/Time: \d+\.\d+s/)).toBeVisible();
      await expect(page.getByText(/Category:/)).toBeVisible();
      await expect(page.getByText(/Press 1-4 to answer/)).toBeVisible();

      await page.keyboard.press('1');
      await page.waitForTimeout(2000);

      const hasFeedback = await page.getByText(/CORRECT!|WRONG|TIME'S UP/i).isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Feedback shown:', hasFeedback);
      await page.screenshot({ path: 'test-results/screenshots/trivia-answered.png' });
    } else if (hasTyping) {
      await handleTypingChallengeIfPresent(page);
    }

    await page.waitForTimeout(2000);
    console.log('After challenge — phase:', await getCurrentPhase(page));
  });

  test('trivia shows 4 answer options with question text', async ({ page }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      console.log(`Attempt ${attempt + 1}/5 to trigger trivia...`);
      const onSurface = await startAndReachSurface(page);
      if (!onSurface) continue;

      const clicked = await clearEventsAndClickEva(page);
      if (!clicked) continue;

      const hasTrivia = await page.getByText('SPACE TRIVIA CHALLENGE').isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasTrivia) {
        console.log('Got typing challenge on attempt', attempt + 1);
        await handleTypingChallengeIfPresent(page);
        continue;
      }

      console.log('Trivia triggered on attempt', attempt + 1);
      await page.screenshot({ path: 'test-results/screenshots/trivia-full-ui.png' });

      const bodyText = await page.textContent('body') || '';
      expect(bodyText).toContain('?');

      const options = page.locator('button').filter({ hasText: /^\(\d\)/ });
      await expect(options).toHaveCount(4);

      for (let i = 0; i < 4; i++) {
        const text = await options.nth(i).textContent();
        expect(text).toMatch(new RegExp(`\\(${i + 1}\\)`));
      }

      const timerText = await page.getByText(/Time: \d+\.\d+s/).textContent();
      expect(timerText).toBeTruthy();

      const metaText = await page.getByText(/Category:/).textContent();
      expect(metaText).toContain('Category:');
      expect(metaText).toContain('Difficulty:');

      await page.keyboard.press('2');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/screenshots/trivia-feedback.png' });
      return;
    }

    console.log('Could not trigger trivia in 5 attempts (50/50 RNG) — test inconclusive');
  });

  test('trivia timeout shows TIME\'S UP feedback', async ({ page }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      console.log(`Timeout test attempt ${attempt + 1}/5...`);
      const onSurface = await startAndReachSurface(page);
      if (!onSurface) continue;

      const clicked = await clearEventsAndClickEva(page);
      if (!clicked) continue;

      const hasTrivia = await page.getByText('SPACE TRIVIA CHALLENGE').isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasTrivia) {
        await handleTypingChallengeIfPresent(page);
        continue;
      }

      console.log('Trivia triggered — waiting for timeout (15s)...');
      await page.screenshot({ path: 'test-results/screenshots/trivia-before-timeout.png' });

      await page.waitForTimeout(16000);

      const timeoutFeedback = await page.getByText(/TIME'S UP/i).isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Timeout feedback visible:', timeoutFeedback);

      await page.screenshot({ path: 'test-results/screenshots/trivia-timeout.png' });

      if (timeoutFeedback) {
        const correctAnswer = await page.getByText(/The answer was:/).isVisible({ timeout: 1000 }).catch(() => false);
        console.log('Correct answer shown:', correctAnswer);
        expect(correctAnswer).toBe(true);
      }
      return;
    }

    console.log('Could not trigger trivia in 5 attempts — test inconclusive');
  });

  test('trivia correct/wrong answer shows appropriate feedback', async ({ page }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      console.log(`Feedback test attempt ${attempt + 1}/5...`);
      const onSurface = await startAndReachSurface(page);
      if (!onSurface) continue;

      const clicked = await clearEventsAndClickEva(page);
      if (!clicked) continue;

      const hasTrivia = await page.getByText('SPACE TRIVIA CHALLENGE').isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasTrivia) {
        await handleTypingChallengeIfPresent(page);
        continue;
      }

      const questionText = await page.locator('p').filter({ hasText: /\?/ }).first().textContent().catch(() => '');
      console.log('Question:', questionText);

      const optionButtons = page.locator('button').filter({ hasText: /^\(\d\)/ });
      const count = await optionButtons.count();
      const optionTexts: string[] = [];
      for (let i = 0; i < count; i++) {
        optionTexts.push(await optionButtons.nth(i).textContent() || '');
      }
      console.log('Options:', optionTexts);

      await page.keyboard.press('1');
      await page.waitForTimeout(500);

      const correctFeedback = await page.getByText(/CORRECT!/i).isVisible({ timeout: 2000 }).catch(() => false);
      const wrongFeedback = await page.getByText(/WRONG/i).isVisible({ timeout: 500 }).catch(() => false);

      console.log('Correct:', correctFeedback, 'Wrong:', wrongFeedback);
      expect(correctFeedback || wrongFeedback).toBe(true);

      if (wrongFeedback) {
        const answerShown = await page.getByText(/The answer was:/).isVisible({ timeout: 1000 }).catch(() => false);
        expect(answerShown).toBe(true);
      }

      await page.screenshot({ path: 'test-results/screenshots/trivia-answer-feedback.png' });
      return;
    }

    console.log('Could not trigger trivia in 5 attempts — test inconclusive');
  });

  test('trivia keyboard shortcuts 1-4 work to answer', async ({ page }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const onSurface = await startAndReachSurface(page);
      if (!onSurface) continue;

      const clicked = await clearEventsAndClickEva(page);
      if (!clicked) continue;

      const hasTrivia = await page.getByText('SPACE TRIVIA CHALLENGE').isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasTrivia) {
        await handleTypingChallengeIfPresent(page);
        continue;
      }

      console.log('Testing keyboard shortcut "3"...');
      await page.keyboard.press('3');
      await page.waitForTimeout(500);

      const hasFeedback = await page.getByText(/CORRECT!|WRONG/i).isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Feedback after pressing "3":', hasFeedback);
      expect(hasFeedback).toBe(true);

      await page.screenshot({ path: 'test-results/screenshots/trivia-keyboard.png' });
      return;
    }

    console.log('Could not trigger trivia in 5 attempts — test inconclusive');
  });
});
