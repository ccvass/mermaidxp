import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiagramDisplay } from './DiagramDisplay';
import canvasSlice, { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM } from '../../store/slices/canvasSlice';
import type { CanvasState } from '../../types/diagram.types';
import diagramSlice from '../../store/slices/diagramSlice';
import uiSlice from '../../store/slices/uiSlice';

// Mock dependencies
jest.mock('../../state/hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    activeDragInfo: null,
    handleMouseDown: jest.fn(),
    handleMouseMove: jest.fn(),
    handleMouseUpOrLeave: jest.fn(),
    markDraggableElements: jest.fn(),
  }),
}));

jest.mock('../../state/hooks/usePan', () => ({
  usePan: () => ({
    handlePanStart: jest.fn(),
    handlePanMove: jest.fn(),
    handlePanEnd: jest.fn(),
    updateCursor: jest.fn(),
    centerDiagram: jest.fn(),
    isPanning: false,
  }),
}));

jest.mock('../../features/canvas/utils/canvasTransform', () => ({
  applyCanvasTransform: jest.fn(),
}));

// Mock mermaid
Object.defineProperty(window, 'mermaid', {
  value: {
    initialize: jest.fn(),
    render: jest.fn(),
  },
  writable: true,
});

// Helper to create a store with initial state
const createTestStore = (initialCanvasState: Partial<CanvasState> = {}) => {
  const defaultCanvasState: CanvasState = {
    zoom: DEFAULT_ZOOM,
    pan: { x: 0, y: 0 },
    placingElement: null,
    selectedNodes: [],
    isDragging: false,
    interactionMode: 'drag',
  };
  return configureStore({
    reducer: {
      canvas: canvasSlice,
      diagram: diagramSlice,
      ui: uiSlice,
    },
    preloadedState: {
      canvas: { ...defaultCanvasState, ...initialCanvasState } as CanvasState,
      diagram: {
        mermaidCode: 'graph TD\n  A --> B',
        renderResult: {
          svg: '<svg width="100" height="100"><circle cx="50" cy="50" r="25"/></svg>',
        },
        isLoading: false,
        error: null,
        history: ['graph TD\n  A --> B'],
        historyIndex: 0,
      },
    },
  });
};

// Helper to render DiagramDisplay with store
const renderWithStore = (store = createTestStore()) => {
  return {
    ...render(
      <Provider store={store}>
        <DiagramDisplay />
      </Provider>
    ),
    store,
  };
};

