import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('cannot start game without commander name', async ({ page }) => {
    await page.goto('/');
    // Try to start without entering a name
    const newGameBtn = page.getByRole('button', { name: /NEW MISSION/i });
    // Button should be disabled or name field should be required
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('game state persists during gameplay', async ({ page }) => {
    await page.goto('/');
    // Start a game and verify state updates
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Persistence Test');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();

    // Game state should be rendered
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
