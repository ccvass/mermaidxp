import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { CanvasState, PlacingElementInfo, InteractionMode } from '../../types/diagram.types';

export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;

const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
const round2 = (z: number) => Math.round(z * 100) / 100;

const initialState: CanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  placingElement: null,
  selectedNodes: [],
  isDragging: false,
  interactionMode: 'pan', // DEFAULT: pan mode (mouse icon)
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = round2(clampZoom(action.payload));
    },
    zoomIn: (state) => {
      state.zoom = round2(clampZoom(state.zoom + ZOOM_STEP));
    },
    zoomOut: (state) => {
      state.zoom = round2(clampZoom(state.zoom - ZOOM_STEP));
    },
    zoomToCursor: (state, action: PayloadAction<{ scaleFactor: number; cursorX: number; cursorY: number }>) => {
      const { scaleFactor, cursorX, cursorY } = action.payload;
      const oldZoom = state.zoom;
      const candidateZoom = oldZoom * scaleFactor;
      const newZoomRaw = clampZoom(candidateZoom);
      const newZoom = round2(newZoomRaw);
      if (newZoom === oldZoom) {
        return;
      }
      const ratio = newZoom / oldZoom;
      const oldPanX = state.pan.x;
      const oldPanY = state.pan.y;
      const newPanX = cursorX - (cursorX - oldPanX) * ratio;
      const newPanY = cursorY - (cursorY - oldPanY) * ratio;
      state.zoom = newZoom;
      state.pan.x = newPanX;
      state.pan.y = newPanY;
    },
    resetZoom: (state) => {
      state.zoom = DEFAULT_ZOOM;
      state.pan = { x: 0, y: 0 };
    },
    setPan: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.pan = action.payload;
    },
    updatePan: (state, action: PayloadAction<{ dx: number; dy: number }>) => {
      state.pan.x += action.payload.dx;
      state.pan.y += action.payload.dy;
    },
    setPlacingElement: (state, action: PayloadAction<PlacingElementInfo | null>) => {
      state.placingElement = action.payload;
    },
    clearPlacingElement: (state) => {
      state.placingElement = null;
    },
    setSelectedNodes: (state, action: PayloadAction<string[]>) => {
      state.selectedNodes = action.payload;
    },
    addSelectedNode: (state, action: PayloadAction<string>) => {
      if (!state.selectedNodes.includes(action.payload)) {
        state.selectedNodes.push(action.payload);
      }
    },
    removeSelectedNode: (state, action: PayloadAction<string>) => {
      state.selectedNodes = state.selectedNodes.filter((id) => id !== action.payload);
    },
    clearSelectedNodes: (state) => {
      state.selectedNodes = [];
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    setInteractionMode: (state, action: PayloadAction<InteractionMode>) => {
      state.interactionMode = action.payload;
    },
    toggleInteractionMode: (state) => {
      state.interactionMode = state.interactionMode === 'drag' ? 'pan' : 'drag';
    },
    // Complex action for fitting diagram to viewport
    fitToViewport: (
      state,
      action: PayloadAction<{
        diagramBounds: { x?: number; y?: number; width: number; height: number };
        viewportBounds: { width: number; height: number };
      }>
    ) => {
      const { diagramBounds, viewportBounds } = action.payload;

      // Calculate scale to fit diagram in viewport with padding
      const padding = 0.9; // 90% of viewport
      const scaleX = (viewportBounds.width * padding) / diagramBounds.width;
      const scaleY = (viewportBounds.height * padding) / diagramBounds.height;
      const newZoom = clampZoom(Math.min(scaleX, scaleY));

      // Get diagram offset (defaults to 0 if not provided)
      const offsetX = diagramBounds.x || 0;
      const offsetY = diagramBounds.y || 0;

      // Center the diagram accounting for its actual position
      const scaledWidth = diagramBounds.width * newZoom;
      const scaledHeight = diagramBounds.height * newZoom;
      const scaledOffsetX = offsetX * newZoom;
      const scaledOffsetY = offsetY * newZoom;

      const panX = (viewportBounds.width - scaledWidth) / 2 - scaledOffsetX;
      const panY = (viewportBounds.height - scaledHeight) / 2 - scaledOffsetY;

      state.zoom = round2(newZoom);
      state.pan = { x: panX, y: panY };
    },
  },
});

export const {
  setZoom,
  zoomIn,
  zoomOut,
  zoomToCursor,
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
  fitToViewport,
} = canvasSlice.actions;

// Selectors
export const selectCanvas = (state: { canvas: CanvasState }) => state.canvas;
export const selectZoom = (state: { canvas: CanvasState }) => state.canvas.zoom;
export const selectPan = (state: { canvas: CanvasState }) => state.canvas.pan;
export const selectPlacingElement = (state: { canvas: CanvasState }) => state.canvas.placingElement;
export const selectSelectedNodes = (state: { canvas: CanvasState }) => state.canvas.selectedNodes;
export const selectIsDragging = (state: { canvas: CanvasState }) => state.canvas.isDragging;
export const selectInteractionMode = (state: { canvas: CanvasState }) => state.canvas.interactionMode;

export const selectCanZoomIn = createSelector(selectZoom, (z) => z < MAX_ZOOM);
export const selectCanZoomOut = createSelector(selectZoom, (z) => z > MIN_ZOOM);
export const selectIsDefaultZoom = createSelector(selectZoom, (z) => z === DEFAULT_ZOOM);

export default canvasSlice.reducer;
