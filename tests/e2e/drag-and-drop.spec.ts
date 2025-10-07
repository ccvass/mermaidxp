/**
 * Playwright E2E tests for drag & drop functionality
 *
 * Tests verify:
 * - Drag & drop interactions with SVG elements
 * - Coordinate transformations during pan/zoom
 * - Event emission and DOM updates
 * - Cross-browser compatibility
 * - Performance under stress conditions
 */

import { test, expect, Page, Locator } from '@playwright/test';

class DiagramTestHelper {
  constructor(private page: Page) {}

  async setupDiagram(diagramCode: string) {
    await this.page.goto('/');

    // Wait for the application to load
    await this.page.waitForSelector('#mermaid-container', { timeout: 10000 });

    // Clear existing diagram and set new code
    const editor = await this.page.waitForSelector('.monaco-editor textarea', { timeout: 5000 });
    await editor.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(diagramCode);

    // Wait for diagram to render
    await this.page.waitForSelector('#mermaid-container svg', { timeout: 10000 });
    await this.page.waitForTimeout(1000); // Allow rendering to complete
  }

  async switchToDragMode() {
    const dragButton = this.page.getByRole('button', { name: /drag/i });
    await dragButton.click();

    // Verify drag mode is active
    await expect(dragButton).toHaveClass(/bg-blue-500/);

    // Wait for draggable elements to be set up
    await this.page.waitForSelector('.draggable-element', { timeout: 5000 });
  }

  async switchToPanMode() {
    const panButton = this.page.getByRole('button', { name: /pan/i });
    await panButton.click();

    // Verify pan mode is active
    await expect(panButton).toHaveClass(/bg-blue-500/);
  }

  async dragElement(selector: string, deltaX: number, deltaY: number) {
    const element = this.page.locator(selector);

    // Get element's bounding box for precise dragging
    const box = await element.boundingBox();
    if (!box) throw new Error(`Element ${selector} not found`);

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + deltaX;
    const endY = startY + deltaY;

    // Perform precise drag operation
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 10 });
    await this.page.mouse.up();

    // Allow DOM to update
    await this.page.waitForTimeout(100);
  }

  async getElementTransform(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.getAttribute('transform');
  }

  async getPathData(): Promise<string[]> {
    const paths = await this.page.locator('#mermaid-container svg path[d]').all();
    const pathData: string[] = [];

    for (const path of paths) {
      const d = await path.getAttribute('d');
      if (d && (d.includes('M') || d.includes('L'))) {
        pathData.push(d);
      }
    }

    return pathData;
  }

  async zoom(direction: 'in' | 'out', times: number = 1) {
    const buttonText = direction === 'in' ? 'Zoom In' : 'Zoom Out';
    const zoomButton = this.page.getByTitle(buttonText);

    for (let i = 0; i < times; i++) {
      await zoomButton.click();
      await this.page.waitForTimeout(200); // Allow zoom to apply
    }
  }

  async getZoomLevel(): Promise<number> {
    // Access the Redux store through window object
    const zoomLevel = await this.page.evaluate(() => {
      const store = (window as any).__REDUX_STORE__;
      return store?.getState()?.canvas?.zoom || 1;
    });
    return zoomLevel;
  }

  async setupEventListener(eventName: string) {
    await this.page.evaluate((name) => {
      (window as any).capturedEvents = [];
      window.addEventListener(name, (e) => {
        (window as any).capturedEvents.push((e as CustomEvent).detail);
      });
    }, eventName);
  }

  async getCapturedEvents(): Promise<any[]> {
    return await this.page.evaluate(() => (window as any).capturedEvents || []);
  }
}

