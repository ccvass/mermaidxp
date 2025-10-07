/**
 * Utilidades para debugging del estado del canvas
 */

export interface CanvasDebugInfo {
  zoom: number;
  pan: { x: number; y: number };
  isZoomValid: boolean;
  isPanValid: boolean;
  errors: string[];
}

/**
 * Valida y proporciona información de debugging sobre el estado del canvas
 */
export function debugCanvasState(zoom: any, pan: any): CanvasDebugInfo {
  const errors: string[] = [];

  // Validar zoom
  const isZoomValid = typeof zoom === 'number' && !isNaN(zoom) && zoom > 0;
  if (!isZoomValid) {
    errors.push(`Invalid zoom: ${typeof zoom} ${zoom}`);
  }

  // Validar pan
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
 * Log información de debugging del canvas
 */
export function logCanvasDebug(zoom: any, pan: any, context: string = 'Canvas'): void {
  if (process.env.NODE_ENV !== 'development') return;

  const debug = debugCanvasState(zoom, pan);

  if (debug.errors.length > 0) {
    console.group(`🐛 ${context} Debug Info`);
    console.warn('Errors found:', debug.errors);
    console.groupEnd();
  }
}

/**
 * Sanitiza los valores del canvas para uso seguro
 */
export function sanitizeCanvasValues(zoom: any, pan: any): { zoom: number; pan: { x: number; y: number } } {
  const debug = debugCanvasState(zoom, pan);

  if (debug.errors.length > 0) {
    logCanvasDebug(zoom, pan, 'Sanitize');
  }

  return {
    zoom: debug.zoom,
    pan: debug.pan,
  };
}
