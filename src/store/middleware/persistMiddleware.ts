import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define the structure of persisted state
// CRITICAL: interactionMode MUST be persisted to prevent zoom issues during drag/drop
// When interactionMode becomes undefined, it triggers the "zoom back check" useEffect
// in DiagramDisplay.tsx, causing unwanted zoom changes during drop operations.
export interface PersistedState {
  diagram: {
    mermaidCode: string;
  };
  ui: {
    theme: 'light' | 'dark';
  };
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
    interactionMode: 'pan' | 'drag'; // REQUIRED: Must persist to prevent zoom issues
  };
}

// Actions to watch for persistence
// CRITICAL: setInteractionMode and toggleInteractionMode MUST be included
// to prevent interactionMode from becoming undefined, which causes zoom issues
const PERSISTED_ACTIONS = [
  'diagram/setMermaidCode',
  'diagram/appendMermaidCode',
  'ui/toggleTheme',
  'canvas/setZoom',
  'canvas/zoomIn',
  'canvas/zoomOut',
  'canvas/resetZoom',
  'canvas/setPan',
  'canvas/updatePan',
  'canvas/fitToViewport',
  'canvas/setInteractionMode', // REQUIRED: Prevents zoom issues during drag/drop
  'canvas/toggleInteractionMode', // REQUIRED: Prevents zoom issues during drag/drop
];

const STORAGE_KEY = 'mermaidViewerState';

// Debounce timer to avoid excessive localStorage writes
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500; // 500ms

/**
 * Extracts the persisted state from the full Redux state
 * CRITICAL: interactionMode MUST be extracted to prevent zoom issues
 */
const extractPersistedState = (state: RootState): PersistedState => ({
  diagram: {
    mermaidCode: state.diagram.mermaidCode,
  },
  ui: {
    theme: state.ui.theme,
  },
  canvas: {
    zoom: state.canvas.zoom,
    pan: state.canvas.pan,
    interactionMode: state.canvas.interactionMode, // REQUIRED: Prevents undefined mode causing zoom issues
  },
});

/**
 * Persists state to localStorage with debouncing
 */
const persistState = (state: RootState) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    try {
      const persistedState = extractPersistedState(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch (error) {
      console.error('Failed to persist state to localStorage:', error);
    }
  }, DEBOUNCE_DELAY);
};

/**
 * Redux middleware that persists specific state changes to localStorage
 */
export const persistMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  // Let the action pass through first
  const result = next(action);

  // Check if this action should trigger persistence
  if (PERSISTED_ACTIONS.includes(action.type)) {
    persistState(store.getState());
  }

  return result;
};
