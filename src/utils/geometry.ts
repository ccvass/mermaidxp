/**
 * Geometry utilities and types
 *
 * This module provides common geometric types and utilities
 * for working with points, coordinates, and basic geometric operations.
 */

/**
 * Basic 2D point interface
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate the distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle between two points in radians
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
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
 * Add two points
 */
export function add(p1: Point, p2: Point): Point {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

/**
 * Subtract two points
 */
export function subtract(p1: Point, p2: Point): Point {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

/**
 * Scale a point by a factor
 */
export function scale(point: Point, factor: number): Point {
  return {
    x: point.x * factor,
    y: point.y * factor,
  };
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
 * Clamp a point within bounds
 */
export function clampPoint(point: Point, bounds: DOMRect): Point {
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y)),
  };
}

/**
 * Check if two points are equal within tolerance
 */
export function arePointsEqual(p1: Point, p2: Point, tolerance: number = 1e-6): boolean {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

/**
 * Create a point from polar coordinates
 */
export function fromPolar(radius: number, angle: number): Point {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

/**
 * Convert a point to polar coordinates
 */
export function toPolar(point: Point): { radius: number; angle: number } {
  return {
    radius: Math.sqrt(point.x * point.x + point.y * point.y),
    angle: Math.atan2(point.y, point.x),
  };
}
