import { PersistedState } from './middleware/persistMiddleware';
import { RootState } from './index';
// Local DeepPartial helper for TS
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
import { DEFAULT_MERMAID_CODE } from '../constants/diagram.constants';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'mermaidViewerState';

/**
 * Validates the structure of the persisted state
 * CRITICAL: interactionMode validation prevents zoom issues during drag/drop
 */
const isValidPersistedState = (state: unknown): state is PersistedState => {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, Record<string, unknown>>;

  // Validate diagram
  if (!s.diagram || typeof s.diagram !== 'object') return false;
  if (typeof s.diagram.mermaidCode !== 'string') return false;

  // Validate ui
  if (!s.ui || typeof s.ui !== 'object') return false;
  if (s.ui.theme !== 'light' && s.ui.theme !== 'dark') return false;

  // Validate canvas
  if (!s.canvas || typeof s.canvas !== 'object') return false;
  if (typeof s.canvas.zoom !== 'number') return false;
  if (
    !s.canvas.pan ||
    typeof s.canvas.pan !== 'object'
  ) {
    return false;
  }
  const pan = s.canvas.pan as Record<string, unknown>;
  if (typeof pan.x !== 'number' || typeof pan.y !== 'number') {
    return false;
  }
  // CRITICAL: Validate interactionMode to prevent zoom issues
  // When interactionMode is undefined, DiagramDisplay.tsx triggers unwanted zoom changes
  // during drag/drop operations via the "zoom back check" useEffect
  if (
    s.canvas.interactionMode &&
    s.canvas.interactionMode !== 'pan' &&
    s.canvas.interactionMode !== 'drag'
  ) {
    return false;
  }

  return true;
};

/**
 * Loads persisted state from localStorage and validates it
 * Returns a partial state object to be used as preloadedState in the store
 */
export const loadPersistedState = (): DeepPartial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return undefined;

    const parsedState = JSON.parse(serializedState);

    if (!isValidPersistedState(parsedState)) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }

    // Use default code if persisted code is empty
    const mermaidCode = parsedState.diagram.mermaidCode.trim() || DEFAULT_MERMAID_CODE;

    // Return the persisted state as a partial RootState
    return {
      diagram: {
        mermaidCode,
        // Other diagram properties will use their initial values
      },
      ui: {
        theme: parsedState.ui.theme,
        // Other ui properties will use their initial values
      },
      canvas: {
        zoom: parsedState.canvas.zoom,
        pan: parsedState.canvas.pan,
        // CRITICAL: interactionMode MUST be restored to prevent zoom issues during drag/drop
        // MODES DOCUMENTATION:
        // 'pan' = MOUSE MODE (🖱️) = DEFAULT = Moves the ENTIRE diagram/canvas
        // 'drag' = HAND MODE (✋) = Moves INDIVIDUAL elements within the diagram
        // PERMANENTLY FORCE 'pan' mode by default - NEVER CHANGE THIS AGAIN
        interactionMode: 'pan', // ALWAYS START IN MOUSE MODE - DO NOT CHANGE
        // Other canvas properties will use their initial values
      },
    };
  } catch (error) {
    logger.error('Failed to load persisted state:', 'loadPersistedState', error instanceof Error ? error : undefined);
    // If there's an error, remove the corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal errors
    }
    return undefined;
  }
};

/**
 * Clears the persisted state from localStorage
 * Useful for testing or resetting the application
 */
export const clearPersistedState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.error('Failed to clear persisted state:', 'loadPersistedState', error instanceof Error ? error : undefined);
  }
};
