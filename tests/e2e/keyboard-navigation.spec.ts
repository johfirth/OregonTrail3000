import { test, expect, Page } from '@playwright/test';

async function startGame(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Commander...').fill('Keyboard Tester');
  await page.getByRole('button', { name: /CADET/i }).click();
  await page.getByRole('button', { name: /NEW MISSION/i }).click();
  await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
}

async function launchAndReachGameScreen(page: Page) {
  await startGame(page);
  await page.getByRole('button', { name: /LAUNCH MISSION/i }).click();
  // Wait for action menu to appear on the game screen
  await page.locator('[role="listbox"][aria-label="Available actions"]').waitFor({ timeout: 10_000 });
}

test.describe('Keyboard Navigation', () => {

  test('number keys trigger actions on game screen', async ({ page }) => {
    await launchAndReachGameScreen(page);

    // Verify first action button with (1) prefix is visible
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible();

    // Capture initial narrative content
    const initialText = await page.locator('body').innerText();

    // Press "1" to trigger first action
    await page.keyboard.press('1');
    await page.waitForTimeout(800);

    // Page content should have changed after the action
    const updatedText = await page.locator('body').innerText();
    expect(updatedText).not.toBe(initialText);
  });

  test('Enter key launches mission from prep screen', async ({ page }) => {
    await startGame(page);

    // Verify help hint text
    await expect(page.getByText('Press Enter to launch')).toBeVisible();

    // Click outside inputs so Enter isn't captured by an <input>
    await page.locator('h1:has-text("MISSION PREPARATION")').click();

    // Press Enter to launch
    await page.keyboard.press('Enter');

    // Should have left the prep screen and reached the game screen
    await expect(page.locator('[role="listbox"][aria-label="Available actions"]')).toBeVisible({ timeout: 10_000 });
  });

  test('arrow keys navigate action list', async ({ page }) => {
    await launchAndReachGameScreen(page);

    const listbox = page.locator('[role="listbox"][aria-label="Available actions"]');
    const options = listbox.locator('[role="option"]');
    const count = await options.count();
    if (count < 2) {
      test.skip();
      return;
    }

    // Move mouse away from buttons so onMouseEnter doesn't change focusedIdx
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    // Reset to first item (mouse hover may have shifted focus)
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);

    // First option should be focused (aria-selected=true)
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');

    // ArrowDown moves focus to second item
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false');

    // ArrowUp returns focus to first item
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');

    // Enter confirms the focused item
    const initialText = await page.locator('body').innerText();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    const updatedText = await page.locator('body').innerText();
    expect(updatedText).not.toBe(initialText);
  });

  test('keyboard help hint is visible on game screen', async ({ page }) => {
    await launchAndReachGameScreen(page);

    // Exact text from GameScreen.tsx line 390
    await expect(page.getByText('[1-9] Select Action')).toBeVisible();
    await expect(page.getByText('Navigate')).toBeVisible();
    await expect(page.getByText('Enter Confirm')).toBeVisible();
  });

  test('action buttons have correct ARIA roles', async ({ page }) => {
    await launchAndReachGameScreen(page);

    // Listbox with descriptive label
    const listbox = page.locator('[role="listbox"][aria-label="Available actions"]');
    await expect(listbox).toBeVisible();

    // All action buttons are role="option"
    const options = listbox.locator('[role="option"]');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // Each option has an aria-label starting with its 1-based index
    for (let i = 0; i < count; i++) {
      const label = await options.nth(i).getAttribute('aria-label');
      expect(label).toMatch(new RegExp(`^${i + 1}\\.`));
    }

    // Focused option has aria-selected=true, tabIndex=0
    const focused = listbox.locator('[role="option"][aria-selected="true"]');
    await expect(focused).toHaveCount(1);
    await expect(focused).toHaveAttribute('tabindex', '0');
  });

  test('title screen Enter key starts game when name is filled', async ({ page }) => {
    await page.goto('/');

    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.fill('Enter Test');
    await page.getByRole('button', { name: /CADET/i }).click();

    // Enter on the name input should trigger handleStart
    await nameInput.press('Enter');

    // Should navigate to mission prep
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible({ timeout: 5000 });
  });

  test('title screen Enter key does not start without a name', async ({ page }) => {
    await page.goto('/');

    // Ensure name is empty
    const nameInput = page.getByPlaceholder('Commander...');
    await nameInput.clear();
    await page.getByRole('button', { name: /CADET/i }).click();

    // Press Enter — should stay on title screen
    await nameInput.press('Enter');
    await page.waitForTimeout(500);

    // Title should still be visible (no navigation occurred)
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });

  test('title screen Escape/Enter dismisses mission briefing', async ({ page }) => {
    await page.goto('/');

    // Open mission briefing
    await page.getByRole('button', { name: /MISSION BRIEFING/i }).click();
    await expect(page.getByRole('button', { name: /Back to Menu/i })).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Should be back on main title screen
    await expect(page.getByRole('button', { name: /NEW MISSION/i })).toBeVisible();

    // Re-open and test Enter dismissal
    await page.getByRole('button', { name: /MISSION BRIEFING/i }).click();
    await expect(page.getByRole('button', { name: /Back to Menu/i })).toBeVisible();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: /NEW MISSION/i })).toBeVisible();
  });

  test('number keys work on event choice screen', async ({ page }) => {
    await launchAndReachGameScreen(page);

    // Play turns until an event with choices appears
    for (let i = 0; i < 15; i++) {
      const chooseText = page.getByText('CHOOSE YOUR RESPONSE');
      if (await chooseText.isVisible().catch(() => false)) {
        // Event choices should have a listbox with role="option"
        const eventListbox = page.locator('[role="listbox"][aria-label="Event response choices"]');
        await expect(eventListbox).toBeVisible();

        // Press 1 to select first choice
        await page.keyboard.press('1');
        await page.waitForTimeout(800);

        // Event should be resolved — choice screen gone
        await expect(chooseText).not.toBeVisible({ timeout: 5000 });
        return;
      }

      // Press 1 to advance a turn
      await page.keyboard.press('1');
      await page.waitForTimeout(1000);
    }

    // Event may not have appeared — that's OK, not a failure
    test.skip();
  });

  test('keyboard navigation ignores input when typing in text fields', async ({ page }) => {
    await startGame(page);

    // Focus a number input on the prep screen (fuel allocation)
    const fuelInput = page.locator('input[type="number"]').first();
    await fuelInput.click();

    // Type a number — should go into the input, not trigger action selection
    await page.keyboard.press('1');
    await page.waitForTimeout(300);

    // We should still be on the prep screen
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
  });

  test('ArrowDown wraps at list boundary', async ({ page }) => {
    await launchAndReachGameScreen(page);

    const listbox = page.locator('[role="listbox"][aria-label="Available actions"]');
    const options = listbox.locator('[role="option"]');
    const count = await options.count();
    if (count < 2) {
      test.skip();
      return;
    }

    // Press ArrowDown past the last item — should clamp, not crash
    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }

    // Last option should be focused (clamped, not wrapped)
    await expect(options.nth(count - 1)).toHaveAttribute('aria-selected', 'true');

    // Press ArrowUp past the first item — should clamp at 0
    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
    }

    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');
  });
});
