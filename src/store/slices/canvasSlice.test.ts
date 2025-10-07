import reducer, {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setPan,
  updatePan,
  setPlacingElement,
  clearPlacingElement,
  setSelectedNodes,
  addSelectedNode,
  removeSelectedNode,
  clearSelectedNodes,
  setIsDragging,
  setInteractionMode,
  toggleInteractionMode,
  zoomToCursor,
  fitToViewport,
  selectCanvas,
  selectZoom,
  selectPan,
  selectPlacingElement,
  selectSelectedNodes,
  selectIsDragging,
  selectInteractionMode,
  selectCanZoomIn,
  selectCanZoomOut,
  selectIsDefaultZoom,
  ZOOM_STEP,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM,
} from './canvasSlice';
import { CanvasState } from '../../types/diagram.types';

describe('canvasSlice', () => {
  const initialState: CanvasState = {
    zoom: DEFAULT_ZOOM,
    pan: { x: 0, y: 0 },
    placingElement: null,
    selectedNodes: [],
    isDragging: false,
    interactionMode: 'drag',
  };

  describe('zoom actions', () => {
    it('should handle setZoom', () => {
      const newZoom = 2.5;
      const state = reducer(initialState, setZoom(newZoom));
      expect(state.zoom).toBe(newZoom);
    });

    it('should clamp zoom to MIN_ZOOM when setting below minimum', () => {
      const state = reducer(initialState, setZoom(0.05));
      expect(state.zoom).toBe(MIN_ZOOM);
    });

    it('should clamp zoom to MAX_ZOOM when setting above maximum', () => {
      const state = reducer(initialState, setZoom(5));
      expect(state.zoom).toBe(MAX_ZOOM);
    });

    it('should handle zoomIn', () => {
      const state = reducer(initialState, zoomIn());
      expect(state.zoom).toBe(DEFAULT_ZOOM + ZOOM_STEP);
    });

    it('should not zoom in beyond MAX_ZOOM', () => {
      const almostMaxState = { ...initialState, zoom: MAX_ZOOM - 0.05 };
      const state = reducer(almostMaxState, zoomIn());
      expect(state.zoom).toBe(MAX_ZOOM);
    });

    it('should handle zoomOut', () => {
      const state = reducer(initialState, zoomOut());
      expect(state.zoom).toBe(DEFAULT_ZOOM - ZOOM_STEP);
    });

    it('should not zoom out beyond MIN_ZOOM', () => {
      const almostMinState = { ...initialState, zoom: MIN_ZOOM + 0.05 };
      const state = reducer(almostMinState, zoomOut());
      expect(state.zoom).toBe(MIN_ZOOM);
    });

    it('should handle resetZoom', () => {
      const modifiedState: CanvasState = {
        ...initialState,
        zoom: 2.5,
        pan: { x: 100, y: 200 },
      };
      const state = reducer(modifiedState, resetZoom());
      expect(state.zoom).toBe(DEFAULT_ZOOM);
      expect(state.pan).toEqual({ x: 0, y: 0 });
    });

    it('should round zoom values to 2 decimal places in setZoom', () => {
      const preciseZoom = 1.23456789;
      const state = reducer(initialState, setZoom(preciseZoom));
      expect(state.zoom).toBe(1.23);
    });

    it('should round zoom values to 2 decimal places in zoomIn', () => {
      const startState = { ...initialState, zoom: 1.234 };
      const state = reducer(startState, zoomIn());
      expect(state.zoom).toBe(1.33); // 1.234 + 0.1 = 1.334, rounded to 1.33
    });

    it('should round zoom values to 2 decimal places in zoomOut', () => {
      const startState = { ...initialState, zoom: 1.567 };
      const state = reducer(startState, zoomOut());
      expect(state.zoom).toBe(1.47); // 1.567 - 0.1 = 1.467, rounded to 1.47
    });
  });

  describe('pan actions', () => {
    it('should handle setPan', () => {
      const newPan = { x: 50, y: 100 };
      const state = reducer(initialState, setPan(newPan));
      expect(state.pan).toEqual(newPan);
    });

    it('should handle updatePan', () => {
      const initialPan = { x: 10, y: 20 };
      const stateWithPan = { ...initialState, pan: initialPan };
      const delta = { dx: 5, dy: 10 };
      const state = reducer(stateWithPan, updatePan(delta));
      expect(state.pan).toEqual({ x: 15, y: 30 });
    });
  });

  describe('placing element actions', () => {
    it('should handle setPlacingElement', () => {
      const placingElement = { type: 'node', data: { id: 'test' } };
      const state = reducer(initialState, setPlacingElement(placingElement as any));
      expect(state.placingElement).toEqual(placingElement);
    });

    it('should handle clearPlacingElement', () => {
      const stateWithElement = {
        ...initialState,
        placingElement: { type: 'node', data: { id: 'test' } } as any,
      };
      const state = reducer(stateWithElement, clearPlacingElement());
      expect(state.placingElement).toBeNull();
    });
  });

  describe('selection actions', () => {
    it('should handle setSelectedNodes', () => {
      const nodes = ['node1', 'node2', 'node3'];
      const state = reducer(initialState, setSelectedNodes(nodes));
      expect(state.selectedNodes).toEqual(nodes);
    });

    it('should handle addSelectedNode', () => {
      const state = reducer(initialState, addSelectedNode('node1'));
      expect(state.selectedNodes).toContain('node1');
    });

    it('should not add duplicate selected nodes', () => {
      const stateWithNode = { ...initialState, selectedNodes: ['node1'] };
      const state = reducer(stateWithNode, addSelectedNode('node1'));
      expect(state.selectedNodes).toHaveLength(1);
    });

    it('should handle removeSelectedNode', () => {
      const stateWithNodes = { ...initialState, selectedNodes: ['node1', 'node2'] };
      const state = reducer(stateWithNodes, removeSelectedNode('node1'));
      expect(state.selectedNodes).toEqual(['node2']);
    });

    it('should handle clearSelectedNodes', () => {
      const stateWithNodes = { ...initialState, selectedNodes: ['node1', 'node2'] };
      const state = reducer(stateWithNodes, clearSelectedNodes());
      expect(state.selectedNodes).toEqual([]);
    });
  });

  describe('interaction actions', () => {
    it('should handle setIsDragging', () => {
      const state = reducer(initialState, setIsDragging(true));
      expect(state.isDragging).toBe(true);
    });

    it('should handle setInteractionMode', () => {
      const state = reducer(initialState, setInteractionMode('pan'));
      expect(state.interactionMode).toBe('pan');
    });

    it('should handle toggleInteractionMode', () => {
      let state = reducer(initialState, toggleInteractionMode());
      expect(state.interactionMode).toBe('pan');

      state = reducer(state, toggleInteractionMode());
      expect(state.interactionMode).toBe('drag');
    });
  });

  describe('zoomToCursor action', () => {
    it('should apply zoom-to-cursor transformation correctly', () => {
      const startState = {
        ...initialState,
        zoom: 1.0,
        pan: { x: 0, y: 0 },
      };

      // Zoom in at cursor position (400, 300) with scale factor 1.1
      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor: 1.1,
          cursorX: 400,
          cursorY: 300,
        })
      );

      // newTrans = cursor - (cursor - oldTrans) * newScale/oldScale
      // newTransX = 400 - (400 - 0) * (1.1/1.0) = 400 - 440 = -40
      // newTransY = 300 - (300 - 0) * (1.1/1.0) = 300 - 330 = -30
      expect(state.zoom).toBe(1.1);
      expect(state.pan.x).toBeCloseTo(-40, 10);
      expect(state.pan.y).toBeCloseTo(-30, 10);
    });

    it('should handle zoom out correctly', () => {
      const startState = {
        ...initialState,
        zoom: 2.0,
        pan: { x: 100, y: 50 },
      };

      // Zoom out at cursor position (200, 150) with scale factor 0.9
      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor: 0.9,
          cursorX: 200,
          cursorY: 150,
        })
      );

      // newTrans = cursor - (cursor - oldTrans) * newScale/oldScale
      // newTransX = 200 - (200 - 100) * (1.8/2.0) = 200 - 90 = 110
      // newTransY = 150 - (150 - 50) * (1.8/2.0) = 150 - 90 = 60
      expect(state.zoom).toBe(1.8); // 2.0 * 0.9
      expect(state.pan.x).toBe(110);
      expect(state.pan.y).toBe(60);
    });

    it('should constrain zoom within bounds and round to 2 decimals', () => {
      // Test zoom beyond maximum
      const maxState = {
        ...initialState,
        zoom: MAX_ZOOM - 0.01,
        pan: { x: 0, y: 0 },
      };

      const stateAfterMax = reducer(
        maxState,
        zoomToCursor({
          scaleFactor: 1.5,
          cursorX: 400,
          cursorY: 300,
        })
      );

      expect(stateAfterMax.zoom).toBe(MAX_ZOOM);

      // Test zoom below minimum
      const minState = {
        ...initialState,
        zoom: MIN_ZOOM + 0.01,
        pan: { x: 0, y: 0 },
      };

      const stateAfterMin = reducer(
        minState,
        zoomToCursor({
          scaleFactor: 0.5,
          cursorX: 400,
          cursorY: 300,
        })
      );

      expect(stateAfterMin.zoom).toBe(MIN_ZOOM);
    });

    it('should round zoom to 2 decimal places', () => {
      const startState = {
        ...initialState,
        zoom: 1.23456,
        pan: { x: 0, y: 0 },
      };

      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor: 1.11111,
          cursorX: 0,
          cursorY: 0,
        })
      );

      // 1.23456 * 1.11111 = 1.3717... -> should be rounded to 1.37
      expect(state.zoom).toBe(1.37);
    });

    it('should handle edge case cursor positions', () => {
      const startState = {
        ...initialState,
        zoom: 1.0,
        pan: { x: -50, y: 25 },
      };

      // Cursor at origin (0, 0)
      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor: 2.0,
          cursorX: 0,
          cursorY: 0,
        })
      );

      // newTransX = 0 - (0 - (-50)) * (2.0/1.0) = 0 - 100 = -100
      // newTransY = 0 - (0 - 25) * (2.0/1.0) = 0 - (-50) = 50
      expect(state.zoom).toBe(2.0);
      expect(state.pan.x).toBe(-100);
      expect(state.pan.y).toBe(50);
    });

    it('should maintain mathematical precision for point-under-cursor invariant', () => {
      const startState = {
        ...initialState,
        zoom: 1.5,
        pan: { x: 100, y: -50 },
      };

      const cursorX = 300;
      const cursorY = 200;
      const scaleFactor = 1.2;

      // Calculate what world point is under cursor before zoom
      const worldXBefore = (cursorX - startState.pan.x) / startState.zoom;
      const worldYBefore = (cursorY - startState.pan.y) / startState.zoom;

      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor,
          cursorX,
          cursorY,
        })
      );

      // Calculate what world point is under cursor after zoom
      const worldXAfter = (cursorX - state.pan.x) / state.zoom;
      const worldYAfter = (cursorY - state.pan.y) / state.zoom;

      // Should be the same world point (within floating point precision)
      expect(Math.abs(worldXAfter - worldXBefore)).toBeLessThan(0.001);
      expect(Math.abs(worldYAfter - worldYBefore)).toBeLessThan(0.001);
    });

    it('should handle scale factor of 1 (no zoom change)', () => {
      const startState = {
        ...initialState,
        zoom: 1.5,
        pan: { x: 100, y: 200 },
      };

      const state = reducer(
        startState,
        zoomToCursor({
          scaleFactor: 1.0,
          cursorX: 400,
          cursorY: 300,
        })
      );

      // No change should occur
      expect(state.zoom).toBe(startState.zoom);
      expect(state.pan).toEqual(startState.pan);
    });
  });

  describe('fitToViewport action', () => {
    it('should fit diagram to viewport with correct zoom and centering', () => {
      const diagramBounds = { x: 0, y: 0, width: 1000, height: 800 };
      const viewportBounds = { width: 800, height: 600 };

      const state = reducer(initialState, fitToViewport({ diagramBounds, viewportBounds }));

      // Should scale to fit the height (limiting dimension)
      const expectedZoom = (600 * 0.9) / 800; // 0.675
      expect(state.zoom).toBeCloseTo(expectedZoom, 1);

      // Should center the diagram
      const scaledWidth = 1000 * expectedZoom;
      const scaledHeight = 800 * expectedZoom;
      const expectedPanX = (800 - scaledWidth) / 2;
      const expectedPanY = (600 - scaledHeight) / 2;

      expect(state.pan.x).toBeCloseTo(expectedPanX);
      expect(state.pan.y).toBeCloseTo(expectedPanY);
    });

    it('should respect MAX_ZOOM when fitting to viewport', () => {
      const diagramBounds = { x: 0, y: 0, width: 100, height: 80 };
      const viewportBounds = { width: 800, height: 600 };

      const state = reducer(initialState, fitToViewport({ diagramBounds, viewportBounds }));

      expect(state.zoom).toBe(MAX_ZOOM);
    });

    it('should respect MIN_ZOOM when fitting to viewport', () => {
      const diagramBounds = { x: 0, y: 0, width: 10000, height: 8000 };
      const viewportBounds = { width: 100, height: 80 };

      const state = reducer(initialState, fitToViewport({ diagramBounds, viewportBounds }));

      expect(state.zoom).toBeGreaterThanOrEqual(MIN_ZOOM);
    });

    it('should center diagram with non-zero origin', () => {
      const diagramBounds = { x: -500, y: -400, width: 1000, height: 800 };
      const viewportBounds = { width: 800, height: 600 };

      const state = reducer(initialState, fitToViewport({ diagramBounds, viewportBounds }));

      // Should scale to fit the height (limiting dimension)
      const expectedZoom = (600 * 0.9) / 800; // 0.675
      expect(state.zoom).toBeCloseTo(expectedZoom, 1);

      // Should center the diagram accounting for offset
      const scaledWidth = 1000 * expectedZoom;
      const scaledHeight = 800 * expectedZoom;
      const scaledOffsetX = -500 * expectedZoom;
      const scaledOffsetY = -400 * expectedZoom;
      const expectedPanX = (800 - scaledWidth) / 2 - scaledOffsetX;
      const expectedPanY = (600 - scaledHeight) / 2 - scaledOffsetY;

      expect(state.pan.x).toBeCloseTo(expectedPanX);
      expect(state.pan.y).toBeCloseTo(expectedPanY);
    });
  });

  describe('selectors', () => {
    const mockState = {
      canvas: {
        zoom: 2,
        pan: { x: 10, y: 20 },
        placingElement: null,
        selectedNodes: ['node1'],
        isDragging: true,
        interactionMode: 'pan' as const,
      },
    } as any;

    it('should select canvas state', () => {
      expect(selectCanvas(mockState)).toEqual(mockState.canvas);
    });

    it('should select zoom', () => {
      expect(selectZoom(mockState)).toBe(2);
    });

    it('should select pan', () => {
      expect(selectPan(mockState)).toEqual({ x: 10, y: 20 });
    });

    it('should select placing element', () => {
      expect(selectPlacingElement(mockState)).toBeNull();
    });

    it('should select selected nodes', () => {
      expect(selectSelectedNodes(mockState)).toEqual(['node1']);
    });

    it('should select is dragging', () => {
      expect(selectIsDragging(mockState)).toBe(true);
    });

    it('should select interaction mode', () => {
      expect(selectInteractionMode(mockState)).toBe('pan');
    });

    it('should select can zoom in', () => {
      expect(selectCanZoomIn(mockState)).toBe(true);

      const maxZoomState = { canvas: { ...mockState.canvas, zoom: MAX_ZOOM } };
      expect(selectCanZoomIn(maxZoomState)).toBe(false);
    });

    it('should select can zoom out', () => {
      expect(selectCanZoomOut(mockState)).toBe(true);

      const minZoomState = { canvas: { ...mockState.canvas, zoom: MIN_ZOOM } };
      expect(selectCanZoomOut(minZoomState)).toBe(false);
    });

    it('should select is default zoom', () => {
      expect(selectIsDefaultZoom(mockState)).toBe(false);

      const defaultZoomState = { canvas: { ...mockState.canvas, zoom: DEFAULT_ZOOM } };
      expect(selectIsDefaultZoom(defaultZoomState)).toBe(true);
    });
  });

  describe('zoom constants', () => {
    it('should have valid zoom constants', () => {
      expect(ZOOM_STEP).toBe(0.1);
      expect(MIN_ZOOM).toBe(0.1);
      expect(MAX_ZOOM).toBe(4);
      expect(DEFAULT_ZOOM).toBe(1);
      expect(MIN_ZOOM).toBeLessThan(DEFAULT_ZOOM);
      expect(DEFAULT_ZOOM).toBeLessThan(MAX_ZOOM);
    });
  });
});
