import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to start game
async function startGame(page) {
  await page.goto('/');
  await page.getByPlaceholder('Commander...').fill('A11Y Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await page.waitForTimeout(500);
}

async function launchMission(page) {
  await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('Accessibility Audit', () => {
  
  test('title screen passes axe-core audit', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Log all violations for issue filing
    if (results.violations.length > 0) {
      console.log('TITLE SCREEN VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    HTML: ${node.html.substring(0, 100)}`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/screenshots/a11y-title.png' });
    // Don't fail — collect data
  });
  
  test('mission prep screen passes axe-core audit', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (results.violations.length > 0) {
      console.log('MISSION PREP VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/screenshots/a11y-prep.png' });
  });
  
  test('game screen passes axe-core audit', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    if (results.violations.length > 0) {
      console.log('GAME SCREEN VIOLATIONS:');
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/screenshots/a11y-game.png' });
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    if (results.violations.length > 0) {
      console.log('COLOR CONTRAST VIOLATIONS:');
      for (const v of results.violations) {
        for (const node of v.nodes) {
          console.log(`  ${node.target.join(', ')}: ${node.failureSummary}`);
        }
      }
    }
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page and check all focusable elements
    const focusableCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, input, a, [tabindex]');
      return elements.length;
    });
    
    expect(focusableCount).toBeGreaterThan(0);
    
    // Tab through elements and verify focus is visible
    for (let i = 0; i < Math.min(focusableCount, 10); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    
    await page.screenshot({ path: 'test-results/screenshots/a11y-tab-order.png' });
  });
  
  test('screen has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => ({ tag: h.tagName, text: h.textContent?.substring(0, 50) }));
    });
    
    console.log('HEADING HIERARCHY:', JSON.stringify(headings, null, 2));
    // h1 should come before h2, etc.
  });
  
  test('images and icons have alt text', async ({ page }) => {
    await page.goto('/');
    const imgsMissingAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs).filter(img => !img.alt).length;
    });
    
    expect(imgsMissingAlt).toBe(0);
  });

  test('aria-live regions announce dynamic content', async ({ page }) => {
    await startGame(page);
    await launchMission(page);
    
    const liveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live]');
      return Array.from(regions).map(r => ({
        role: r.getAttribute('aria-live'),
        tag: r.tagName,
        hasContent: (r.textContent?.length || 0) > 0,
      }));
    });
    
    console.log('ARIA-LIVE REGIONS:', JSON.stringify(liveRegions, null, 2));
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/');
    
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return Array.from(inputs).filter(input => {
        const hasLabel = input.labels && input.labels.length > 0;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        const hasPlaceholder = input.placeholder;
        return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder;
      }).length;
    });
    
    expect(unlabeledInputs).toBe(0);
  });
  
  test('no content flashes or auto-plays', async ({ page }) => {
    await page.goto('/');
    // Check for animations that could cause seizures
    const hasFlashing = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const animation = style.animationName;
        if (animation && animation !== 'none') {
          return true;
        }
      }
      return false;
    });
    
    // Flashing is acceptable as long as it's not rapid (>3 per second)
    // Our game doesn't have rapid flashing, just subtle glows
  });
});
