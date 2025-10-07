/**
 * Comprehensive Undo/Redo System Tests
 *
 * This test suite covers ALL undo/redo scenarios including:
 * - Code editing
 * - Canvas operations (zoom, pan, selection)
 * - Element operations (add, move, resize, rotate, delete)
 * - Style changes
 * - Multi-element operations
 * - Complex sequences
 */

import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from '@jest/globals';
import diagramReducer, { setMermaidCode } from '../store/slices/diagramSlice';
import canvasReducer, { setZoom, setPan, setSelectedNodes } from '../store/slices/canvasSlice';
import canvasElementsReducer, {
  addElement,
  moveElement,
  resizeElement,
  rotateElement,
  deleteElement,
  updateElementStyle,
} from '../store/slices/canvasElementsSlice';
import historyEngineReducer, { setFeatureEnabled, undo, redo, captureNow } from '../store/slices/historyEngineSlice';
import { historyEngineMiddleware } from '../store/middleware/historyEngineMiddleware';

// Helper to wait for async operations
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to wait for coalescence
const waitForCoalescence = () => wait(800); // TEXT_COALESCE_MS + buffer

describe('Undo/Redo System - Comprehensive Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create fresh store for each test
    store = configureStore({
      reducer: {
        diagram: diagramReducer,
        canvas: canvasReducer,
        canvasElements: canvasElementsReducer,
        historyEngine: historyEngineReducer,
      },
      middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(historyEngineMiddleware),
    });

    // Enable history engine
    store.dispatch(setFeatureEnabled(true));
  });

  describe('1. Code Editing', () => {
    it('should capture and restore code changes', async () => {
      const initialCode = store.getState().diagram.mermaidCode;

      // Change code
      store.dispatch(setMermaidCode('graph TD\n  A-->B'));
      await waitForCoalescence();

      // Verify snapshot was captured
      const state1 = store.getState().historyEngine;
      expect(state1.past.length).toBeGreaterThan(0);

      // Undo
      store.dispatch(undo());
      await wait(50);

      const state2 = store.getState();
      expect(state2.diagram.mermaidCode).toBe(initialCode);
      expect(state2.historyEngine.future.length).toBeGreaterThan(0);

      // Redo
      store.dispatch(redo());
      await wait(50);

      const state3 = store.getState();
      expect(state3.diagram.mermaidCode).toBe('graph TD\n  A-->B');
    });

    it('should coalesce multiple rapid changes', async () => {
      const initialPast = store.getState().historyEngine.past.length;

      // Rapid changes (simulating typing)
      store.dispatch(setMermaidCode('g'));
      store.dispatch(setMermaidCode('gr'));
      store.dispatch(setMermaidCode('gra'));
      store.dispatch(setMermaidCode('grap'));
      store.dispatch(setMermaidCode('graph'));

      await waitForCoalescence();

      // Should only create 1 snapshot after coalescence
      const finalPast = store.getState().historyEngine.past.length;
      expect(finalPast).toBe(initialPast + 1);
    });

    it('should handle multiple separate edits', async () => {
      // First edit
      store.dispatch(setMermaidCode('graph TD\n  A-->B'));
      await waitForCoalescence();

      const past1 = store.getState().historyEngine.past.length;

      // Second edit
      store.dispatch(setMermaidCode('graph TD\n  A-->B\n  B-->C'));
      await waitForCoalescence();

      const past2 = store.getState().historyEngine.past.length;
      expect(past2).toBe(past1 + 1);

      // Undo twice
      store.dispatch(undo());
      await wait(50);
      store.dispatch(undo());
      await wait(50);

      // Should be back to original
      const code = store.getState().diagram.mermaidCode;
      expect(code.length).toBeLessThan('graph TD\n  A-->B'.length);
    });
  });

  describe('2. Canvas Operations', () => {
    it('should capture and restore zoom', async () => {
      const initialZoom = store.getState().canvas.zoom;

      // Change zoom
      store.dispatch(setZoom(1.5));
      await wait(200); // Wait for CANVAS_COALESCE_MS

      const past1 = store.getState().historyEngine.past.length;
      expect(past1).toBeGreaterThan(0);

      // Undo
      store.dispatch(undo());
      await wait(50);

      expect(store.getState().canvas.zoom).toBe(initialZoom);

      // Redo
      store.dispatch(redo());
      await wait(50);

      expect(store.getState().canvas.zoom).toBe(1.5);
    });

    it('should capture and restore pan', async () => {
      const initialPan = store.getState().canvas.pan;

      // Change pan
      store.dispatch(setPan({ x: 100, y: 200 }));
      await wait(200);

      // Undo
      store.dispatch(undo());
      await wait(50);

      const restoredPan = store.getState().canvas.pan;
      expect(restoredPan.x).toBe(initialPan.x);
      expect(restoredPan.y).toBe(initialPan.y);
    });

    it('should capture and restore node selection', async () => {
      // Select nodes
      store.dispatch(setSelectedNodes(['node1', 'node2']));
      await wait(200);

      const past1 = store.getState().historyEngine.past.length;
      expect(past1).toBeGreaterThan(0);

      // Undo
      store.dispatch(undo());
      await wait(50);

      expect(store.getState().canvas.selectedNodes).toEqual([]);
    });

    it('should coalesce multiple zoom operations', async () => {
      const initialPast = store.getState().historyEngine.past.length;

      // Multiple rapid zooms
      store.dispatch(setZoom(1.1));
      store.dispatch(setZoom(1.2));
      store.dispatch(setZoom(1.3));
      store.dispatch(setZoom(1.4));

      await wait(200);

      // Should create only 1 snapshot
      const finalPast = store.getState().historyEngine.past.length;
      expect(finalPast).toBe(initialPast + 1);
    });
  });

  describe('3. Element Operations', () => {
    it('should capture and restore element addition', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      await wait(50);

      const elementsAfterAdd = Object.keys(store.getState().canvasElements.elements);
      expect(elementsAfterAdd.length).toBe(1);

      // Undo
      store.dispatch(undo());
      await wait(50);

      const elementsAfterUndo = Object.keys(store.getState().canvasElements.elements);
      expect(elementsAfterUndo.length).toBe(0);

      // Redo
      store.dispatch(redo());
      await wait(50);

      const elementsAfterRedo = Object.keys(store.getState().canvasElements.elements);
      expect(elementsAfterRedo.length).toBe(1);
    });

    it('should capture and restore element movement', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      await wait(50);

      const elementId = Object.keys(store.getState().canvasElements.elements)[0];
      const initialPosition = store.getState().canvasElements.elements[elementId].position;

      // Move element
      store.dispatch(
        moveElement({
          id: elementId,
          position: { x: 200, y: 200 },
        })
      );
      await wait(50);

      // Undo
      store.dispatch(undo());
      await wait(50);

      const restoredPosition = store.getState().canvasElements.elements[elementId].position;
      expect(restoredPosition.x).toBe(initialPosition.x);
      expect(restoredPosition.y).toBe(initialPosition.y);
    });

    it('should capture and restore element resize', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      await wait(50);

      const elementId = Object.keys(store.getState().canvasElements.elements)[0];

      // Resize
      store.dispatch(
        resizeElement({
          id: elementId,
          size: { width: 200, height: 100 },
        })
      );
      await wait(50);

      // Undo
      store.dispatch(undo());
      await wait(50);

      const restoredSize = store.getState().canvasElements.elements[elementId].size;
      expect(restoredSize.width).toBe(100);
      expect(restoredSize.height).toBe(50);
    });

    it('should capture and restore element rotation', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      await wait(50);

      const elementId = Object.keys(store.getState().canvasElements.elements)[0];

      // Rotate
      store.dispatch(
        rotateElement({
          id: elementId,
          rotation: 45,
        })
      );
      await wait(50);

      expect(store.getState().canvasElements.elements[elementId].rotation).toBe(45);

      // Undo
      store.dispatch(undo());
      await wait(50);

      expect(store.getState().canvasElements.elements[elementId].rotation).toBeUndefined();
    });

    it('should capture and restore element deletion', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      await wait(50);

      const elementId = Object.keys(store.getState().canvasElements.elements)[0];

      // Delete
      store.dispatch(deleteElement(elementId));
      await wait(50);

      expect(Object.keys(store.getState().canvasElements.elements).length).toBe(0);

      // Undo
      store.dispatch(undo());
      await wait(50);

      expect(Object.keys(store.getState().canvasElements.elements).length).toBe(1);
      expect(store.getState().canvasElements.elements[elementId]).toBeDefined();
    });

    it('should capture and restore style changes', async () => {
      // Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
          style: { color: '#000000' },
        })
      );
      await wait(50);

      const elementId = Object.keys(store.getState().canvasElements.elements)[0];

      // Change style
      store.dispatch(
        updateElementStyle({
          id: elementId,
          style: { color: '#FF0000' },
        })
      );
      await wait(50);

      expect(store.getState().canvasElements.elements[elementId].style?.color).toBe('#FF0000');

      // Undo
      store.dispatch(undo());
      await wait(50);

      expect(store.getState().canvasElements.elements[elementId].style?.color).toBe('#000000');
    });
  });

  describe('4. Complex Sequences', () => {
    it('should handle mixed operations in sequence', async () => {
      const operations = [];

      // 1. Change code
      store.dispatch(setMermaidCode('graph TD\n  A-->B'));
      operations.push('code');
      await waitForCoalescence();

      // 2. Add element
      store.dispatch(
        addElement({
          type: 'text',
          content: 'Test',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 50 },
        })
      );
      operations.push('add');
      await wait(50);

      // 3. Change zoom
      store.dispatch(setZoom(1.5));
      operations.push('zoom');
      await wait(200);

      // 4. Move element
      const elementId = Object.keys(store.getState().canvasElements.elements)[0];
      store.dispatch(
        moveElement({
          id: elementId,
          position: { x: 200, y: 200 },
        })
      );
      operations.push('move');
      await wait(50);

      // Verify all operations were captured
      const past = store.getState().historyEngine.past;
      expect(past.length).toBeGreaterThanOrEqual(operations.length);

      // Undo all
      for (let i = 0; i < operations.length; i++) {
        store.dispatch(undo());
        await wait(50);
      }

      // Verify we're back to initial state
      expect(store.getState().historyEngine.future.length).toBeGreaterThanOrEqual(operations.length);

      // Redo all
      for (let i = 0; i < operations.length; i++) {
        store.dispatch(redo());
        await wait(50);
      }

      // Verify final state
      expect(store.getState().diagram.mermaidCode).toContain('A-->B');
      expect(store.getState().canvas.zoom).toBe(1.5);
      expect(Object.keys(store.getState().canvasElements.elements).length).toBe(1);
    });

    it('should handle rapid undo/redo', async () => {
      // Create some history
      for (let i = 0; i < 5; i++) {
        store.dispatch(
          addElement({
            type: 'text',
            content: `Element ${i}`,
            position: { x: i * 100, y: i * 100 },
            size: { width: 100, height: 50 },
          })
        );
        await wait(50);
      }

      const maxElements = Object.keys(store.getState().canvasElements.elements).length;

      // Rapid undo
      store.dispatch(undo());
      store.dispatch(undo());
      store.dispatch(undo());
      await wait(100);

      const afterUndo = Object.keys(store.getState().canvasElements.elements).length;
      expect(afterUndo).toBeLessThan(maxElements);

      // Rapid redo
      store.dispatch(redo());
      store.dispatch(redo());
      await wait(100);

      const afterRedo = Object.keys(store.getState().canvasElements.elements).length;
      expect(afterRedo).toBeGreaterThan(afterUndo);
    });

    it('should maintain correct state after branch', async () => {
      // Create history
      store.dispatch(setMermaidCode('Version 1'));
      await waitForCoalescence();

      store.dispatch(setMermaidCode('Version 2'));
      await waitForCoalescence();

      store.dispatch(setMermaidCode('Version 3'));
      await waitForCoalescence();

      // Undo twice
      store.dispatch(undo());
      await wait(50);
      store.dispatch(undo());
      await wait(50);

      // Make new change (create branch)
      store.dispatch(setMermaidCode('Version 2 Alt'));
      await waitForCoalescence();

      // Future should be cleared
      expect(store.getState().historyEngine.future.length).toBe(0);

      // Can't redo to Version 3
      store.dispatch(redo());
      await wait(50);

      expect(store.getState().diagram.mermaidCode).toBe('Version 2 Alt');
    });
  });

  describe('5. Edge Cases', () => {
    it('should handle undo at start of history', () => {
      const initialPast = store.getState().historyEngine.past.length;

      // Try to undo when there's nothing to undo
      store.dispatch(undo());

      expect(store.getState().historyEngine.past.length).toBe(initialPast);
    });

    it('should handle redo at end of future', async () => {
      // Create and undo one change
      store.dispatch(setMermaidCode('Test'));
      await waitForCoalescence();

      store.dispatch(undo());
      await wait(50);

      store.dispatch(redo());
      await wait(50);

      const future = store.getState().historyEngine.future.length;

      // Try to redo when there's nothing to redo
      store.dispatch(redo());

      expect(store.getState().historyEngine.future.length).toBe(future);
    });

    it('should handle explicit captureNow', async () => {
      const initialPast = store.getState().historyEngine.past.length;

      // Make change but don't wait for coalescence
      store.dispatch(setMermaidCode('Immediate'));

      // Force capture
      store.dispatch(captureNow({ actionType: 'manual' }));
      await wait(50);

      expect(store.getState().historyEngine.past.length).toBeGreaterThan(initialPast);
    });

    it('should deduplicate identical snapshots', async () => {
      const code = 'Same code';
      const initialPast = store.getState().historyEngine.past.length;

      // Set same code multiple times
      store.dispatch(setMermaidCode(code));
      await waitForCoalescence();

      const past1 = store.getState().historyEngine.past.length;

      store.dispatch(setMermaidCode(code));
      await waitForCoalescence();

      const past2 = store.getState().historyEngine.past.length;

      // Should not create additional snapshots for identical content
      expect(past2).toBe(past1);
    });
  });

  describe('6. Performance & Limits', () => {
    it('should respect maxSize limit', async () => {
      // Create many changes
      for (let i = 0; i < 150; i++) {
        store.dispatch(
          addElement({
            type: 'text',
            content: `Element ${i}`,
            position: { x: i, y: i },
            size: { width: 100, height: 50 },
          })
        );
        await wait(20);
      }

      // Past should not exceed maxSize (100)
      const past = store.getState().historyEngine.past;
      expect(past.length).toBeLessThanOrEqual(100);
    });

    it('should handle large snapshots', async () => {
      // Add many elements
      for (let i = 0; i < 50; i++) {
        store.dispatch(
          addElement({
            type: 'text',
            content: `Element with lots of content that makes it larger ${i}`,
            position: { x: i * 10, y: i * 10 },
            size: { width: 100, height: 50 },
          })
        );
      }
      await wait(100);

      // Should still be able to undo/redo
      store.dispatch(undo());
      await wait(50);

      const afterUndo = Object.keys(store.getState().canvasElements.elements).length;
      expect(afterUndo).toBeLessThan(50);

      store.dispatch(redo());
      await wait(50);

      const afterRedo = Object.keys(store.getState().canvasElements.elements).length;
      expect(afterRedo).toBeGreaterThan(afterUndo);
    });
  });
});
