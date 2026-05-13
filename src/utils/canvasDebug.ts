/**
 * Canvas state debugging utilities
 */

interface CanvasDebugState {
  zoom: number;
  pan: { x: number; y: number };
  isZoomValid: boolean;
  isPanValid: boolean;
  errors: string[];
}

/**
 * Validates and provides debugging information about the canvas state
 */
export function debugCanvasState(zoom: number, pan: { x: number; y: number }): CanvasDebugState {
  const errors: string[] = [];

  // Validate zoom
  const isZoomValid = typeof zoom === 'number' && !isNaN(zoom) && zoom > 0;
  if (!isZoomValid) {
    errors.push(`Invalid zoom: ${typeof zoom} ${zoom}`);
  }

  // Validate pan
  const isPanValid =
    pan &&
    typeof pan === 'object' &&
    typeof pan.x === 'number' &&
    typeof pan.y === 'number' &&
    !isNaN(pan.x) &&
    !isNaN(pan.y);

  if (!isPanValid) {
    errors.push(`Invalid pan: ${typeof pan} ${JSON.stringify(pan)}`);
  }

  return {
    zoom: isZoomValid ? zoom : 1,
    pan: isPanValid ? pan : { x: 0, y: 0 },
    isZoomValid,
    isPanValid,
    errors,
  };
}

/**
 * Log canvas debugging information
 */
export function logCanvasDebug(zoom: number, pan: { x: number; y: number }, context: string = 'Canvas'): void {
  if (process.env.NODE_ENV !== 'development') return;

  const debug = debugCanvasState(zoom as number, pan as { x: number; y: number });

  if (debug.errors.length > 0) {
    console.group(`[DEBUG] ${context} Info`);
    console.groupEnd();
  }
}

/**
 * Sanitizes canvas values for safe usage
 */
export function sanitizeCanvasValues(zoom: unknown, pan: unknown): { zoom: number; pan: { x: number; y: number } } {
  const debug = debugCanvasState(zoom as number, pan as { x: number; y: number });

  if (debug.errors.length > 0) {
    logCanvasDebug(zoom as number, pan as { x: number; y: number }, 'Sanitize');
  }

  return {
    zoom: debug.zoom,
    pan: debug.pan,
  };
}
