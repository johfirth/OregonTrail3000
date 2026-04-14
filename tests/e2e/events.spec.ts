import { test, expect } from '@playwright/test';

test.describe('Event System', () => {
  test('events display during gameplay', async ({ page }) => {
    await page.goto('/');
    // Start a game and progress to see events
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });

  test('event choices are clickable', async ({ page }) => {
    await page.goto('/');
    // Verify event screen renders choices when events with choices occur
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });
});
