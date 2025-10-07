import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load the app and show main components', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('textarea, .CodeMirror', { timeout: 10000 });

    // Check for main components
    const editor = page.locator('textarea').first();
    await expect(editor).toBeVisible();

    // Check for toolbar
    const toolbar = page.locator('button[title*="Undo"]');
    await expect(toolbar).toBeVisible();

    // Get console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Wait a bit and check for errors
    await page.waitForTimeout(2000);

    // Try to get page content for debugging
    const pageContent = await page.content();
    const hasDebugPanel = pageContent.includes('undo-redo-debug-panel') || pageContent.includes('Undo/Redo Status');
    console.log('Has debug panel in HTML:', hasDebugPanel);

    // Check if UndoRedoDebug component exists in the DOM
    const debugElements = await page.$$('[data-testid="undo-redo-debug-panel"]');
    console.log('Debug panel elements found:', debugElements.length);

    // Check for any element with "Undo/Redo" text
    const undoRedoText = await page.$$('text=/Undo.*Redo/');
    console.log('Undo/Redo text elements found:', undoRedoText.length);
  });
});