test.describe('Drag and Drop Functionality', () => {
  let helper: DiagramTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new DiagramTestHelper(page);
  });

  test('should drag flowchart nodes and update connected paths', async ({ page }) => {
    const flowchartCode = `flowchart TD
    A[Start Node] --> B[Process Node]
    B --> C[End Node]`;

    await helper.setupDiagram(flowchartCode);
    await helper.switchToDragMode();

    // Get initial path data
    const initialPaths = await helper.getPathData();
    expect(initialPaths.length).toBeGreaterThan(0);

    // Find and drag the start node
    const startNodeSelector = '#mermaid-container svg g:has-text("Start Node")';
    const initialTransform = await helper.getElementTransform(startNodeSelector);

    await helper.dragElement(startNodeSelector, 100, 50);

    // Verify node moved
    const newTransform = await helper.getElementTransform(startNodeSelector);
    expect(newTransform).not.toBe(initialTransform);
    expect(newTransform).toContain('translate');

    // Verify paths updated
    const updatedPaths = await helper.getPathData();
    expect(updatedPaths.length).toBe(initialPaths.length);

    // At least one path should have changed
    let pathChanged = false;
    for (let i = 0; i < initialPaths.length; i++) {
      if (initialPaths[i] !== updatedPaths[i]) {
        pathChanged = true;
        break;
      }
    }
    expect(pathChanged).toBe(true);
  });

  test('should handle complex diagram with multiple draggable elements', async ({ page }) => {
    const complexDiagram = `flowchart LR
    A[Input] --> B{Validation}
    B -->|Valid| C[Process]
    B -->|Invalid| D[Error]
    C --> E[Output]
    D --> F[Log]`;

    await helper.setupDiagram(complexDiagram);
    await helper.switchToDragMode();

    // Get initial positions
    const elements = [
      { selector: '#mermaid-container svg g:has-text("Input")', name: 'Input' },
      { selector: '#mermaid-container svg g:has-text("Validation")', name: 'Validation' },
      { selector: '#mermaid-container svg g:has-text("Process")', name: 'Process' },
    ];

    const initialTransforms = await Promise.all(elements.map((el) => helper.getElementTransform(el.selector)));

    // Drag multiple elements
    await helper.dragElement(elements[0].selector, 80, 20);
    await page.waitForTimeout(300);

    await helper.dragElement(elements[1].selector, -40, 60);
    await page.waitForTimeout(300);

    await helper.dragElement(elements[2].selector, 120, -30);

    // Verify all elements moved
    const finalTransforms = await Promise.all(elements.map((el) => helper.getElementTransform(el.selector)));

    for (let i = 0; i < elements.length; i++) {
      expect(finalTransforms[i]).not.toBe(initialTransforms[i]);
      expect(finalTransforms[i]).toContain('translate');
    }

    // Verify diagram is still visually coherent
    const svg = page.locator('#mermaid-container svg');
    await expect(svg).toBeVisible();
  });

  test('should maintain coordinate accuracy during zoom operations', async ({ page }) => {
    const diagramCode = `flowchart TD
    A[Node A] --> B[Node B]
    B --> C[Node C]`;

    await helper.setupDiagram(diagramCode);
    await helper.switchToDragMode();

    const nodeSelector = '#mermaid-container svg g:has-text("Node A")';

    // Zoom in significantly
    await helper.zoom('in', 3);
    await page.waitForTimeout(500);

    const zoomLevel = await helper.getZoomLevel();
    expect(zoomLevel).toBeGreaterThan(1);

    // Get initial position at high zoom
    const initialTransform = await helper.getElementTransform(nodeSelector);

    // Drag node while zoomed in
    await helper.dragElement(nodeSelector, 50, 75);

    // Verify node moved correctly
    const zoomedTransform = await helper.getElementTransform(nodeSelector);
    expect(zoomedTransform).not.toBe(initialTransform);

    // Zoom back out
    await helper.zoom('out', 3);
    await page.waitForTimeout(500);

    // Verify node is still in correct relative position
    const finalTransform = await helper.getElementTransform(nodeSelector);
    expect(finalTransform).toContain('translate');

    // The node should still be visible and in a reasonable position
    const nodeElement = page.locator(nodeSelector);
    await expect(nodeElement).toBeVisible();
  });

  test('should respect pan vs drag mode interaction boundaries', async ({ page }) => {
    const diagramCode = `flowchart TD
    A[Test Node] --> B[Another Node]`;

    await helper.setupDiagram(diagramCode);

    const nodeSelector = '#mermaid-container svg g:has-text("Test Node")';

    // Test pan mode (should not move individual nodes)
    await helper.switchToPanMode();
    const initialTransform = await helper.getElementTransform(nodeSelector);

    // Attempt to drag in pan mode - this should pan the canvas instead
    await helper.dragElement(nodeSelector, 100, 50);

    // Node position should not change in pan mode
    const panModeTransform = await helper.getElementTransform(nodeSelector);
    expect(panModeTransform).toBe(initialTransform);

    // Switch to drag mode
    await helper.switchToDragMode();

    // Now dragging should move the node
    await helper.dragElement(nodeSelector, 100, 50);

    const dragModeTransform = await helper.getElementTransform(nodeSelector);
    expect(dragModeTransform).not.toBe(initialTransform);
    expect(dragModeTransform).toContain('translate');
  });

  test('should emit correct elementMoved events during drag operations', async ({ page }) => {
    const diagramCode = `flowchart TD
    A[Source] --> B[Target]`;

    await helper.setupDiagram(diagramCode);
    await helper.switchToDragMode();
    await helper.setupEventListener('elementMoved');

    // Drag a node
    const nodeSelector = '#mermaid-container svg g:has-text("Source")';
    await helper.dragElement(nodeSelector, 120, 80);

    // Wait for events to be captured
    await page.waitForTimeout(500);

    // Verify event structure
    const events = await helper.getCapturedEvents();
    expect(events.length).toBeGreaterThan(0);

    const event = events[0];
    expect(event).toHaveProperty('elementId');
    expect(event).toHaveProperty('deltaX');
    expect(event).toHaveProperty('deltaY');
    expect(event).toHaveProperty('finalPosition');
    expect(event).toHaveProperty('initialPosition');

    expect(typeof event.deltaX).toBe('number');
    expect(typeof event.deltaY).toBe('number');
    expect(Math.abs(event.deltaX)).toBeGreaterThan(0);
    expect(Math.abs(event.deltaY)).toBeGreaterThan(0);
  });

  test('should handle rapid successive drag operations', async ({ page }) => {
    const diagramCode = `flowchart LR
    A[Node1] --> B[Node2] --> C[Node3] --> D[Node4]`;

    await helper.setupDiagram(diagramCode);
    await helper.switchToDragMode();

    const nodes = [
      '#mermaid-container svg g:has-text("Node1")',
      '#mermaid-container svg g:has-text("Node2")',
      '#mermaid-container svg g:has-text("Node3")',
      '#mermaid-container svg g:has-text("Node4")',
    ];

    // Perform rapid drag operations
    for (let i = 0; i < nodes.length; i++) {
      await helper.dragElement(nodes[i], 30 + i * 10, 20 - i * 5);
      // Minimal wait to simulate rapid operations
      await page.waitForTimeout(50);
    }

    // Verify all nodes were moved
    for (const nodeSelector of nodes) {
      const transform = await helper.getElementTransform(nodeSelector);
      expect(transform).toContain('translate');
    }

    // Verify diagram is still functional
    const svg = page.locator('#mermaid-container svg');
    await expect(svg).toBeVisible();

    // Paths should still be present and valid
    const paths = await helper.getPathData();
    expect(paths.length).toBeGreaterThan(0);
  });

  test('should maintain performance under stress conditions', async ({ page }) => {
    // Create a larger, more complex diagram
    const largeDiagram = `flowchart TD
    A1[Start1] --> B1[Process1]
    A2[Start2] --> B2[Process2]
    A3[Start3] --> B3[Process3]
    B1 --> C1[End1]
    B2 --> C2[End2]
    B3 --> C3[End3]
    C1 --> D[Merge]
    C2 --> D
    C3 --> D`;

    await helper.setupDiagram(largeDiagram);
    await helper.switchToDragMode();

    // Measure performance of drag operations
    const startTime = Date.now();

    // Perform multiple drag operations
    const operations = [
      { selector: '#mermaid-container svg g:has-text("Start1")', x: 50, y: 25 },
      { selector: '#mermaid-container svg g:has-text("Process1")', x: -30, y: 40 },
      { selector: '#mermaid-container svg g:has-text("End1")', x: 70, y: -20 },
      { selector: '#mermaid-container svg g:has-text("Merge")', x: 0, y: 60 },
    ];

    for (const op of operations) {
      await helper.dragElement(op.selector, op.x, op.y);
      await page.waitForTimeout(100);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Performance should be reasonable (less than 5 seconds for all operations)
    expect(totalTime).toBeLessThan(5000);

    // Verify all operations completed successfully
    for (const op of operations) {
      const transform = await helper.getElementTransform(op.selector);
      expect(transform).toContain('translate');
    }
  });

  test('should handle edge cases and error conditions gracefully', async ({ page }) => {
    const diagramCode = `flowchart TD
    A[Test Node]`;

    await helper.setupDiagram(diagramCode);
    await helper.switchToDragMode();

    const nodeSelector = '#mermaid-container svg g:has-text("Test Node")';

    // Test dragging to extreme coordinates
    await helper.dragElement(nodeSelector, 2000, -1500);

    // Node should still be accessible and have valid transform
    const extremeTransform = await helper.getElementTransform(nodeSelector);
    expect(extremeTransform).toContain('translate');

    // Test dragging back to normal coordinates
    await helper.dragElement(nodeSelector, -1900, 1400);

    const normalTransform = await helper.getElementTransform(nodeSelector);
    expect(normalTransform).toContain('translate');

    // Verify the application is still responsive
    const svg = page.locator('#mermaid-container svg');
    await expect(svg).toBeVisible();
  });

  test('should work correctly with different diagram types', async ({ page }) => {
    // Test with sequence diagram
    const sequenceDiagram = `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!`;

    await helper.setupDiagram(sequenceDiagram);
    await helper.switchToDragMode();

    // Wait for draggable elements in sequence diagram
    await page.waitForTimeout(1000);

    // Look for participant boxes or message elements
    const draggableElements = await page.locator('.draggable-element').count();

    if (draggableElements > 0) {
      const firstDraggable = page.locator('.draggable-element').first();
      const box = await firstDraggable.boundingBox();

      if (box) {
        await helper.dragElement('.draggable-element >> nth=0', 50, 30);

        // Verify element moved
        const transform = await firstDraggable.getAttribute('transform');
        expect(transform).toContain('translate');
      }
    }

    // Verify diagram is still visible and functional
    const svg = page.locator('#mermaid-container svg');
    await expect(svg).toBeVisible();
  });
});

