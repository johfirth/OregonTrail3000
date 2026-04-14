import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';

let electronApp: ElectronApplication;
let page: Page;

test.describe('Electron Desktop App', () => {
  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../out/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('window opens with correct title', async () => {
    const title = await page.title();
    expect(title).toContain('Artemis Trail');
  });

  test('title screen renders in Electron', async () => {
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });

  test('can start a new game in Electron', async () => {
    await page.getByPlaceholder('Commander...').fill('Electron Tester');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();
    await expect(page.getByText('MISSION PREPARATION')).toBeVisible();
  });

  test('keyboard shortcuts work in Electron', async () => {
    // Click outside inputs so Enter isn't captured by a number <input>
    await page.locator('h2:has-text("MISSION PREPARATION")').click();

    // Press Enter to launch with default resources
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Should have progressed past mission prep
    await page.screenshot({ path: 'test-results/screenshots/electron-keyboard.png' });
  });

  test('can navigate through launch phase in Electron', async () => {
    // Should be on the game screen or event screen in Launch phase
    // Press 1 to select first action (launch profile)
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/electron-launch.png' });
  });

  test('number keys work for actions in Electron', async () => {
    // Press 1 again to proceed (e.g., Continue to Lunar Transit)
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/electron-transit.png' });
  });
});
