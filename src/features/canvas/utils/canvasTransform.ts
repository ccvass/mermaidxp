import { Transform } from './Transform';
import { logger } from '../../../utils/logger';

/**
 * Apply canvas transformation to an element
 * @param element - The element to transform
 * @param zoom - Zoom level
 * @param pan - Pan offset with x and y coordinates
 */
export function applyCanvasTransform(
  element: HTMLElement | SVGElement,
  zoom: number,
  pan: { x: number; y: number }
): void {
  if (!element) {
    return;
  }

  // Validar y sanitizar parámetros
  const safeZoom = typeof zoom === 'number' && !isNaN(zoom) && zoom > 0 ? zoom : 1;
  const safePan =
    pan &&
    typeof pan === 'object' &&
    typeof pan.x === 'number' &&
    typeof pan.y === 'number' &&
    !isNaN(pan.x) &&
    !isNaN(pan.y)
      ? pan
      : { x: 0, y: 0 };

  try {
    // Create transform and apply it
    const transform = new Transform(safeZoom, safePan.x, safePan.y);

    // Apply to SVG element
    if (element.tagName.toLowerCase() === 'svg') {
      transform.applySVGGroup(element as SVGElement);
    } else {
      // Apply to regular HTML element
      transform.applyToElement(element as HTMLElement);
    }
  } catch (error) {
    logger.error('Error in applyCanvasTransform:', 'canvasTransform', error instanceof Error ? error : undefined);
    // Aplicar transformación por defecto en caso de error
    try {
      const defaultTransform = new Transform(1, 0, 0);
      if (element.tagName.toLowerCase() === 'svg') {
        defaultTransform.applySVGGroup(element as SVGElement);
      } else {
        defaultTransform.applyToElement(element as HTMLElement);
      }
    } catch (fallbackError) {
      logger.error(
        'Error applying fallback transform:',
        'canvasTransform',
        fallbackError instanceof Error ? fallbackError : undefined
      );
    }
  }
}

/**
 * Alternative function that uses Transform directly (deprecated)
 * @deprecated Use applyCanvasTransform instead
 */
export function applyCanvasTransformLegacy(element: HTMLElement | SVGElement, transform: Transform): void {
  if (!element) {
    return;
  }

  if (!transform) {
    return;
  }

  try {
    // Find the SVG root element
    const svgRoot = element.tagName.toLowerCase() === 'svg' ? (element as SVGElement) : element.querySelector('svg');

    if (!svgRoot) {
      return;
    }

    // Apply the transform
    transform.applySVGGroup(svgRoot);
  } catch (error) {
    logger.error('Error in applyCanvasTransformLegacy:', 'canvasTransform', error instanceof Error ? error : undefined);
  }
}

/**
 * Calculate the center point for resetting view
 * @param containerWidth - Width of the container
 * @param containerHeight - Height of the container
 * @param contentWidth - Width of the content at scale 1
 * @param contentHeight - Height of the content at scale 1
 * @param zoom - Current zoom level
 * @returns Pan offset to center the content
 */
export function calculateCenterPan(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  zoom: number = 1
): { x: number; y: number } {
  // Validar parámetros
  const safeContainerWidth = typeof containerWidth === 'number' && containerWidth > 0 ? containerWidth : 800;
  const safeContainerHeight = typeof containerHeight === 'number' && containerHeight > 0 ? containerHeight : 600;
  const safeContentWidth = typeof contentWidth === 'number' && contentWidth > 0 ? contentWidth : 400;
  const safeContentHeight = typeof contentHeight === 'number' && contentHeight > 0 ? contentHeight : 300;
  const safeZoom = typeof zoom === 'number' && zoom > 0 ? zoom : 1;

  const scaledContentWidth = safeContentWidth * safeZoom;
  const scaledContentHeight = safeContentHeight * safeZoom;

  const x = (safeContainerWidth - scaledContentWidth) / 2;
  const y = (safeContainerHeight - scaledContentHeight) / 2;

  return { x, y };
}

/**
 * Get the bounding box of an SVG element
 * @param element - SVG element
 * @returns Bounding box or default values if error
 */
export function getSVGBounds(element: SVGElement): { width: number; height: number; x: number; y: number } {
  try {
    if (!element) {
      return { width: 400, height: 300, x: 0, y: 0 };
    }

    const bbox = (element as any).getBBox();
    return {
      width: bbox.width || 400,
      height: bbox.height || 300,
      x: bbox.x || 0,
      y: bbox.y || 0,
    };
  } catch {
    return { width: 400, height: 300, x: 0, y: 0 };
  }
}
