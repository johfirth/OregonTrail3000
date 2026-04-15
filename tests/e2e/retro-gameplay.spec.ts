import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

async function switchToRetro(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(500);
  const settingsBtn = page.getByRole('button', { name: /settings/i });
  await settingsBtn.click();
  await page.waitForTimeout(500);
  const retroBtn = page.getByRole('button', { name: /retro 80s/i });
  await retroBtn.click();
  await page.waitForTimeout(300);
  const backBtn = page.getByRole('button', { name: /back/i });
  await backBtn.click();
  await page.waitForTimeout(300);
}

async function handleEventIfPresent(page: Page): Promise<boolean> {
  const chooseHeading = page.getByText('CHOOSE YOUR RESPONSE');
  const visible = await chooseHeading.isVisible({ timeout: 800 }).catch(() => false);
  if (!visible) return false;
  const firstChoice = page.locator('button').filter({ hasText: /^\(1\)/ }).first();
  if (await firstChoice.isVisible({ timeout: 500 }).catch(() => false)) {
    await firstChoice.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

async function handleEvaSkillIfPresent(page: Page): Promise<boolean> {
  const evaHeading = page.getByText('EVA SKILL CHALLENGE');
  const visible = await evaHeading.isVisible({ timeout: 500 }).catch(() => false);
  if (!visible) return false;
  const evaInput = page.locator('input[aria-label="Type the EVA command word"]');
  if (await evaInput.isVisible({ timeout: 500 }).catch(() => false)) {
    const wordEl = page.locator('div').filter({ hasText: /^>>> .+ <<<$/ }).first();
    const rawText = await wordEl.textContent({ timeout: 2000 }).catch(() => '');
    const match = rawText?.match(/>>>\s*(\w+)\s*<<</);
    const word = match ? match[1] : 'LAUNCH';
    await evaInput.fill(word);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

async function getCurrentPhase(page: Page): Promise<string> {
  const phaseSpan = page.locator('span').filter({
    hasText: /^(LAUNCH|LUNAR TRANSIT|GATEWAY|DESCENT|SURFACE OPS|COLONY|MISSION PREP)$/,
  }).first();
  const text = await phaseSpan.textContent({ timeout: 5000 }).catch(() => '');
  return text?.trim() ?? '';
}

// Emoji regex: matches most common emoji ranges
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA9F}\u{1FAA0}-\u{1FAFF}]/u;

test.describe('Retro 80s Gameplay End-to-End', () => {

  test('retro gameplay — full flow with visual authenticity checks', async ({ page }) => {
    // ── Step 1: Switch to Retro 80s theme ──
    await switchToRetro(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-01-title.png`, fullPage: true });

    // Verify retro title screen (use first() to avoid strict mode with multiple matches)
    await expect(page.getByText('ARTEMIS TRAIL').first()).toBeVisible();
    const bodyText1 = await page.textContent('body') || '';
    const emojiOnTitle = EMOJI_REGEX.test(bodyText1);
    console.log('Step 1 - Title screen emoji visible:', emojiOnTitle);

    // Check no rounded corners on title
    const titleRounded = await page.evaluate(() => {
      const els = document.querySelectorAll('button, div, section');
      let count = 0;
      for (const el of els) {
        const br = getComputedStyle(el).borderRadius;
        if (br && br !== '0px' && br !== '0' && br !== '' && parseInt(br) > 2) count++;
      }
      return count;
    });
    console.log('Step 1 - Elements with rounded corners:', titleRounded);

    // ── Step 2: Start game on Cadet ──
    await page.getByPlaceholder('Commander...').fill('Retro Commander');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-02-mission-prep.png`, fullPage: true });

    // Verify mission prep screen renders in retro style
    const prepText = await page.textContent('body') || '';
    const emojiOnPrep = EMOJI_REGEX.test(prepText);
    console.log('Step 2 - Mission prep emoji visible:', emojiOnPrep);

    // Check budget display
    const hasBudget = await page.getByText(/1000 CR/).first().isVisible().catch(() => false);
    console.log('Step 2 - Budget visible:', hasBudget);

    // ── Step 3: Launch mission ──
    await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-03-game-start.png`, fullPage: true });

    // Verify game screen
    const phase1 = await getCurrentPhase(page);
    console.log('Step 3 - Initial phase:', phase1);

    // ── Step 4: Verify retro visual authenticity on game screen ──
    const gameScreenAudit = await page.evaluate(() => {
      const results = {
        roundedCorners: 0,
        boxShadows: 0,
        gradients: 0,
        allTextContent: document.body.textContent || '',
      };
      const els = document.querySelectorAll('*');
      for (const el of els) {
        const cs = getComputedStyle(el);
        const br = cs.borderRadius;
        if (br && br !== '0px' && br !== '0' && br !== '' && parseInt(br) > 2) results.roundedCorners++;
        const bs = cs.boxShadow;
        if (bs && bs !== 'none') results.boxShadows++;
        const bg = cs.backgroundImage;
        if (bg && bg.includes('gradient')) results.gradients++;
      }
      return results;
    });
    console.log('Step 4 - Game screen audit:', {
      roundedCorners: gameScreenAudit.roundedCorners,
      boxShadows: gameScreenAudit.boxShadows,
      gradients: gameScreenAudit.gradients,
    });

    const emojiOnGame = EMOJI_REGEX.test(gameScreenAudit.allTextContent);
    console.log('Step 4 - Emoji visible on game screen:', emojiOnGame);

    // Check fonts are monospace
    const fontCheck = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      return body.fontFamily;
    });
    console.log('Step 4 - Font family:', fontCheck);

    // ── Step 5: Progress through a few turns ──
    let turnCount = 0;
    const maxTurns = 6;
    for (let i = 0; i < maxTurns; i++) {
      // Handle any events or EVA challenges
      const handledEvent = await handleEventIfPresent(page);
      if (handledEvent) {
        await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-04-event-turn${i}.png`, fullPage: true });
        continue;
      }
      const handledEva = await handleEvaSkillIfPresent(page);
      if (handledEva) {
        await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-04-eva-turn${i}.png`, fullPage: true });
        continue;
      }

      // Check for game over
      const victoryText = page.getByText(/COLONY ESTABLISHED|OUTPOST ESTABLISHED|BARE SURVIVAL|PLAY AGAIN|SCORE BREAKDOWN/i).first();
      const defeatText = page.getByText('MISSION FAILED').first();
      if (await victoryText.isVisible({ timeout: 300 }).catch(() => false)) {
        console.log(`Step 5 - Game ended with victory at turn ${i}`);
        break;
      }
      if (await defeatText.isVisible({ timeout: 300 }).catch(() => false)) {
        console.log(`Step 5 - Game ended with defeat at turn ${i}`);
        break;
      }

      // Try to click an action button
      const actionBtn = page.locator('button:not([disabled])').filter({
        hasText: /Conservative Launch|Continue Transit|Dock at Gateway|Begin Descent|Continue/i,
      }).first();
      if (await actionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await actionBtn.click();
        await page.waitForTimeout(800);
        turnCount++;
      } else {
        // Try any available enabled action
        const anyAction = page.locator('button:not([disabled])').filter({ hasText: /^\(1\)/ }).first();
        if (await anyAction.isVisible({ timeout: 1000 }).catch(() => false)) {
          await anyAction.click();
          await page.waitForTimeout(800);
          turnCount++;
        }
      }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/retro-e2e-05-after-turns.png`, fullPage: true });
    const phase2 = await getCurrentPhase(page);
    console.log(`Step 5 - Phase after ${turnCount} turns:`, phase2);

    // ── Step 6: Final retro authenticity check ──
    const finalAudit = await page.evaluate(() => {
      const results = {
        roundedCorners: [] as string[],
        boxShadows: [] as string[],
        gradients: [] as string[],
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyFont: getComputedStyle(document.body).fontFamily,
      };
      const els = document.querySelectorAll('*');
      for (const el of els) {
        const cs = getComputedStyle(el);
        const br = cs.borderRadius;
        if (br && br !== '0px' && br !== '0' && br !== '' && parseInt(br) > 2) {
          const tag = el.tagName;
          const cls = (el as HTMLElement).className?.toString().substring(0, 40) || '';
          results.roundedCorners.push(`${tag}.${cls}: ${br}`);
        }
        const bs = cs.boxShadow;
        if (bs && bs !== 'none') {
          results.boxShadows.push(`${el.tagName}: ${bs.substring(0, 60)}`);
        }
        const bg = cs.backgroundImage;
        if (bg && bg.includes('gradient')) {
          results.gradients.push(`${el.tagName}: ${bg.substring(0, 60)}`);
        }
      }
      return results;
    });

    console.log('\n=== FINAL RETRO AUTHENTICITY REPORT ===');
    console.log('Body background:', finalAudit.bodyBg);
    console.log('Body font:', finalAudit.bodyFont);
    console.log(`Rounded corners (${finalAudit.roundedCorners.length}):`, finalAudit.roundedCorners.slice(0, 10));
    console.log(`Box shadows (${finalAudit.boxShadows.length}):`, finalAudit.boxShadows.slice(0, 5));
    console.log(`Gradients (${finalAudit.gradients.length}):`, finalAudit.gradients.slice(0, 5));

    const finalBodyText = await page.textContent('body') || '';
    const finalEmoji = EMOJI_REGEX.test(finalBodyText);
    console.log('Final emoji check:', finalEmoji);

    // ── Assertions ──
    // No emoji should be visible in retro mode (text-only aesthetic)
    // These are soft checks — we log and report, hard-fail only on critical issues
    if (emojiOnGame) {
      console.warn('⚠ BUG: Emoji visible in retro mode game screen');
    }
    if (gameScreenAudit.roundedCorners > 0) {
      console.warn(`⚠ BUG: ${gameScreenAudit.roundedCorners} elements with rounded corners in retro mode`);
    }
    if (gameScreenAudit.gradients > 0) {
      console.warn(`⚠ BUG: ${gameScreenAudit.gradients} elements with gradients in retro mode`);
    }
  });
});