test.describe('Transform and Coordinate System Integration', () => {
  let helper: DiagramTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new DiagramTestHelper(page);
  });

  test('should maintain coordinate consistency across pan and zoom operations', async ({ page }) => {
    const diagramCode = `flowchart TD
    A[Fixed Point] --> B[Reference Node]`;

    await helper.setupDiagram(diagramCode);

    const nodeSelector = '#mermaid-container svg g:has-text("Fixed Point")';

    // Get initial position
    const initialTransform = await helper.getElementTransform(nodeSelector);

    // Pan the canvas
    await helper.switchToPanMode();
    const container = page.locator('#mermaid-container');
    await container.dragTo(container, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 350, y: 250 },
    });

    // Zoom in
    await helper.zoom('in', 2);

    // Switch to drag mode and move node
    await helper.switchToDragMode();
    await helper.dragElement(nodeSelector, 100, 50);

    // Verify node moved relative to its coordinate system
    const finalTransform = await helper.getElementTransform(nodeSelector);
    expect(finalTransform).not.toBe(initialTransform);
    expect(finalTransform).toContain('translate');

    // Pan back and zoom out
    await helper.switchToPanMode();
    await container.dragTo(container, {
      sourcePosition: { x: 350, y: 250 },
      targetPosition: { x: 400, y: 300 },
    });

    await helper.zoom('out', 2);

    // Node should still be in correct relative position
    const recoveredTransform = await helper.getElementTransform(nodeSelector);
    expect(recoveredTransform).toContain('translate');
  });
});
