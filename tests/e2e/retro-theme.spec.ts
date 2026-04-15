import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper: switch to Retro 80s theme via settings
async function switchToRetro(page) {
  await page.goto('/');
  await page.waitForTimeout(500);

  // Open settings
  const settingsBtn = page.getByRole('button', { name: /settings/i });
  await settingsBtn.click();
  await page.waitForTimeout(500);

  // Click "Retro 80s" theme button
  const retroBtn = page.getByRole('button', { name: /retro 80s/i });
  await retroBtn.click();
  await page.waitForTimeout(300);

  // Close settings via "← Back"
  const backBtn = page.getByRole('button', { name: /back/i });
  await backBtn.click();
  await page.waitForTimeout(300);
}

test.describe('Retro 80s Theme Audit', () => {

  // ─── SETTINGS SCREEN ───────────────────────────────────────────────
  test('retro settings screen — screenshot + visual audit', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const settingsBtn = page.getByRole('button', { name: /settings/i });
    await settingsBtn.click();
    await page.waitForTimeout(500);

    // Switch to retro
    const retroBtn = page.getByRole('button', { name: /retro 80s/i });
    await retroBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/screenshots/retro-settings.png', fullPage: true });

    // axe scan on settings screen in retro mode
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    if (results.violations.length > 0) {
      console.log('RETRO SETTINGS A11Y VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    HTML: ${node.html.substring(0, 120)}`);
          console.log(`    Fix: ${node.failureSummary?.substring(0, 200)}`);
        }
      }
    }
    console.log(`Settings violations count: ${results.violations.length}`);
  });

  // ─── TITLE SCREEN ──────────────────────────────────────────────────
  test('retro title screen — screenshot + visual authenticity', async ({ page }) => {
    await switchToRetro(page);
    await page.screenshot({ path: 'test-results/screenshots/retro-title.png', fullPage: true });

    // Background color should be DOS blue #0000AA → rgb(0, 0, 170)
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log('Body background:', bgColor);

    // Check for modern CSS anti-patterns in retro mode
    const modernCheck = await page.evaluate(() => {
      const results = { roundedCorners: [] as string[], boxShadows: [] as string[], gradients: [] as string[] };
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const cs = getComputedStyle(el);
        const br = cs.borderRadius;
        if (br && br !== '0px' && br !== '0' && br !== '' && !el.matches('input[type="number"]::-webkit-inner-spin-button')) {
          results.roundedCorners.push(`${el.tagName}.${el.className?.toString().substring(0, 30)}: borderRadius=${br}`);
        }
        const bs = cs.boxShadow;
        if (bs && bs !== 'none' && bs !== '') {
          results.boxShadows.push(`${el.tagName}.${el.className?.toString().substring(0, 30)}: boxShadow=${bs.substring(0, 80)}`);
        }
        const bg = cs.backgroundImage;
        if (bg && bg.includes('gradient')) {
          results.gradients.push(`${el.tagName}.${el.className?.toString().substring(0, 30)}: bg=${bg.substring(0, 80)}`);
        }
      }
      return results;
    });

    console.log('\n=== RETRO VISUAL AUTHENTICITY REPORT ===');
    console.log(`Rounded corners (${modernCheck.roundedCorners.length}):`);
    for (const r of modernCheck.roundedCorners.slice(0, 20)) console.log(`  ${r}`);
    console.log(`Box shadows (${modernCheck.boxShadows.length}):`);
    for (const s of modernCheck.boxShadows.slice(0, 10)) console.log(`  ${s}`);
    console.log(`Gradients (${modernCheck.gradients.length}):`);
    for (const g of modernCheck.gradients.slice(0, 10)) console.log(`  ${g}`);

    // axe audit on title screen
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    if (results.violations.length > 0) {
      console.log('\nRETRO TITLE SCREEN A11Y VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    HTML: ${node.html.substring(0, 120)}`);
          console.log(`    Fix: ${node.failureSummary?.substring(0, 200)}`);
        }
      }
    }
    console.log(`Title violations count: ${results.violations.length}`);
  });

  // ─── MISSION PREP SCREEN ──────────────────────────────────────────
  test('retro mission prep — screenshot + a11y audit', async ({ page }) => {
    await switchToRetro(page);

    // Fill name and start game
    await page.getByPlaceholder('Commander...').fill('Retro Test');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/screenshots/retro-mission-prep.png', fullPage: true });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    if (results.violations.length > 0) {
      console.log('RETRO MISSION PREP A11Y VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    HTML: ${node.html.substring(0, 120)}`);
          console.log(`    Fix: ${node.failureSummary?.substring(0, 200)}`);
        }
      }
    }
    console.log(`Mission prep violations count: ${results.violations.length}`);
  });

  // ─── GAME SCREEN ──────────────────────────────────────────────────
  test('retro game screen — screenshot + a11y audit', async ({ page }) => {
    await switchToRetro(page);

    await page.getByPlaceholder('Commander...').fill('Retro Test');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/screenshots/retro-game-screen.png', fullPage: true });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    if (results.violations.length > 0) {
      console.log('RETRO GAME SCREEN A11Y VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    HTML: ${node.html.substring(0, 120)}`);
          console.log(`    Fix: ${node.failureSummary?.substring(0, 200)}`);
        }
      }
    }
    console.log(`Game screen violations count: ${results.violations.length}`);
  });

  // ─── CONTRAST CHECK: HIGHLIGHT/ACCENT ON BUTTONS ──────────────────
  test('retro theme — check highlight color contrast on buttons', async ({ page }) => {
    await switchToRetro(page);

    // Check the selected difficulty button for contrast
    // The selected button has bg=COLORS.highlight (#FFFF55) and color=COLORS.bgDark (#000088)
    const contrastData = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const results: Array<{text: string; bg: string; fg: string}> = [];
      for (const btn of buttons) {
        const cs = getComputedStyle(btn);
        results.push({
          text: btn.textContent?.trim().substring(0, 40) || '',
          bg: cs.backgroundColor,
          fg: cs.color,
        });
      }
      return results;
    });

    console.log('\n=== BUTTON COLOR AUDIT ===');
    for (const b of contrastData) {
      console.log(`  "${b.text}" → bg:${b.bg} fg:${b.fg}`);
    }
  });

  // ─── INTRO / MISSION BRIEFING ─────────────────────────────────────
  test('retro mission briefing — screenshot', async ({ page }) => {
    await switchToRetro(page);

    const briefingBtn = page.getByRole('button', { name: /MISSION BRIEFING/i });
    if (await briefingBtn.isVisible().catch(() => false)) {
      await briefingBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/retro-briefing.png', fullPage: true });
    }
  });
});
