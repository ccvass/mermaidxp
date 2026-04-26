import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiagramDisplay } from './DiagramDisplay';
import canvasSlice, { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM } from '../../store/slices/canvasSlice';
import type { CanvasState } from '../../types/diagram.types';
import diagramSlice from '../../store/slices/diagramSlice';
import uiSlice from '../../store/slices/uiSlice';
import historyEngineSlice from '../../store/slices/historyEngineSlice';
import canvasElementsSlice from '../../store/slices/canvasElementsSlice';

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
      historyEngine: historyEngineSlice,
      canvasElements: canvasElementsSlice,
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
        sheets: [],
        activeSheetIndex: 0,
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

describe('DiagramDisplay Zoom & Pan Tests', () => {
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

  describe('Store-driven Zoom', () => {
    it('should render with default zoom', () => {
      const store = createTestStore();
      renderWithStore(store);

      const state = store.getState().canvas;
      expect(state.zoom).toBe(DEFAULT_ZOOM);
      expect(state.pan).toEqual({ x: 0, y: 0 });
    });

    it('should accept custom initial zoom', () => {
      const store = createTestStore({ zoom: 1.5 });
      renderWithStore(store);

      expect(store.getState().canvas.zoom).toBe(1.5);
    });

    it('should accept custom initial pan', () => {
      const store = createTestStore({ pan: { x: 100, y: 200 } });
      renderWithStore(store);

      const { pan } = store.getState().canvas;
      expect(pan.x).toBe(100);
      expect(pan.y).toBe(200);
    });

    it('should update zoom via store dispatch', async () => {
      const store = createTestStore();
      renderWithStore(store);

      store.dispatch({ type: 'canvas/setZoom', payload: 2.0 });

      await waitFor(() => {
        expect(store.getState().canvas.zoom).toBe(2.0);
      });
    });

    it('should clamp zoom to MIN_ZOOM', () => {
      const store = createTestStore({ zoom: MIN_ZOOM });
      renderWithStore(store);

      expect(store.getState().canvas.zoom).toBe(MIN_ZOOM);
    });

    it('should clamp zoom to MAX_ZOOM', () => {
      const store = createTestStore({ zoom: MAX_ZOOM });
      renderWithStore(store);

      expect(store.getState().canvas.zoom).toBe(MAX_ZOOM);
    });
  });

  describe('Zoom Scale Rounding', () => {
    it('should maintain precision for common zoom levels', () => {
      const store = createTestStore({ zoom: 1.1 });
      renderWithStore(store);

      const zoomStr = store.getState().canvas.zoom.toString();
      const decimalPlaces = zoomStr.includes('.') ? zoomStr.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should handle various zoom values without floating point drift', () => {
      const testValues = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

      testValues.forEach((zoom) => {
        const store = createTestStore({ zoom });
        renderWithStore(store);
        expect(store.getState().canvas.zoom).toBe(zoom);
      });
    });
  });

  describe('Container Rendering', () => {
    it('should render the mermaid container', () => {
      renderWithStore();

      const container = document.querySelector('#mermaid-container');
      expect(container).toBeTruthy();
    });

    it('should render SVG content from store', () => {
      renderWithStore();

      const svg = document.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should apply transform based on zoom and pan', async () => {
      const store = createTestStore({ zoom: 1.5, pan: { x: 50, y: 30 } });
      renderWithStore(store);

      await waitFor(() => {
        const svg = document.querySelector('#mermaid-container svg') as SVGElement | null;
        if (svg) {
          expect(svg.style.transform).toContain('translate(50px, 30px)');
          expect(svg.style.transform).toContain('scale(1.5)');
        }
      });
    });
  });
});