describe('DiagramDisplay Wheel Gesture Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getBoundingClientRect for container positioning
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }));
  });

  describe('Wheel Event Handler', () => {
    it('should apply zoom-to-cursor when wheel scrolling', async () => {
      const store = createTestStore();
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');
      expect(container).toBeTruthy();

      // Get initial state
      const initialState = store.getState().canvas;
      expect(initialState.zoom).toBe(DEFAULT_ZOOM);
      expect(initialState.pan).toEqual({ x: 0, y: 0 });

      // Simulate wheel event at cursor position (400, 300) - center of 800x600 container
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Zoom in
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEvent);

      // Wait for state update
      await waitFor(() => {
        const newState = store.getState().canvas;
        expect(newState.zoom).toBeGreaterThan(DEFAULT_ZOOM);
      });

      const finalState = store.getState().canvas;

      // Verify zoom increased (1.0 * 1.1 = 1.1, rounded to 1.1)
      expect(finalState.zoom).toBe(1.1);

      // Verify zoom-to-cursor calculation was applied
      // With cursor at center (400, 300), old pan (0, 0), old scale 1.0, new scale 1.1:
      // newTransX = 400 - (400 - 0) * (1.1/1.0) = 400 - 440 = -40
      // newTransY = 300 - (300 - 0) * (1.1/1.0) = 300 - 330 = -30
      expect(finalState.pan.x).toBe(-40);
      expect(finalState.pan.y).toBe(-30);
    });

    it('should apply zoom-to-cursor when zooming out', async () => {
      const store = createTestStore({ zoom: 2.0, pan: { x: 100, y: 50 } });
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Simulate wheel event for zoom out at position (200, 150)
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // Zoom out
        clientX: 200,
        clientY: 150,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEvent);

      await waitFor(() => {
        const newState = store.getState().canvas;
        expect(newState.zoom).toBeLessThan(2.0);
      });

      const finalState = store.getState().canvas;

      // Verify zoom decreased (2.0 * 0.9 = 1.8)
      expect(finalState.zoom).toBe(1.8);

      // Verify zoom-to-cursor calculation
      // cursor (200, 150), oldPan (100, 50), oldScale 2.0, newScale 1.8
      // newTransX = 200 - (200 - 100) * (1.8/2.0) = 200 - 90 = 110
      // newTransY = 150 - (150 - 50) * (1.8/2.0) = 150 - 90 = 60
      expect(finalState.pan.x).toBe(110);
      expect(finalState.pan.y).toBe(60);
    });

    it('should constrain zoom within MIN_ZOOM and MAX_ZOOM bounds', async () => {
      const store = createTestStore({ zoom: MIN_ZOOM + 0.01 }); // Just above minimum
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Try to zoom out beyond minimum
      const wheelEventOut = new WheelEvent('wheel', {
        deltaY: 100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventOut);

      await waitFor(() => {
        const state = store.getState().canvas;
        expect(state.zoom).toBe(MIN_ZOOM);
      });

      // Test max zoom constraint
      store.dispatch({ type: 'canvas/setZoom', payload: MAX_ZOOM - 0.01 });

      const wheelEventIn = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventIn);

      await waitFor(() => {
        const state = store.getState().canvas;
        expect(state.zoom).toBe(MAX_ZOOM);
      });
    });

    it('should round zoom values to 2 decimal places', async () => {
      const store = createTestStore({ zoom: 1.0 });
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Multiple zoom operations that could cause floating point drift
      for (let i = 0; i < 5; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -100,
          clientX: 400,
          clientY: 300,
          bubbles: true,
          cancelable: true,
        });

        fireEvent(container!, wheelEvent);

        await waitFor(() => {
          const state = store.getState().canvas;
          // Verify zoom is properly rounded to 2 decimal places
          const zoomStr = state.zoom.toString();
          const decimalIndex = zoomStr.indexOf('.');
          if (decimalIndex !== -1) {
            expect(zoomStr.substring(decimalIndex + 1).length).toBeLessThanOrEqual(2);
          }
        });
      }
    });

    it('should ignore wheel events with ctrl/meta key pressed', async () => {
      const store = createTestStore();
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');
      const initialState = store.getState().canvas;

      // Simulate wheel event with ctrlKey
      const wheelEventCtrl = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventCtrl);

      // Should not change zoom
      await new Promise((resolve) => setTimeout(resolve, 100));
      const stateAfterCtrl = store.getState().canvas;
      expect(stateAfterCtrl.zoom).toBe(initialState.zoom);
      expect(stateAfterCtrl.pan).toEqual(initialState.pan);

      // Simulate wheel event with metaKey
      const wheelEventMeta = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventMeta);

      // Should still not change zoom
      await new Promise((resolve) => setTimeout(resolve, 100));
      const stateAfterMeta = store.getState().canvas;
      expect(stateAfterMeta.zoom).toBe(initialState.zoom);
      expect(stateAfterMeta.pan).toEqual(initialState.pan);
    });

    it('should throttle wheel events', async () => {
      const store = createTestStore();
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Fire multiple wheel events rapidly
      const wheelEvent1 = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      const wheelEvent2 = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEvent1);
      fireEvent(container!, wheelEvent2); // Should be throttled

      await waitFor(() => {
        const state = store.getState().canvas;
        // Only first event should have been processed
        expect(state.zoom).toBe(1.1); // Only one zoom step
      });
    });

    it('should fallback to simple zoom when container rect is unavailable', async () => {
      // Mock getBoundingClientRect to return null
      Element.prototype.getBoundingClientRect = jest.fn(() => null as any);

      const store = createTestStore();
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEvent);

      await waitFor(() => {
        const state = store.getState().canvas;
        // Should still zoom, but without cursor-based positioning
        expect(state.zoom).toBeGreaterThan(DEFAULT_ZOOM);
      });
    });
  });

  describe('Zoom-to-Cursor Mathematical Accuracy', () => {
    it('should maintain point-under-cursor stability across zoom operations', async () => {
      const store = createTestStore({ zoom: 1.0, pan: { x: 0, y: 0 } });
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Define a specific cursor position
      const cursorX = 300;
      const cursorY = 200;

      // Calculate what point in world coordinates is under the cursor initially
      // worldX = (screenX - panX) / zoom = (300 - 0) / 1.0 = 300
      // worldY = (screenY - panY) / zoom = (200 - 0) / 1.0 = 200
      const initialWorldX = 300;
      const initialWorldY = 200;

      // Zoom in at this cursor position
      const wheelEventIn = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: cursorX,
        clientY: cursorY,
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventIn);

      await waitFor(() => {
        const state = store.getState().canvas;
        expect(state.zoom).toBe(1.1);
      });

      const stateAfterZoomIn = store.getState().canvas;

      // Verify that the same world point is still under the cursor
      const newWorldX = (cursorX - stateAfterZoomIn.pan.x) / stateAfterZoomIn.zoom;
      const newWorldY = (cursorY - stateAfterZoomIn.pan.y) / stateAfterZoomIn.zoom;

      // Should be very close to original world coordinates (within floating point precision)
      expect(Math.abs(newWorldX - initialWorldX)).toBeLessThan(0.001);
      expect(Math.abs(newWorldY - initialWorldY)).toBeLessThan(0.001);
    });

    it('should handle edge case cursor positions correctly', async () => {
      const store = createTestStore({ zoom: 1.5, pan: { x: -100, y: 50 } });
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Test cursor at edge of container
      const wheelEventEdge = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 0, // Left edge
        clientY: 600, // Bottom edge
        bubbles: true,
        cancelable: true,
      });

      fireEvent(container!, wheelEventEdge);

      await waitFor(() => {
        const state = store.getState().canvas;
        expect(state.zoom).toBeCloseTo(1.65, 2); // 1.5 * 1.1
      });

      const finalState = store.getState().canvas;

      // Verify zoom-to-cursor formula was applied correctly
      // newTransX = 0 - (0 - (-100)) * (1.65/1.5) = 0 - 100 * 1.1 = -110
      // newTransY = 600 - (600 - 50) * (1.65/1.5) = 600 - 550 * 1.1 = -5
      expect(finalState.pan.x).toBeCloseTo(-110, 1);
      expect(finalState.pan.y).toBeCloseTo(-5, 1);
    });
  });

  describe('Zoom Scale Rounding', () => {
    it('should prevent floating point drift through consistent rounding', async () => {
      const store = createTestStore({ zoom: 1.0 });
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Perform zoom in and out operations that would cause drift without rounding
      const operations = [
        { deltaY: -100 }, // zoom in: 1.0 * 1.1 = 1.1
        { deltaY: 100 }, // zoom out: 1.1 * 0.9 = 0.99
        { deltaY: -100 }, // zoom in: 0.99 * 1.1 = 1.089
        { deltaY: 100 }, // zoom out: 1.089 * 0.9 = 0.9801
      ];

      for (const op of operations) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: op.deltaY,
          clientX: 400,
          clientY: 300,
          bubbles: true,
          cancelable: true,
        });

        fireEvent(container!, wheelEvent);

        await waitFor(() => {
          const state = store.getState().canvas;
          // Verify zoom is properly rounded
          const zoomStr = state.zoom.toString();
          const decimalPlaces = zoomStr.includes('.') ? zoomStr.split('.')[1].length : 0;
          expect(decimalPlaces).toBeLessThanOrEqual(2);
        });

        // Small delay to ensure throttling doesn't interfere
        await new Promise((resolve) => setTimeout(resolve, 60));
      }

      const finalState = store.getState().canvas;

      // Expected values with rounding:
      // 1.0 -> 1.1 -> 0.99 -> 1.09 -> 0.98
      expect(finalState.zoom).toBe(0.98);
    });

    it('should maintain precision for common zoom levels', async () => {
      const store = createTestStore();
      renderWithStore(store);

      const container = document.querySelector('#mermaid-container');

      // Test that common zoom levels are represented exactly
      const testCases = [
        { operations: 1, expected: 1.1 }, // 1 zoom in
        { operations: 2, expected: 1.21 }, // 2 zoom ins: 1.1 * 1.1 = 1.21
        { operations: 10, expected: 2.59 }, // 10 zoom ins: 1.1^10 ≈ 2.59
      ];

      for (const testCase of testCases) {
        // Reset zoom
        store.dispatch({ type: 'canvas/setZoom', payload: 1.0 });

        // Perform zoom operations
        for (let i = 0; i < testCase.operations; i++) {
          const wheelEvent = new WheelEvent('wheel', {
            deltaY: -100,
            clientX: 400,
            clientY: 300,
            bubbles: true,
            cancelable: true,
          });

          fireEvent(container!, wheelEvent);

          // Wait for each operation to complete
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        const finalState = store.getState().canvas;
        expect(finalState.zoom).toBeCloseTo(testCase.expected, 2);
      }
    });
  });
});
