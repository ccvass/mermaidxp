/**
 * Utilities for handling SVG transformations
 */

export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  translate: Point;
  scale: number;
  rotate: number;
}

/**
 * Parse SVG transform attribute to extract translate values
 */
export function getSVGTranslate(element: SVGGraphicsElement): Point {
  const transform = element.getAttribute('transform');
  if (!transform) {
    return { x: 0, y: 0 };
  }

  // Match translate(x, y) or translate(x y)
  const match = /translate\(\s*(-?[\d.eE+-]+)\s*(?:[, ]\s*(-?[\d.eE+-]+))?\s*\)/.exec(transform);
  if (match) {
    const x = parseFloat(match[1]);
    const y = match[2] ? parseFloat(match[2]) : 0;
    return { x, y };
  }

  return { x: 0, y: 0 };
}

/**
 * Set SVG translate transform
 */
export function setSVGTranslate(element: SVGGraphicsElement, point: Point): void {
  const transform = element.getAttribute('transform') || '';

  // Remove existing translate
  const newTransform = transform.replace(/translate\([^)]*\)/g, '').trim();

  // Add new translate
  const translateStr = `translate(${point.x}, ${point.y})`;
  element.setAttribute('transform', newTransform ? `${translateStr} ${newTransform}` : translateStr);
}

/**
 * Apply a transform to a point
 */
export function transformPoint(point: Point, transform: Transform): Point {
  // Apply scale first, then translate
  return {
    x: point.x * transform.scale + transform.translate.x,
    y: point.y * transform.scale + transform.translate.y,
  };
}

/**
 * Inverse transform a point (screen to SVG coordinates)
 */
export function inverseTransformPoint(point: Point, transform: Transform): Point {
  return {
    x: (point.x - transform.translate.x) / transform.scale,
    y: (point.y - transform.translate.y) / transform.scale,
  };
}

/**
 * Get bounding box of an SVG element in viewport coordinates
 */
export function getViewportBBox(element: SVGGraphicsElement, transform: Transform): DOMRect {
  const bbox = element.getBBox();

  const topLeft = transformPoint({ x: bbox.x, y: bbox.y }, transform);
  const bottomRight = transformPoint({ x: bbox.x + bbox.width, y: bbox.y + bbox.height }, transform);

  return new DOMRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
}

/**
 * Check if a point is inside an element's bounding box
 */
export function isPointInElement(point: Point, element: SVGGraphicsElement, transform: Transform): boolean {
  const svgPoint = inverseTransformPoint(point, transform);
  const bbox = element.getBBox();

  return (
    svgPoint.x >= bbox.x &&
    svgPoint.x <= bbox.x + bbox.width &&
    svgPoint.y >= bbox.y &&
    svgPoint.y <= bbox.y + bbox.height
  );
}

/**
 * Calculate the center point of an element
 */
export function getElementCenter(element: SVGGraphicsElement): Point {
  const bbox = element.getBBox();
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamp a point within bounds
 */
export function clampPoint(point: Point, bounds: DOMRect): Point {
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y)),
  };
}

/**
 * Interpolate between two points
 */
export function lerp(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

/**
 * Get the angle between two points in radians
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Rotate a point around an origin
 */
export function rotatePoint(point: Point, origin: Point, angleRad: number): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

/**
 * Parse path data to extract points (simplified for common cases)
 */
export function parsePathPoints(pathData: string): Point[] {
  const points: Point[] = [];
  const commands = pathData.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g);

  if (!commands) return points;

  let currentX = 0;
  let currentY = 0;

  commands.forEach((cmd) => {
    const type = cmd[0];
    const args = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat);

    switch (type.toUpperCase()) {
      case 'M':
      case 'L':
        if (args.length >= 2) {
          currentX = type === type.toUpperCase() ? args[0] : currentX + args[0];
          currentY = type === type.toUpperCase() ? args[1] : currentY + args[1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'H':
        currentX = type === type.toUpperCase() ? args[0] : currentX + args[0];
        points.push({ x: currentX, y: currentY });
        break;
      case 'V':
        currentY = type === type.toUpperCase() ? args[0] : currentY + args[0];
        points.push({ x: currentX, y: currentY });
        break;
      // Add more cases as needed
    }
  });

  return points;
}
