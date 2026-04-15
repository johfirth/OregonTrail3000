import { test, expect, Page } from '@playwright/test';

async function switchToRetro(page: Page) {
  const settingsBtn = page.locator('button').filter({ hasText: /settings/i }).first();
  if (await settingsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await settingsBtn.click();
    await page.waitForTimeout(300);
    const retroBtn = page.locator('button').filter({ hasText: /RETRO/i }).first();
    if (await retroBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await retroBtn.click();
      await page.waitForTimeout(300);
    }
    const backBtn = page.locator('button').filter({ hasText: /←|back/i }).first();
    if (await backBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(300);
    }
  }
}

async function startGame(page: Page) {
  await page.getByPlaceholder('Commander...').fill('UX Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await page.waitForTimeout(500);
}

async function launchMission(page: Page) {
  await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('UX Review - NASA Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('title screen menu is clear and discoverable', async ({ page }) => {
    // Check main CTA is prominent
    await expect(page.getByRole('button', { name: /NEW MISSION/i })).toBeVisible();
    // Check difficulty options have descriptions
    await expect(page.getByText(/learn the ropes|standard challenge|for veterans|one shot/i)).toBeVisible();
    // Settings gear should be findable
    const settingsBtn = page.locator('button').filter({ hasText: /settings/i });
    await expect(settingsBtn.first()).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/ux-nasa-title.png' });
  });

  test('mission prep has clear budget feedback', async ({ page }) => {
    await startGame(page);
    // Budget should be visible
    await expect(page.getByText(/\d+ CR/).first()).toBeVisible();
    // Resource names should be readable
    await expect(page.getByText(/Propulsion/i).first()).toBeVisible();
    await expect(page.getByText(/Life Support/i).first()).toBeVisible();
    // Launch button should explain why disabled if it is
    await page.screenshot({ path: 'test-results/screenshots/ux-nasa-prep.png' });
  });

  test('consumption sub-menu shows all options with descriptions', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    await page.waitForTimeout(500);
    
    // Find and click Set Consumption action
    // Try keyboard first
    await page.mouse.click(400, 300); // click body to get focus
    await page.waitForTimeout(300);
    
    // Look for consumption-related button
    const consumptionBtn = page.locator('button').filter({ hasText: /consumption/i }).first();
    if (await consumptionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await consumptionBtn.click();
      await page.waitForTimeout(500);
      
      // Sub-menu should show all 3 options
      await page.screenshot({ path: 'test-results/screenshots/ux-nasa-consumption-menu.png' });
      
      // Check that descriptions are visible
      const hasRationing = await page.getByText(/rationing/i).isVisible().catch(() => false);
      const hasStandard = await page.getByText(/standard/i).isVisible().catch(() => false);
      const hasGenerous = await page.getByText(/generous/i).isVisible().catch(() => false);
      
      console.log('Consumption menu options visible:', { hasRationing, hasStandard, hasGenerous });
      
      // Check for SD/turn rates
      const hasRates = await page.getByText(/SD\/turn/i).isVisible().catch(() => false);
      console.log('Shows SD/turn rates:', hasRates);
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('game screen shows phase and progress clearly', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    await page.waitForTimeout(500);
    
    // Phase should be identifiable
    // Resource values should be numbers, not raw floats
    await page.screenshot({ path: 'test-results/screenshots/ux-nasa-game.png' });
    
    // Check for floating point display issues (e.g., "38.50000000001")
    const bodyText = await page.textContent('body') || '';
    const hasRawFloats = /\d+\.\d{3,}/.test(bodyText);
    console.log('Has raw floating point numbers:', hasRawFloats);
    if (hasRawFloats) {
      const matches = bodyText.match(/\d+\.\d{3,}/g);
      console.log('Raw floats found:', matches?.slice(0, 5));
    }
  });

  test('keyboard hints are visible and accurate', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    
    const hintText = await page.getByText(/\[1-9\]/).isVisible().catch(() => false);
    console.log('Keyboard hints visible:', hintText);
    await page.screenshot({ path: 'test-results/screenshots/ux-nasa-hints.png' });
  });
});

test.describe('UX Review - Retro Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await switchToRetro(page);
  });

  test('retro title screen looks like 80s computer', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/ux-retro-title.png' });
    
    // Check for modern UI elements that shouldn't be in retro
    const hasRoundedCorners = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      for (const el of els) {
        const br = getComputedStyle(el).borderRadius;
        if (br && br !== '0px' && br !== '0' && br !== '' && parseInt(br) > 0) return true;
      }
      return false;
    });
    console.log('Retro has rounded corners:', hasRoundedCorners);
    
    const hasBoxShadow = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      for (const el of els) {
        const bs = getComputedStyle(el).boxShadow;
        if (bs && bs !== 'none') return true;
      }
      return false;
    });
    console.log('Retro has box shadows:', hasBoxShadow);
  });

  test('retro game screen is text-only', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/ux-retro-game.png' });
    
    // Check buttons have no visible background color (transparent)
    const buttonBgs = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).slice(0, 5).map(b => ({
        text: b.textContent?.substring(0, 30),
        bg: getComputedStyle(b).backgroundColor,
      }));
    });
    console.log('Retro button backgrounds:', JSON.stringify(buttonBgs));
  });

  test('retro consumption sub-menu is text-based', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    await page.waitForTimeout(500);
    
    const consumptionBtn = page.locator('button').filter({ hasText: /consumption/i }).first();
    if (await consumptionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await consumptionBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/ux-retro-consumption.png' });
    }
  });
});
