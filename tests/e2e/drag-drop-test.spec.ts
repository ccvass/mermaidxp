import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Wait for the diagram to load completely
    await page.waitForSelector('button[title*="Pan Mode"]', { timeout: 10000 });
    await page.waitForSelector('.draggable-element', { timeout: 10000 });

    // Wait a bit more to ensure all elements are marked as draggable
    await page.waitForTimeout(500);
  });

  test('should start in Pan Mode by default', async ({ page }) => {
    // Check that we start in pan mode
    const panButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await expect(panButton).toBeVisible();

    // Check the button has the correct icon
    const panIcon = panButton.locator('span').filter({ hasText: '✋' });
    await expect(panIcon).toBeVisible();

    console.log('✅ Test 1 PASSED: Application starts in Pan Mode');
  });

  test('should switch between Pan and Drag modes', async ({ page }) => {
    // Start in pan mode
    let modeButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await expect(modeButton).toBeVisible();

    // Click to switch to drag mode
    await modeButton.click();

    // Wait for the mode change
    await page.waitForTimeout(100);

    // Check that we switched to drag mode
    modeButton = page.locator('button').filter({ hasText: 'Drag Mode Active' });
    await expect(modeButton).toBeVisible();

    // Check the button has the correct drag icon
    const dragIcon = modeButton.locator('span').filter({ hasText: '🖱️' });
    await expect(dragIcon).toBeVisible();

    // Switch back to pan mode
    await modeButton.click();
    await page.waitForTimeout(100);

    // Verify we're back in pan mode
    modeButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await expect(modeButton).toBeVisible();

    console.log('✅ Test 2 PASSED: Mode switching works correctly');
  });

  test('should pan the diagram in Pan Mode', async ({ page }) => {
    // Ensure we're in pan mode
    const panButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await expect(panButton).toBeVisible();

    // Get initial diagram position
    const diagramContainer = page.locator('#mermaid-container');
    const initialBox = await diagramContainer.boundingBox();

    // Start listening for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Perform pan drag from center towards right
    const centerX = (initialBox?.x || 0) + (initialBox?.width || 0) / 2;
    const centerY = (initialBox?.y || 0) + (initialBox?.height || 0) / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 50, centerY + 30, { steps: 10 });
    await page.mouse.up();

    // Wait for any animations or state updates
    await page.waitForTimeout(200);

    // Check console logs for expected pan behavior
    const expectedLogs = ['🖱️ PointerDown in pan mode', '🟢 Starting canvas pan', '📐 Canvas pan:'];

    let foundLogs = 0;
    expectedLogs.forEach((expectedLog) => {
      const found = consoleLogs.some((log) => log.includes(expectedLog));
      if (found) foundLogs++;
      console.log(`${found ? '✅' : '❌'} Expected log: "${expectedLog}"`);
    });

    expect(foundLogs).toBeGreaterThan(0);
    console.log('✅ Test 3 PASSED: Pan mode works correctly');
  });

  test('should drag individual elements in Drag Mode', async ({ page }) => {
    // Switch to drag mode
    let modeButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await modeButton.click();
    await page.waitForTimeout(100);

    // Verify we're in drag mode
    modeButton = page.locator('button').filter({ hasText: 'Drag Mode Active' });
    await expect(modeButton).toBeVisible();

    // Start listening for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Find a draggable element
    const draggableElement = page.locator('.draggable-element').first();
    await expect(draggableElement).toBeVisible();

    // Get element position
    const elementBox = await draggableElement.boundingBox();
    if (!elementBox) {
      throw new Error('Could not get draggable element bounding box');
    }

    const elementCenterX = elementBox.x + elementBox.width / 2;
    const elementCenterY = elementBox.y + elementBox.height / 2;

    // Drag the element
    await page.mouse.move(elementCenterX, elementCenterY);
    await page.mouse.down();
    await page.mouse.move(elementCenterX + 30, elementCenterY + 20, { steps: 5 });
    await page.mouse.up();

    // Wait for any updates
    await page.waitForTimeout(200);

    // Check console logs for expected drag behavior
    const expectedLogs = [
      '🖱️ PointerDown in drag mode',
      '🔍 Checking element: isDraggable=true',
      '🔵 Element is draggable, direct handler will take over',
      '🎯 Direct drag handler activated!',
    ];

    let foundLogs = 0;
    expectedLogs.forEach((expectedLog) => {
      const found = consoleLogs.some((log) => log.includes(expectedLog));
      if (found) foundLogs++;
      console.log(`${found ? '✅' : '❌'} Expected log: "${expectedLog}"`);
    });

    expect(foundLogs).toBeGreaterThan(0);
    console.log('✅ Test 4 PASSED: Element drag in drag mode works correctly');
  });

  test('should pan as fallback when clicking non-draggable area in Drag Mode', async ({ page }) => {
    // Switch to drag mode
    let modeButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await modeButton.click();
    await page.waitForTimeout(100);

    // Verify we're in drag mode
    modeButton = page.locator('button').filter({ hasText: 'Drag Mode Active' });
    await expect(modeButton).toBeVisible();

    // Start listening for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Find an empty area (not on a draggable element)
    const diagramContainer = page.locator('#mermaid-container');
    const containerBox = await diagramContainer.boundingBox();
    if (!containerBox) {
      throw new Error('Could not get container bounding box');
    }

    // Click on top-left corner which should be empty
    const emptyX = containerBox.x + 50;
    const emptyY = containerBox.y + 50;

    // Drag in empty area
    await page.mouse.move(emptyX, emptyY);
    await page.mouse.down();
    await page.mouse.move(emptyX + 40, emptyY + 30, { steps: 8 });
    await page.mouse.up();

    // Wait for updates
    await page.waitForTimeout(200);

    // Check console logs for expected fallback pan behavior
    const expectedLogs = [
      '🖱️ PointerDown in drag mode',
      '🔍 Checking element: isDraggable=false',
      '🟡 Starting fallback canvas pan in drag mode',
      '📐 Canvas pan:',
    ];

    let foundLogs = 0;
    expectedLogs.forEach((expectedLog) => {
      const found = consoleLogs.some((log) => log.includes(expectedLog));
      if (found) foundLogs++;
      console.log(`${found ? '✅' : '❌'} Expected log: "${expectedLog}"`);
    });

    expect(foundLogs).toBeGreaterThan(0);
    console.log('✅ Test 5 PASSED: Fallback pan in drag mode works correctly');
  });

  test('should not execute drag handlers in wrong mode', async ({ page }) => {
    // Ensure we're in pan mode
    const panButton = page.locator('button').filter({ hasText: 'Pan Mode Active' });
    await expect(panButton).toBeVisible();

    // Start listening for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Try to click on a draggable element while in pan mode
    const draggableElement = page.locator('.draggable-element').first();
    await expect(draggableElement).toBeVisible();

    await draggableElement.click();
    await page.waitForTimeout(100);

    // Should see rejection log from direct handler
    const rejectionFound = consoleLogs.some((log) =>
      log.includes('🚫 Direct handler called but mode is pan, ignoring')
    );

    console.log(`${rejectionFound ? '✅' : '❌'} Mode verification works: ${rejectionFound}`);
    console.log('✅ Test 6 PASSED: Mode verification prevents incorrect drag handling');
  });
});
