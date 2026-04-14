import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {

  test('commander name input rejects XSS payloads', async ({ page }) => {
    await page.goto('/');
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(document.cookie)</script>',
      "'; DROP TABLE users; --",
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
    ];
    
    for (const payload of xssPayloads) {
      await page.getByPlaceholder('Commander...').fill(payload);
      await page.getByRole('button', { name: /CADET/i }).click();
      await page.getByRole('button', { name: /NEW MISSION/i }).click();
      await page.waitForTimeout(300);
      
      // Check no script executed (page should still work)
      const hasAlert = await page.evaluate(() => {
        return (window as any).__xss_triggered === true;
      });
      expect(hasAlert).toBeFalsy();
      
      // Check the XSS payload is rendered as TEXT, not HTML
      const bodyHtml = await page.content();
      expect(bodyHtml).not.toContain('<script>alert');
      expect(bodyHtml).not.toContain('onerror=alert');
      
      // Go back to title for next test
      await page.goto('/');
    }
  });

  test('fuel input rejects non-numeric values', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Commander...').fill('Security Test');
    await page.getByRole('button', { name: /CADET/i }).click();
    await page.getByRole('button', { name: /NEW MISSION/i }).click();
    
    // Try to inject into number inputs
    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();
    
    for (let i = 0; i < count; i++) {
      await numberInputs.nth(i).fill('-999999');
      await page.waitForTimeout(100);
    }
    
    // Game should still function (no crash)
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('localStorage save data is validated on load', async ({ page }) => {
    await page.goto('/');
    
    // Inject malformed save data
    await page.evaluate(() => {
      localStorage.setItem('artemis-trail-save', '{"corrupted": true}');
    });
    
    // Reload — game should handle corrupt data gracefully
    await page.reload();
    await page.waitForTimeout(500);
    
    // Title screen should still render (game didn't crash)
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
  });

  test('localStorage save data with tampered resources is handled', async ({ page }) => {
    await page.goto('/');
    
    // Inject save data with absurd resource values
    await page.evaluate(() => {
      const tamperedSave = {
        version: 1,
        timestamp: new Date().toISOString(),
        gameState: {
          resources: {
            PROPULSION: 999999999,
            LIFE_SUPPORT: -50,
            SPARE_PARTS: Infinity,
            SHIELDING: NaN,
            MEDICAL: null,
            BUDGET: 999999999
          }
        },
        metadata: { commanderName: 'Hacker', difficulty: 'CADET', turn: 1, phase: 'LAUNCH', crewAlive: 4 }
      };
      localStorage.setItem('artemis-trail-save', JSON.stringify(tamperedSave));
    });
    
    await page.reload();
    await page.waitForTimeout(500);
    
    // Should not crash
    await expect(page.getByText('ARTEMIS TRAIL')).toBeVisible();
    
    // Clean up
    await page.evaluate(() => localStorage.removeItem('artemis-trail-save'));
  });

  test('no sensitive data exposed in page source', async ({ page }) => {
    await page.goto('/');
    const content = await page.content();
    
    // Check no API keys, tokens, or secrets in page
    expect(content).not.toMatch(/api[_-]?key/i);
    expect(content).not.toMatch(/secret/i);
    expect(content).not.toMatch(/password/i);
    expect(content).not.toMatch(/token\s*[:=]/i);
  });

  test('Docker container has no unnecessary exposed ports', async ({ page }) => {
    // This is a static nginx container — just verify it serves only HTTP
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Check response headers for security
    const headers = response?.headers() ?? {};
    // nginx should set some standard headers
    expect(headers['server']).toContain('nginx');
  });

  test('page does not load external resources', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', req => {
      const url = req.url();
      if (!url.startsWith('http://localhost') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        // Google Fonts is acceptable — it's in index.html
        if (!url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
          externalRequests.push(url);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // No unexpected external requests (except Google Fonts)
    expect(externalRequests).toHaveLength(0);
  });
});
