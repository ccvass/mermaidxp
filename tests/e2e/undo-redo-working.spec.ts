import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3000',
});

test.describe('Undo/Redo System Working Test', () => {
  test('basic undo/redo functionality works', async ({ page }) => {
    console.log('Starting undo/redo test on port 3000...');

    // Go to the app
    await page.goto('/');

    // Wait for the editor to be ready
    await page.waitForSelector('textarea', { timeout: 5000 });
    console.log('Editor found');

    // Get the initial code
    const textarea = page.locator('textarea').first();
    const initialCode = await textarea.inputValue();
    console.log('Initial code length:', initialCode.length);

    // Type something new
    await textarea.clear();
    await textarea.type('graph TD\n    A[Start]');

    // Wait for debounce (500ms) plus a bit extra
    await page.waitForTimeout(700);

    // Press Ctrl+Z to undo
    await page.keyboard.press('Control+z');
    console.log('Pressed Ctrl+Z');

    // Wait for undo to process
    await page.waitForTimeout(500);

    // Check if the text was reverted
    const afterUndo = await textarea.inputValue();
    console.log('After undo:', afterUndo);

    // The undo should have restored the initial code
    expect(afterUndo).toBe(initialCode);

    // Press Ctrl+Y to redo
    await page.keyboard.press('Control+y');
    console.log('Pressed Ctrl+Y');

    // Wait for redo to process
    await page.waitForTimeout(500);

    // Check if the text was restored
    const afterRedo = await textarea.inputValue();
    console.log('After redo:', afterRedo);

    expect(afterRedo).toContain('graph TD');
    expect(afterRedo).toContain('A[Start]');
  });

  test('toolbar buttons work correctly', async ({ page }) => {
    console.log('Testing toolbar buttons...');

    await page.goto('/');
    await page.waitForSelector('textarea', { timeout: 5000 });

    const textarea = page.locator('textarea').first();
    const initialCode = await textarea.inputValue();

    // Make a change
    await textarea.clear();
    await textarea.type('flowchart LR\n    Test');
    await page.waitForTimeout(700); // Wait for debounce

    // Find and click the undo button
    const undoButton = page.locator('button[title*="Undo"]').first();

    // Check if undo button is enabled
    const isUndoEnabled = await undoButton.isEnabled();
    console.log('Undo button enabled:', isUndoEnabled);
    expect(isUndoEnabled).toBe(true);

    // Click undo
    await undoButton.click();
    await page.waitForTimeout(500);

    // Check the text was undone
    const afterUndo = await textarea.inputValue();
    expect(afterUndo).toBe(initialCode);

    // Now redo button should be enabled
    const redoButton = page.locator('button[title*="Redo"]').first();
    const isRedoEnabled = await redoButton.isEnabled();
    console.log('Redo button enabled after undo:', isRedoEnabled);
    expect(isRedoEnabled).toBe(true);

    // Click redo
    await redoButton.click();
    await page.waitForTimeout(500);

    // Check the text was redone
    const afterRedo = await textarea.inputValue();
    expect(afterRedo).toContain('flowchart LR');
  });

  test('multiple changes can be undone', async ({ page }) => {
    console.log('Testing multiple undo/redo...');

    await page.goto('/');
    await page.waitForSelector('textarea', { timeout: 5000 });

    const textarea = page.locator('textarea').first();

    // Clear and add first change
    await textarea.clear();
    await textarea.type('graph LR');
    await page.waitForTimeout(700); // Wait for debounce

    // Add second change
    await textarea.type('\n    A --> B');
    await page.waitForTimeout(700); // Wait for debounce

    // Add third change
    await textarea.type('\n    B --> C');
    await page.waitForTimeout(700); // Wait for debounce

    const fullText = await textarea.inputValue();
    console.log('Full text before undo:', fullText);

    // Undo once
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    let currentText = await textarea.inputValue();
    console.log('After 1 undo:', currentText);
    expect(currentText).not.toContain('B --> C');
    expect(currentText).toContain('A --> B');

    // Undo again
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    currentText = await textarea.inputValue();
    console.log('After 2 undos:', currentText);
    expect(currentText).not.toContain('A --> B');
    expect(currentText).toContain('graph LR');

    // Redo once
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);
    currentText = await textarea.inputValue();
    console.log('After 1 redo:', currentText);
    expect(currentText).toContain('A --> B');
  });

  test('debug panel shows correct state', async ({ page }) => {
    console.log('Checking debug panel...');

    await page.goto('/');
    await page.waitForSelector('textarea', { timeout: 5000 });

    // Look for debug panel
    const debugPanel = page.locator('[data-testid="undo-redo-status"]');
    const isVisible = await debugPanel.isVisible();
    console.log('Debug panel visible:', isVisible);

    if (isVisible) {
      // Check initial state
      const historyText = await debugPanel.locator('text=/History:.*\\//.').textContent();
      console.log('History text:', historyText);

      // Make a change
      const textarea = page.locator('textarea').first();
      await textarea.clear();
      await textarea.type('New content');
      await page.waitForTimeout(500);

      // Check if Can Undo shows ✅
      const canUndoText = await debugPanel.locator('text=/Can Undo:/').textContent();
      console.log('Can Undo text:', canUndoText);
      expect(canUndoText).toContain('✅');
    }
  });
});
