import { test, expect } from '@playwright/test';

test.describe('Undo/Redo Debug Panel', () => {
  test('should show debug panel', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load - look for either CodeMirror or textarea
    await page.waitForSelector('.CodeMirror, textarea', { timeout: 10000 });

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-panel-test.png', fullPage: true });

    // Check if debug panel is visible
    const debugPanel = page.locator('[data-testid="undo-redo-debug-panel"]');
    const isVisible = await debugPanel.isVisible();

    if (!isVisible) {
      console.log('Debug panel not found. Looking for alternative selectors...');
      const alternativePanel = page.locator('text=Undo/Redo Status');
      const altVisible = await alternativePanel.isVisible();
      console.log('Alternative text visible:', altVisible);

      // Get all text content to see what's on the page
      const bodyText = await page.locator('body').innerText();
      console.log('Body contains "Undo/Redo":', bodyText.includes('Undo/Redo'));
    }

    await expect(debugPanel).toBeVisible();
  });
});
