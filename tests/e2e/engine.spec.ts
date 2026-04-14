import { test, expect } from '@playwright/test';

test.describe('Engine - Core Logic', () => {
  test('game engine initializes in browser', async ({ page }) => {
    await page.goto('/');

    // Evaluate engine directly in browser context
    const result = await page.evaluate(() => {
      return document.title;
    });
    expect(result).toContain('Artemis Trail');
  });
});
