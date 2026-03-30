import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Types for canvas elements that need to be tracked in history
export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'icon' | 'svg-shape' | 'enhanced-shape';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  content?: string; // For text and icons
  imageUrl?: string; // For images
  shapeData?: any; // For shapes
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    opacity?: number;
    borderRadius?: number;
    padding?: number;
  };
  metadata?: {
    createdAt: number;
    lastModified: number;
    version: number;
  };
}

export interface CanvasElementsState {
  elements: Record<string, CanvasElement>;
  selectedElementIds: string[];
  clipboard: CanvasElement[];
  nextId: number;
}

const initialState: CanvasElementsState = {
  elements: {},
  selectedElementIds: [],
  clipboard: [],
  nextId: 1,
};

const canvasElementsSlice = createSlice({
  name: 'canvasElements',
  initialState,
  reducers: {
    // Element CRUD operations
    addElement: (state, action: PayloadAction<Omit<CanvasElement, 'id' | 'metadata'>>) => {
      const id = `element_${state.nextId++}`;
      const element: CanvasElement = {
        ...action.payload,
        id,
        metadata: {
          createdAt: Date.now(),
          lastModified: Date.now(),
          version: 1,
        },
      };
      state.elements[id] = element;
    },

    updateElement: (state, action: PayloadAction<{ id: string; updates: Partial<CanvasElement> }>) => {
      const { id, updates } = action.payload;
      if (state.elements[id]) {
        state.elements[id] = {
          ...state.elements[id],
          ...updates,
          metadata: {
            ...state.elements[id].metadata!,
            lastModified: Date.now(),
            version: state.elements[id].metadata!.version + 1,
          },
        };
      }
    },

    deleteElement: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.elements[id];
      state.selectedElementIds = state.selectedElementIds.filter((selectedId) => selectedId !== id);
    },

    deleteElements: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((id) => {
        delete state.elements[id];
      });
      state.selectedElementIds = state.selectedElementIds.filter((selectedId) => !action.payload.includes(selectedId));
    },

    // Position and size operations
    moveElement: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const { id, position } = action.payload;
      if (state.elements[id]) {
        state.elements[id].position = position;
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    moveElements: (state, action: PayloadAction<{ ids: string[]; delta: { dx: number; dy: number } }>) => {
      const { ids, delta } = action.payload;
      ids.forEach((id) => {
        if (state.elements[id]) {
          state.elements[id].position.x += delta.dx;
          state.elements[id].position.y += delta.dy;
          state.elements[id].metadata!.lastModified = Date.now();
          state.elements[id].metadata!.version++;
        }
      });
    },

    resizeElement: (state, action: PayloadAction<{ id: string; size: { width: number; height: number } }>) => {
      const { id, size } = action.payload;
      if (state.elements[id]) {
        state.elements[id].size = size;
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    rotateElement: (state, action: PayloadAction<{ id: string; rotation: number }>) => {
      const { id, rotation } = action.payload;
      if (state.elements[id]) {
        state.elements[id].rotation = rotation;
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    // Selection operations
    selectElement: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.selectedElementIds.includes(id)) {
        state.selectedElementIds.push(id);
      }
    },

    selectElements: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = [...new Set(action.payload)];
    },

    deselectElement: (state, action: PayloadAction<string>) => {
      state.selectedElementIds = state.selectedElementIds.filter((id) => id !== action.payload);
    },

    clearSelection: (state) => {
      state.selectedElementIds = [];
    },

    toggleElementSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedElementIds.includes(id)) {
        state.selectedElementIds = state.selectedElementIds.filter((selectedId) => selectedId !== id);
      } else {
        state.selectedElementIds.push(id);
      }
    },

    // Clipboard operations
    copyElements: (state, action: PayloadAction<string[]>) => {
      const elementsToCopy = action.payload.map((id) => state.elements[id]).filter(Boolean);
      state.clipboard = elementsToCopy.map((element) => ({
        ...element,
        id: '', // Will be regenerated on paste
      }));
    },

    pasteElements: (state, action: PayloadAction<{ offset?: { x: number; y: number } }>) => {
      const { offset = { x: 20, y: 20 } } = action.payload;
      const newElementIds: string[] = [];

      state.clipboard.forEach((clipboardElement) => {
        const id = `element_${state.nextId++}`;
        const element: CanvasElement = {
          ...clipboardElement,
          id,
          position: {
            x: clipboardElement.position.x + offset.x,
            y: clipboardElement.position.y + offset.y,
          },
          metadata: {
            createdAt: Date.now(),
            lastModified: Date.now(),
            version: 1,
          },
        };
        state.elements[id] = element;
        newElementIds.push(id);
      });

      // Select the newly pasted elements
      state.selectedElementIds = newElementIds;
    },

    // Style operations
    updateElementStyle: (state, action: PayloadAction<{ id: string; style: Partial<CanvasElement['style']> }>) => {
      const { id, style } = action.payload;
      if (state.elements[id]) {
        state.elements[id].style = {
          ...state.elements[id].style,
          ...style,
        };
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    updateElementsStyle: (state, action: PayloadAction<{ ids: string[]; style: Partial<CanvasElement['style']> }>) => {
      const { ids, style } = action.payload;
      ids.forEach((id) => {
        if (state.elements[id]) {
          state.elements[id].style = {
            ...state.elements[id].style,
            ...style,
          };
          state.elements[id].metadata!.lastModified = Date.now();
          state.elements[id].metadata!.version++;
        }
      });
    },

    // Content operations
    updateElementContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      if (state.elements[id]) {
        state.elements[id].content = content;
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    // Bulk operations for history restoration
    setAllElements: (state, action: PayloadAction<Record<string, CanvasElement>>) => {
      state.elements = action.payload;
    },

    setSelectedElements: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },

    // Layer operations (z-index)
    bringToFront: (state, action: PayloadAction<string>) => {
      // Implementation would depend on how z-index is handled
      // For now, we'll just update the timestamp to indicate change
      const id = action.payload;
      if (state.elements[id]) {
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    sendToBack: (state, action: PayloadAction<string>) => {
      // Implementation would depend on how z-index is handled
      const id = action.payload;
      if (state.elements[id]) {
        state.elements[id].metadata!.lastModified = Date.now();
        state.elements[id].metadata!.version++;
      }
    },

    // Group operations
    groupElements: () => {
      // Implementation for grouping elements
      // This would create a group element and update the grouped elements
    },

    ungroupElements: () => {
      // Implementation for ungrouping elements
    },
  },
});

export const {
  addElement,
  updateElement,
  deleteElement,
  deleteElements,
  moveElement,
  moveElements,
  resizeElement,
  rotateElement,
  selectElement,
  selectElements,
  deselectElement,
  clearSelection,
  toggleElementSelection,
  copyElements,
  pasteElements,
  updateElementStyle,
  updateElementsStyle,
  updateElementContent,
  setAllElements,
  setSelectedElements,
  bringToFront,
  sendToBack,
  groupElements,
  ungroupElements,
} = canvasElementsSlice.actions;

export default canvasElementsSlice.reducer;

// Selectors
export const selectAllElements = (state: { canvasElements: CanvasElementsState }) => state.canvasElements.elements;
export const selectSelectedElementIds = (state: { canvasElements: CanvasElementsState }) =>
  state.canvasElements.selectedElementIds;

export const selectSelectedElements = createSelector(
  [selectAllElements, selectSelectedElementIds],
  (elements, selectedIds) => selectedIds.map((id) => elements[id]).filter(Boolean)
);
export const selectElementById = (id: string) => (state: { canvasElements: CanvasElementsState }) =>
  state.canvasElements.elements[id];
export const selectClipboard = (state: { canvasElements: CanvasElementsState }) => state.canvasElements.clipboard;
